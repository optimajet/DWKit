using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    /// <summary>
    /// Класс для выборки данных для информационных панелей.
    /// Текст запросов перечислен в классе, т.к. позже должен быть перенесён в метаданные
    /// </summary>
    public class InfoService
    {
//        public static IEnumerable<dynamic> AgreementMyDocument(int count)
//        {
//            var filterContract = FilterCriteriaSet.Empty;
//            var cRes = (new ExternalMethodCallExecutorForView("Contract")).CallAdditionalFilter(MetadataRepositoty.GetEntityMetadata("Contract"), EntityOperationType.ServerCall, string.Empty, ref filterContract);
            
//            var filterLimitsRedistribution = FilterCriteriaSet.Empty;
//            var lrRes = (new ExternalMethodCallExecutorForView("LimitsRedistribution")).CallAdditionalFilter(MetadataRepositoty.GetEntityMetadata("LimitsRedistribution"), EntityOperationType.ServerCall, string.Empty, ref filterLimitsRedistribution);

//            var filterBillDemand = FilterCriteriaSet.Empty;
//            var bRes = (new ExternalMethodCallExecutorForView("BillDemand")).CallAdditionalFilter(MetadataRepositoty.GetEntityMetadata("BillDemand"), EntityOperationType.ServerCall, string.Empty, ref filterBillDemand);
             
//            if (!bRes.Sucess || !lrRes.Sucess || !cRes.Sucess)
//            {
//                return null;
//            }

//            StringBuilder sb = new StringBuilder();
//            sb.AppendFormat(@"SELECT TOP {0}
//obj.Id,
//obj.FormName,
//obj.Title,
//obj.[Desc],
//cl.StateName,
//cl.Date
//FROM(
//	 select t1.BillDemandId as ProcessId, t1.Date, t1.StateName from CoordinationList t1 WITH(NOLOCK)	 
//	 WHERE t1.Date is not null AND t1.StateFrom NOT IN ('Active','Agreed','Denied','Draft','Paid') AND t1.Date = (select MAX(Date) from CoordinationList t2
//						where t1.BillDemandId = t2.BillDemandId AND t1.StateName = t2.StateName )) cl
//INNER join 
//	(		
//		select c.Id, 'Contract_Edit' as FormName, 'Договор ID-' + CAST(c.NumberId as nvarchar(100)) + ' №' + c.Number + ' от ' + CONVERT(nvarchar(100), c.Date, 104) as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from Contract c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFEStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFEEmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//        WHERE c.IsDeleted = 0 {1}
//
//		UNION ALL
//	
//		select c.Id, 'LimitsRedistribution_Edit' as FormName, 'Перераспределение ID-' + CAST(c.NumberId as nvarchar(100)) + ' на сумму:' + CAST(c.Sum as nvarchar(100)) + ' (RUB)' as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from LimitsRedistribution c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFEStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFEEmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//        WHERE c.IsDeleted = 0 AND {2}
//
//		UNION ALL
//	
//		select c.Id, 'BillDemandDispatcher' as FormName, 'Заявка ID-' + CAST(c.Number as nvarchar(100)) + ' на сумму:' + CAST(c.PaymentAmount as nvarchar(100)) + ' (' + currency.SymbolCode + ')' as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from BillDemand c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFRStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFREmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//		LEFT JOIN Currency currency on c.PaymentCurrencyId = currency.Id
//        WHERE c.IsDeleted = 0 AND {3}
//
//	) obj on obj.Id = cl.ProcessId
//ORDER BY cl.Date", count, 
//                 filterContract == FilterCriteriaSet.Empty ? "" : "AND " + filterContract.ToString("c"), 
//                 filterLimitsRedistribution.ToString("c"), 
//                 filterBillDemand.ToString("c"));

//            return DynamicRepository.GetByQuery(sb.ToString());
//        }

//        public static IEnumerable<dynamic> MyInbox(int count)
//        {    
//            StringBuilder sb = new StringBuilder();
//            sb.AppendFormat(@"SELECT TOP {0}
//wi.IdentityId,
//wi.ProcessId,
//obj.FormName,
//obj.Title,
//obj.[Desc],
//cl.StateName,
//cl.Date
//FROM WorkflowInbox wi
//INNER JOIN (
//	 select t1.BillDemandId as ProcessId, t1.Date, t1.StateName from CoordinationList t1 WITH(NOLOCK)	 
//	 WHERE t1.Date is not null AND t1.StateFrom NOT IN ('Active','Agreed','Denied','Draft','Paid') AND t1.Date = (select MAX(Date) from CoordinationList t2
//						where t1.BillDemandId = t2.BillDemandId AND t1.StateName = t2.StateName )) cl on cl.ProcessId = wi.ProcessId
//INNER join 
//	(		
//		select c.Id, 'Contract_Edit' as FormName, 'Договор ID-' + CAST(c.NumberId as nvarchar(100)) + ' №' + c.Number + ' от ' + CONVERT(nvarchar(100), c.Date, 104) as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from Contract c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFEStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFEEmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//        WHERE c.IsDeleted = 0
//
//		UNION ALL
//	
//		select c.Id, 'LimitsRedistribution_Edit' as FormName, 'Перераспределение ID-' + CAST(c.NumberId as nvarchar(100)) + ' на сумму:' + CAST(c.Sum as nvarchar(100)) + ' (RUB)' as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from LimitsRedistribution c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFEStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFEEmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//        LEFT JOIN BudgetVersion bv on bv.Id = c.BudgetVersionId
//        WHERE c.IsDeleted = 0  AND bv.BudgetId = '{2}'
//
//		UNION ALL
//	
//		select c.Id, 'BillDemandDispatcher' as FormName, 'Заявка на расход ID-' + CAST(c.Number as nvarchar(100)) + ' на сумму:' + CAST(c.PaymentAmount as nvarchar(100)) + ' (' + currency.SymbolCode + ')' as Title,
//		bu.Name + ' - ' + sd.Name + '(' + sd.Code + ') <br/>' + st.Name + ' тел.:' + isnull(CAST(e.OfficePhone as nvarchar(50)), '<не указан>')  + ' email:' + isnull(e.EMail, '<не указан>') as [Desc]
//		from BillDemand c
//		LEFT JOIN BusinessUnit bu on c.BusinessUnitId = bu.Id
//		LEFT JOIN StructDivision sd on c.CFRStructDivisionId = sd.Id
//		LEFT JOIN Employee e on e.Id = c.CFREmployeeId
//		LEFT JOIN SecurityTrustee st on st.Id = e.SecurityTrusteeId
//		LEFT JOIN Currency currency on c.PaymentCurrencyId = currency.Id
//        WHERE c.IsDeleted = 0 AND c.BudgetId = '{2}'
//
//	) obj on obj.Id = wi.ProcessId
//WHERE wi.IdentityId = '{1}'
//ORDER BY cl.Date", count, CommonSettings.CurrentEmployee.SecurityUserId, CommonSettings.CurrentBudget.Id);

//            return DynamicRepository.GetByQuery(sb.ToString());
//        }

        public static dynamic InboxCount()
        {
            var employee = CommonSettings.CurrentEmployee;
            if (employee == null)
                return null;
            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("dbo.InfoServiceGetCurrentParam '{0}', '{1}', '{2}'", 
                employee.Id, CommonSettings.CurrentBudgetVersion.BudgetId, CommonSettings.CurrentBudgetVersion.Id);

            var item = DynamicRepository.GetByQuery(sb.ToString()).FirstOrDefault();            
            return item;
        }
    }
}
