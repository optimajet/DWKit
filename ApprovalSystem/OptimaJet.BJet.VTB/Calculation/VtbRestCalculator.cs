using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using OptimaJet.BJet.Calculation;
using OptimaJet.DynamicEntities.DataProvider;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;

namespace OptimaJet.BJet.VTB.Calculation
{
    public class VtbAccountObject : AccountObject
    {
        public override string EntityName
        {
            get { return "BudgetItem"; }
        }

        public override string DetailEntityName
        {
            get { return "BudgetItem"; }
        }

        public override string EntitySearchProperty
        {
            get { return "Id"; }
        }

        public override string DetailSearchProperty
        {
            get { return "Id"; }
        }

        public override string PeriodProperty
        {
            get { return null; }
        }

        public override string EntityIdPropertyInDetail
        {
            get { return null; }
        }


        public override string RestEntityName
        {
            get { return "BudgetItem"; }
        }

        public override string RestEntityPeriodProperty
        {
            get { return null; }
        }

        public override string RestEntitySearchProperty
        {
            get { return "Id"; }
        }
    }

    public class VtbExternalTransactionObject : ExternalTransactionObject
    {
        public override string EntityName
        {
            get { return "Invoice"; }
        }

        public override string DetailEntityName
        {
            get { return "InvoiceBudgetItem"; }
        }

        public override string EntitySearchProperty
        {
            get { return "Id"; }
        }

        public override string DetailSearchProperty
        {
            get { return "BudgetItemId"; }
        }

        public override string PeriodProperty
        {
            get { return null; }
        }

        public override string EntityIdPropertyInDetail
        {
            get { return "InvoiceId"; }
        }
    }

    public class VtbRestCalculator : RestCalculator
    {
        public VtbRestCalculator()
            : base(
                new InMemoryLocker<Guid, Guid>(), new VtbAccountObject(), new VtbExternalTransactionObject(), null,
                new List<Period> {new Period(null, 0, "year")})
        {
        }

        protected override List<Tuple<string, List<dynamic>>> Recalc(Tuple<List<dynamic>, List<dynamic>> accounts,
            Tuple<List<dynamic>, List<dynamic>> externalTransactions,
            Tuple<List<dynamic>, List<dynamic>> internalTransactions)
        {
            var rates = new Dictionary<Guid, double>();

            var result = new List<Tuple<string, List<dynamic>>>();

            var budgetItems = accounts.Item1;

            var invoiceBudgetItems = externalTransactions.Item2;

            var invoices = externalTransactions.Item1;

            var biSave =  new Tuple<string, List<dynamic>>("BudgetItem", new List<dynamic>());

            result.Add(biSave);

            var budgets = DynamicRepository.GetByEntity("Budget");
            
            foreach (var budgetItem in budgetItems)
            {
                dynamic item = budgetItem;

                var currencyId = (Guid)item.CurrencyId;
                double rate = 0;

                if (rates.ContainsKey(currencyId))
                    rate = rates[currencyId];
                else
                {
                    var res = FXRate.GetPlanRate(currencyId);
                    if (!res.HasValue)
                        throw new Exception(string.Format("Rate with Id = '{0}' not found", currencyId));
                    rate = res.Value;
                    rates.Add(currencyId, rate);
                }

                var amountInUsdWithVat = (decimal)item.AmountWithoutVAT * (decimal)rate * (1 + (decimal)(item.VAT / 100));
                
                //С НДС
                var factSum =
                    invoiceBudgetItems.Where(
                        id =>
                            id.BudgetItemId.Equals(item.Id) &&
                            (id.NextPeriodYear == null || budgets.Any(c => c.Name == id.NextPeriodYear)) &&
                            invoices.Any(i => i.Id.Equals(id.InvoiceId) && i.State == (byte)InvoiceStatus.Paid)).Select(id => (decimal)id.Amount).Sum();

                               
                var residualWithVat = amountInUsdWithVat - factSum;

                var residualWithoutVat = residualWithVat/(1 + (decimal) (item.VAT/100));

                var factWithVat = factSum;

                var factWithoutVat = factWithVat / (1 + (decimal)(item.VAT / 100));

                //if (item.Residual != residualWithVat || item.ResidualWithoutVAT != residualWithoutVat)
                //{
                    item.Residual = residualWithVat;
                    item.ResidualWithoutVAT = residualWithoutVat;
                    item.Fact = factWithVat;
                    item.FactWithoutVAT = factWithoutVat;
                    item.Expense = 0m;
                    item.ExpenseWithoutVAT = 0m;
                    biSave.Item2.Add(item);
                //}
            }

            return result;
        }

