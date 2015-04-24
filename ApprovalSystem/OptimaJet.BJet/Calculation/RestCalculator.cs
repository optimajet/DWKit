using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Security.Permissions;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;

namespace OptimaJet.BJet.Calculation
{
    public class Period
    {
        public Period(object id, int order, string alias)
        {
            Order = order;
            Id = id;
            Alias = alias;
        }

        public object Id { get; private set; }
        public int Order { get; private set; }
        public string Alias { get; private set; }
    }

    public class CalculationObjectType
    {
        /// <summary>
        /// Лимит, Заявка, BudgetItem
        /// </summary>
        public static  CalculationObjectType Account = new CalculationObjectType();
        /// <summary>
        /// BillDemand, Invoice
        /// </summary>
        public static CalculationObjectType ExternalTransaction = new CalculationObjectType();
        /// <summary>
        /// DemandAdjustment
        /// </summary>
        public static CalculationObjectType InternalTransaction = new CalculationObjectType();
    }

    public abstract class CalculationObject
    {
   
        public abstract CalculationObjectType Type { get;}

        public abstract string EntityName { get; }
        public abstract string DetailEntityName { get; }
        public abstract string EntitySearchProperty { get; }
        public abstract string DetailSearchProperty { get; }

        public abstract string PeriodProperty { get;  }

        public abstract string EntityIdPropertyInDetail { get; }

    }

    public abstract class ExternalTransactionObject : CalculationObject
    {
        public override CalculationObjectType Type
        {
            get { return CalculationObjectType.ExternalTransaction; }
        }

      
    }

    public abstract class InternalTransactionObject : CalculationObject
    {
        public override CalculationObjectType Type
        {
            get { return CalculationObjectType.InternalTransaction; }

        }

       
    }

    /// <summary>
    /// Demand, BudgetItem, Limit итд
    /// </summary>
    public abstract class AccountObject : CalculationObject
    {
        public override CalculationObjectType Type
        {
            get { return CalculationObjectType.Account; }
        }

        public abstract string RestEntityName { get; }
        public abstract string RestEntityPeriodProperty { get; }

        public abstract string RestEntitySearchProperty { get; }
    }


    public abstract class RestObject
    {
        public abstract string EntityName { get; }


    }


    public abstract class RestCalculator
    {
        public int RetryCount { get; set; }

        public int LimitLockWaitForRecalc { get; set; }

        public int LimitLockWaitForCheck { get; set; }

        protected RestCalculator(ILocker<Guid, Guid> locker, AccountObject accountObject,
            ExternalTransactionObject externalTransactionObject, InternalTransactionObject internalTransactionObject,
            List<Period> periods)
        {
            Locker = locker;
            AccountObject = accountObject;
            ExternalTransactionObject = externalTransactionObject;
            InternalTransactionObject = internalTransactionObject;
            Periods = periods;
            RetryCount = 3;
            LimitLockWaitForRecalc = 100;
            LimitLockWaitForCheck = 10;
        }

        public ILocker<Guid, Guid> Locker { get; private set; }
        public AccountObject AccountObject { get; private set; }
        public ExternalTransactionObject ExternalTransactionObject { get; private set; }
        public InternalTransactionObject InternalTransactionObject { get; private set; }
        public List<Period> Periods { get; private set; }

        public RecalculationReport RecalculateAccount(List<Guid> ids, Guid processId, string periodAlias = null)
        {
            return RecalculateAccount(ids, processId, periodAlias, 0);
        }

        public RecalculationReport RecalculateAccount(FilterCriteriaSet filter, Guid processId, string periodAlias = null)
        {
            return RecalculateAccount(filter, processId, periodAlias, 0);
        }

        public RecalculationReport RecalculateAccountByDelta(List<RecalculateRequestDelta> requests, Guid processId)
        {
            return RecalculateAccountByDelta(requests, processId, 0);
        }

