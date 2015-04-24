using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet.VTB
{
    public class AllocationModel
    {
        public static IDictionary<string,object>[] GetItems(Guid id)
        {
            return DynamicRepository.GetByView("AllocationModelItem", FilterCriteriaSet.And.Equal(id, "AllocationModelId")).Select(c=> (c as DynamicEntity).Dictionary).ToArray();
        }

        public static IDictionary<string, object>[] GetAllocations(JsonArrayObjects jsonInvoiceBudgetItems)
        {
            List<dynamic> res = new List<dynamic>();

            var invoiceBudgetItems = jsonInvoiceBudgetItems != null ?
               (new DictionaryToDynamicMapper("InvoiceBudgetItem")).Map(jsonInvoiceBudgetItems.Select(c => c.ToDictionary(k => k.Key, k => (object)k.Value))).ToList() :
               new List<dynamic>();

            if (invoiceBudgetItems.Count > 0)
            {
                var budgetItemIds = invoiceBudgetItems.Select(c=> (Guid)c.BudgetItemId).ToList();

                var budgetItems = DynamicRepository.GetByView("BudgetItem", FilterCriteriaSet.And.In(budgetItemIds, "Id"));
                var budgetItemAllocations = DynamicRepository.GetByView("BudgetItemAllocation", FilterCriteriaSet.And.In(budgetItemIds, "BudgetItemId"));

                var sum = invoiceBudgetItems.Sum(c => (double)c.Amount);

                foreach (dynamic bi in budgetItems)
                {
                    var ibiSum = invoiceBudgetItems.Where(c=>c.BudgetItemId == bi.Id).Sum(c => (double)c.Amount);

                    var k = sum != 0 ? (double)ibiSum / sum : 0;
                    foreach (dynamic bia in budgetItemAllocations.Where(c => c.BudgetItemId == bi.Id))
                    {
                        var invoiceAllocation = DynamicRepository.NewByView("InvoiceAllocation");
                        invoiceAllocation.CostCenterId = bia.CostCenterId;
                        invoiceAllocation.CostCenterId_Code = bia.CostCenterId_Code;
                        invoiceAllocation.LegalEntityId = bia.LegalEntityId;
                        invoiceAllocation.LegalEntityId_Name = bia.LegalEntityId_Name;
                        invoiceAllocation.Weight = (double)bia.Weight * k;
                        invoiceAllocation.AccountCodeId = bi.AccountCodeId;
                        invoiceAllocation.AccountCodeId_Name = bi.AccountCodeId_Name;
                        invoiceAllocation.DetailedProjectCode = bi.DetailedProjectCode;
                        invoiceAllocation.ProjectId = bi.ProjectId;
                        invoiceAllocation.ProjectId_Code = bi.ProjectId_Code;
                        invoiceAllocation.ProjectId_Name = bi.ProjectId_Name;
                        invoiceAllocation.CAPEXOPEX = bi.CAPEXOPEX;
                        res.Add(invoiceAllocation);
                    }
                }

                for (int i = 0; i < res.Count - 1; i++)
                {
                    var item = res[i];
                    for (int j = i + 1; j < res.Count; j++)
                    {
                        var item2 = res[j];
                        if (item.CostCenterId == item2.CostCenterId &&
                            item.LegalEntityId == item2.LegalEntityId &&
                            item.AccountCodeId == item2.AccountCodeId &&
                            item.ProjectId == item2.ProjectId &&
                            item.DetailedProjectCode == item2.DetailedProjectCode &&
                            item.CAPEXOPEX == item2.CAPEXOPEX)
                        {
                            item.Weight += item2.Weight;
                            res.RemoveAt(j);
                            j--;
                        }
                    }
                }
            }

            foreach (var item in res)
                item.Weight = Math.Round((double)item.Weight, 2);

            var firstItem = res.OrderByDescending(c => (double)c.Weight).FirstOrDefault();
            if (firstItem != null)
            {
                var w = res.Sum(c => (double)c.Weight);
                firstItem.Weight += 100 - Math.Round(w, 2);
            }

            return res.Select(c => (c as DynamicEntity).Dictionary).ToArray();
        }
    }
}