        protected override List<Tuple<string, List<dynamic>>> RecalcByDelta(dynamic entity, List<object> details,
            IEnumerable<RecalculateRequestDelta> selectedRequests)
        {
            var budgetItem = entity;
            //details тут не используем поскольку их нету в  данной системе
            var factDelta = selectedRequests.Select(r => r.Delta).Sum();

            var residualWithVat = budgetItem.Residual - factDelta;
            var residualWithoutVat = residualWithVat/(1 + (decimal) (budgetItem.VAT/100));


            //var factWithVat = budgetItem.Fact + factDelta;

            //var factWithoutVat = factWithVat / (1 + (decimal)(budgetItem.VAT / 100));

            budgetItem.Residual = residualWithVat;

            budgetItem.ResidualWithoutVAT = residualWithoutVat;

            //budgetItem.Fact = factWithVat;

            //budgetItem.FactWithoutVat = factWithoutVat;


            var result = new List<Tuple<string, List<dynamic>>>();

            var biSave = new Tuple<string, List<dynamic>>("BudgetItem", new List<dynamic>());

            biSave.Item2.Add(budgetItem);

            result.Add(biSave);

            
            return result;

        }

        protected override CheckResult Check(dynamic rest, CheckRequest request)
        {
            var budgetItem = rest;

            if (budgetItem.Residual >= request.Sum)
                return CheckResult.Success;
            
            return CheckResult.LimitBlocked;
        }

        protected override void AfterRecalc(List<dynamic> entities)
        {
            var ids = entities.Select(e => (Guid) e.Id).ToList();

            if (!ids.Any())
                return;
            
            var idsElement = new XElement("ids");

            ids.ForEach(id=>idsElement.Add(new XElement("id") {Value = id.ToString("D")}));

            var executeSp = string.Format("EXEC [dbo].[SetOverspentFlagToInvoices] '{0}'", idsElement);
            DynamicRepository.GetByQuery(executeSp);

            var executeMismathSp = string.Format("EXEC [dbo].[SetMismatchFlagToInvoices] '{0}'", idsElement);
            DynamicRepository.GetByQuery(executeMismathSp);

        }

        public static void SubscribeOnDynamicEntityNotifications()
        {
             DynamicEntityOperationNotifier.SubscribeUpdate("BudgetItem", "Recalc", OnBudgetItemUpdate);
        }

        private static void OnBudgetItemUpdate(EntityMetadata metadata, List<ChangeOperation> changes)
        {
            //Полный пересчет если поменялись VAT или CurrencyId
            var toFullRecalc = changes.Where(
                i =>
                    i.Data.Any(
                        d => d.PropertyName.Equals("VAT", StringComparison.InvariantCultureIgnoreCase) || d.PropertyName.Equals("CurrencyId", StringComparison.InvariantCultureIgnoreCase)
                        ))
                .Select(i=>(Guid)i.Entity.GetId()).ToList();

            if (toFullRecalc.Any())
                Calc.RecalculateAccount(toFullRecalc, toFullRecalc.First());

            
            var changedAmounts =
                changes.Where(
                    i =>
                        i.Data.Any(
                            d => d.PropertyName.Equals("AmountWithoutVAT", StringComparison.InvariantCultureIgnoreCase)) && !toFullRecalc.Contains((Guid)i.Entity.GetId()))
                    .ToList();

            if (!changedAmounts.Any())
                return;

            var budgetItemIds = changedAmounts.Select(i => (i.Entity as dynamic).Id).Distinct().ToList();

            foreach (var budgetItemId in budgetItemIds)
            {
                Guid id = budgetItemId;

                var budgetItem = changes.First(bi => bi.Entity.GetId().Equals(budgetItemId)).Entity as dynamic;

                var amountToRecalc = changedAmounts.FirstOrDefault(c => (c.Entity as dynamic).Id == id);

                if (amountToRecalc == null)
                    continue;

                
                    var amountChange =
                        amountToRecalc.Data.First(
                            c => c.PropertyName.Equals("AmountWithoutVAT", StringComparison.InvariantCultureIgnoreCase));
               
                var amountChangeWithVATinUSD = -((decimal) amountChange.NewValue - (decimal) amountChange.InitialValue);

                var rate = FXRate.GetPlanRate((Guid)budgetItem.CurrencyId);
                if (rate.HasValue)
                {
                    amountChangeWithVATinUSD = amountChangeWithVATinUSD * (decimal) rate.Value;
                }

                amountChangeWithVATinUSD = amountChangeWithVATinUSD*(1 + (decimal) (budgetItem.VAT/100));

                var recalculateRequestDelta = new RecalculateRequestDelta()
                {
                    AccountId = budgetItemId,
                    Delta = amountChangeWithVATinUSD
                };

                Calc.RecalculateAccountByDelta(new List<RecalculateRequestDelta>() {recalculateRequestDelta},
                    budgetItemId);

            }
        }

        public static readonly VtbRestCalculator Calc = new VtbRestCalculator();

        public  static void InitResidual(dynamic budgetItem)
        {
            var rate = FXRate.GetPlanRate((Guid)budgetItem.CurrencyId);
            if (rate.HasValue)
            {
                budgetItem.Residual = (decimal)budgetItem.AmountWithoutVAT * (decimal)rate.Value * (1 + (decimal)(budgetItem.VAT / 100));
                budgetItem.ResidualWithoutVat = (decimal)budgetItem.AmountWithoutVAT * (decimal)rate.Value;

            }

            budgetItem.Fact = 0;
            budgetItem.FactWithoutVAT = 0;
            budgetItem.Expense = 0;
            budgetItem.ExpenseWithoutVAT = 0;
        }
    }
}