        public CheckReport Check(List<CheckRequest> requests, Guid processId)
        {
            var ids = requests.Select(r => r.Id).ToList();
            var rests = GetRests(ids);
            var result = CheckResult.Success;
            try
            {
                foreach (var checkRequest in requests)
                {
                    if (!Locker.TryLock(checkRequest.Id, processId))
                    {
                        result = CheckResult.LimitBlocked;
                        break;
                    }
                    var period =
                        Periods.FirstOrDefault(
                            p => p.Alias.Equals(checkRequest.PeriodAlias, StringComparison.InvariantCultureIgnoreCase));


                    var rest =
                        rests.FirstOrDefault(
                            r =>
                                period != null &&
                                ((r as DynamicEntity).GetProperty(AccountObject.RestEntitySearchProperty)
                                    .Equals(checkRequest.Id) &&
                                 (r as DynamicEntity).GetProperty(AccountObject.RestEntityPeriodProperty)
                                     .Equals(period.Id)));

                    if (rest == null)
                    {
                        result = CheckResult.RestNotFound;
                        break;
                    }

                    result = Check(rest, checkRequest);

                    if (result != CheckResult.Success)
                        break;

                }
            }
            finally
            {
                ids.ForEach(id => Locker.Unlock(id, processId));
            }

            return new CheckReport() {Result = result};
        }


        protected RecalculationReport RecalculateAccount(FilterCriteriaSet filter, Guid processId, string periodAlias,
            int attemptNumber)
        {
            var report = new RecalculationReport();

            List<Guid> idsToRecalc = null;

            var period =
                Periods.FirstOrDefault(p => p.Alias.Equals(periodAlias, StringComparison.InvariantCultureIgnoreCase));

            var accounts = GetAccounts(filter, period);

            var ids = accounts.Item1.Select(a => (Guid) (a as DynamicEntity).GetId()).ToList();

            try
            {
                idsToRecalc = ids.Where(id => Locker.TryLock(id, processId)).ToList();

                report.NotCalculatedDueToLock.AddRange(ids.Where(id => !idsToRecalc.Contains(id)));


                var etran = GetCalculationObjects(ids, period, CalculationObjectType.ExternalTransaction);
                var itran = GetCalculationObjects(ids, period, CalculationObjectType.InternalTransaction);

                var res = Recalc(accounts, etran, itran);

                foreach (var resItem in res)
                {
                    DynamicRepository.UpdateByEntity(resItem.Item1, resItem.Item2);
                }

                AfterRecalc(accounts.Item1);

            }
            finally
            {
                if (idsToRecalc != null) idsToRecalc.ForEach(id => Locker.Unlock(id, processId));
            }

            if (attemptNumber < RetryCount && report.NotCalculatedDueToLock.Any())
            {
                Thread.Sleep(LimitLockWaitForRecalc);
                return RecalculateAccount(report.NotCalculatedDueToLock, processId, periodAlias, attemptNumber + 1);
            }

            return report;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ids"></param>
        /// <param name="processId"></param> 
        /// <param name="periodAlias"></param>
        /// <param name="attemptNumber">Номер попытки</param>
        /// <returns></returns>
        protected RecalculationReport RecalculateAccount(List<Guid> ids, Guid processId, string periodAlias,
            int attemptNumber)
        {
            var report = new RecalculationReport();

            List<Guid> idsToRecalc = null;

            var period =
                Periods.FirstOrDefault(p => p.Alias.Equals(periodAlias, StringComparison.InvariantCultureIgnoreCase));

            try
            {
                idsToRecalc = ids.Where(id => Locker.TryLock(id, processId)).ToList();

                report.NotCalculatedDueToLock.AddRange(ids.Where(id => !idsToRecalc.Contains(id)));

                var accounts = GetCalculationObjects(ids, period, CalculationObjectType.Account);
                var etran = GetCalculationObjects(ids, period, CalculationObjectType.ExternalTransaction);
                var itran = GetCalculationObjects(ids, period, CalculationObjectType.InternalTransaction);

                var res = Recalc(accounts, etran, itran);

                foreach (var resItem in res)
                {
                    DynamicRepository.UpdateByEntity(resItem.Item1, resItem.Item2);
                }

                AfterRecalc(accounts.Item1);

            }
            finally
            {
                if (idsToRecalc != null) idsToRecalc.ForEach(id => Locker.Unlock(id, processId));
            }

            if (attemptNumber < RetryCount && report.NotCalculatedDueToLock.Any())
            {
                Thread.Sleep(LimitLockWaitForRecalc);
                return RecalculateAccount(report.NotCalculatedDueToLock, processId, periodAlias, attemptNumber + 1);
            }

            return report;

        }


        protected RecalculationReport RecalculateAccountByDelta(List<RecalculateRequestDelta> requests, Guid processId, int attemptNumber)
        {
            var report = new RecalculationReport();

            List<Guid> idsToRecalc = null;

            var ids = requests.Select(r => r.AccountId).Distinct().ToList();

            try
            {
                idsToRecalc = ids.Where(id => Locker.TryLock(id, processId)).ToList();

                report.NotCalculatedDueToLock.AddRange(ids.Where(id => !idsToRecalc.Contains(id)));


                var accounts = GetCalculationObjects(idsToRecalc, null, CalculationObjectType.Account);

                foreach (var idToRecalc in idsToRecalc)
                {
                    var entity =
                        accounts.Item1.FirstOrDefault(
                            e => (e as DynamicEntity).GetProperty(AccountObject.EntitySearchProperty).Equals(idToRecalc));

                    if (entity == null)
                        continue;

                    var details =
                        accounts.Item2.Where(
                            e => (e as DynamicEntity).GetProperty(AccountObject.DetailSearchProperty).Equals(idToRecalc))
                            .ToList();

                    var recalc = idToRecalc;
                    var selectedRequests = requests.Where(r => r.AccountId.Equals(recalc)).ToList();

                    if (selectedRequests.Any())
                    {
                        var res = RecalcByDelta(entity, details, selectedRequests);

                        foreach (var resItem in res)
                        {
                            DynamicRepository.UpdateByEntity(resItem.Item1, resItem.Item2);
                        }

                        AfterRecalc(new List<dynamic> { entity });
                    }

                }

          
            } 
            finally
            {
                if (idsToRecalc != null) idsToRecalc.ForEach(id => Locker.Unlock(id, processId));
            }

            if (attemptNumber < RetryCount)
            {
               
                var notCalculatedRequests = requests.Where(r => !idsToRecalc.Contains(r.AccountId)).ToList();
                if (notCalculatedRequests.Any())
                {
                    Thread.Sleep(LimitLockWaitForRecalc);
                    return RecalculateAccountByDelta(notCalculatedRequests, processId, attemptNumber + 1);
                }
            }

            return report;

        }

        protected Tuple<List<dynamic>, List<dynamic>> GetAccounts(FilterCriteriaSet filter, Period period)
        {
                List<dynamic> details;
             
                List<dynamic> entities = DynamicRepository.GetByEntity(AccountObject.EntityName, filter);

                if (!AccountObject.EntityName.Equals(AccountObject.DetailEntityName, StringComparison.InvariantCultureIgnoreCase))
                {
                    var filterForDetails =
                        FilterCriteriaSet.And.In(entities.Select(e => (Guid) (e as DynamicEntity).GetId()).ToList(),
                            AccountObject.DetailSearchProperty);

                    if (period != null && !string.IsNullOrEmpty(AccountObject.PeriodProperty))
                    {
                        filterForDetails = filterForDetails.Equal(period.Id, AccountObject.PeriodProperty);
                    }

                    details = DynamicRepository.GetByEntity(AccountObject.DetailEntityName, filterForDetails);
                }
                else
                {
                    details = entities;
                }

                return new Tuple<List<dynamic>, List<dynamic>>(entities, details);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ids"></param>
        /// <param name="period"></param>
        /// <param name="type"></param>
        /// <returns>Список сущностей, список детализаций</returns>
        protected Tuple<List<dynamic>,List<dynamic>>  GetCalculationObjects(List<Guid> ids,  Period period, CalculationObjectType type)
        {
            CalculationObject co = null;

            if (type == CalculationObjectType.Account)
            {
                co = AccountObject;
            }
            else if (type == CalculationObjectType.ExternalTransaction)
            {
                 co = ExternalTransactionObject;
            }
            else if (type == CalculationObjectType.InternalTransaction)
            {
                 co = InternalTransactionObject;
            }

            if (co == null)
            {
                return null;
            }

            List<dynamic> details;
            List<dynamic> entities;

            if (type == CalculationObjectType.Account)
            {

                var filterForEntity = FilterCriteriaSet.And.In(ids, co.EntitySearchProperty);

                entities = DynamicRepository.GetByEntity(co.EntityName, filterForEntity);

                if (!co.EntityName.Equals(co.DetailEntityName, StringComparison.InvariantCultureIgnoreCase))
                {
                    var filterForDetails = FilterCriteriaSet.And.In(ids, co.DetailSearchProperty);

                    if (period != null && !string.IsNullOrEmpty(co.PeriodProperty))
                    {
                        filterForDetails = filterForDetails.Equal(period.Id, co.PeriodProperty);
                    }

                    details = DynamicRepository.GetByEntity(co.DetailEntityName, filterForDetails);
                }
                else
                {
                    details = entities;
                }
            }
            else
            {
                var filterForDetails = FilterCriteriaSet.And.In(ids, co.DetailSearchProperty);

                if (period != null && !string.IsNullOrEmpty(co.PeriodProperty))
                {
                    filterForDetails = filterForDetails.Equal(period.Id, co.PeriodProperty);
                }

                details = DynamicRepository.GetByEntity(co.DetailEntityName, filterForDetails);

                if (!co.EntityName.Equals(co.DetailEntityName, StringComparison.InvariantCultureIgnoreCase))
                {
                    var filterForEntity =
                        FilterCriteriaSet.And.In(
                            details.Select(d => (d as DynamicEntity).GetProperty(co.EntityIdPropertyInDetail)).ToList(),
                            co.EntitySearchProperty);

                    entities = DynamicRepository.GetByEntity(co.EntityName, filterForEntity);
                }
                else
                {
                    entities = details;
                }
            }

            return new Tuple<List<dynamic>, List<dynamic>>(entities, details);
        }

        protected List<dynamic> GetRests(List<Guid> ids)
        {
            var ao = AccountObject;

            var filterForEntity = FilterCriteriaSet.And.In(ids, ao.RestEntitySearchProperty);

            var entities = DynamicRepository.GetByEntity(ao.RestEntityName, filterForEntity);

            return entities;
        }

        protected abstract List<Tuple<string,List<dynamic>>> Recalc(Tuple<List<dynamic>, List<dynamic>> accounts,
            Tuple<List<dynamic>, List<dynamic>> externalTransactions,
            Tuple<List<dynamic>, List<dynamic>> internalTransactions);

        protected abstract List<Tuple<string, List<dynamic>>> RecalcByDelta(object entity, List<object> details,
            IEnumerable<RecalculateRequestDelta> selectedRequests);
      

        protected abstract CheckResult Check(dynamic rest, CheckRequest request);

        protected abstract void AfterRecalc(List<dynamic> entities);
    }

    public sealed class RecalculationReport
    {
        public List<Guid> NotCalculatedDueToLock = new List<Guid>();
    }

    public sealed class CheckReport
    {
        public CheckResult Result { get; set; } 
    }

    public enum CheckResult
    {
        Success,
        LimitBlocked,
        NotSufficientFunds,
        RestNotFound
    }

    public sealed class CheckRequest
    {
        public Guid Id { get; set; }

        public decimal Sum { get; set; }

        public string PeriodAlias { get; set; }

    }

    public sealed class RecalculateRequestDelta
    {
        public Guid AccountId { get; set; }

        public string PeriodAlias { get; set; }

        public decimal Delta { get; set; }
    }


}
