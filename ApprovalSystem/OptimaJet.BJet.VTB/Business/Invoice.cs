using OptimaJet.BJet.VTB.Calculation;
using OptimaJet.Common;
using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.DataProvider;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Localization;
using OptimaJet.Security.Providers;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace OptimaJet.BJet.VTB
{
    public enum InvoiceStatus: byte
    {
        Draft = 0,
        Paid = 10
    }
    public class Invoice
    {
        public static string ToState(Guid id, byte state)
        {
            var item = DynamicRepository.GetByView("Invoice_Edit", FilterCriteriaSet.And.Equal(id, "Id")).FirstOrDefault();
            if (item == null)
                throw new Exception("Record not found!");

            if (state == (byte)InvoiceStatus.Paid)
            {
                var itemAllocation = DynamicRepository.GetByView("InvoiceAllocation", FilterCriteriaSet.And.Equal(id, "InvoiceId"));
                var itemDetail = DynamicRepository.GetByView("InvoiceBudgetItem", FilterCriteriaSet.And.Equal(id, "InvoiceId"));
                var itemExpense = DynamicRepository.GetByView("InvoiceExpense", FilterCriteriaSet.And.Equal(id, "InvoiceId"));

                string error = Validate(item, itemDetail, itemAllocation, itemExpense);

                if (!string.IsNullOrWhiteSpace(error))
                {
                    return error;
                }
            }

            item.State = (byte)state;
            DynamicRepository.UpdateByView("Invoice_Edit", new List<dynamic>() { item });

            var budgetItemIds =
                DynamicRepository.GetByEntity("InvoiceBudgetItem", FilterCriteriaSet.And.Equal(id, "InvoiceId"))
                    .Select(ibi =>(Guid) ibi.BudgetItemId).Distinct().ToList();
            
            if (budgetItemIds.Any())
                VtbRestCalculator.Calc.RecalculateAccount(budgetItemIds, id);

            return string.Empty;
        }

        private static string Validate(dynamic item, List<dynamic> itemDetail, List<dynamic> itemAllocation, List<dynamic> itemExpense)
        {
            string error = string.Empty;

            var sum = (decimal?)item.Amount;
            var sumDetail = itemDetail.Sum(c => (decimal?)c.Amount);
            var sumWeigth = itemAllocation.Sum(c => (float?)c.Weight);
            var sumExpense = itemExpense.Sum(c => (decimal?)c.Amount + (decimal?)c.AmountCAPEX);

            if(sum != sumDetail)
            {
                error = "Amount in USD with VAT not equal sum of plan budget items!";  
            }
            else if (sumWeigth != 100)
            {
                error = string.Format("Overall percentage in Allocation breakdown is not 100% (currently {0}%)!", sumWeigth);
            }
            else if (sum != sumExpense)
            {
                error = "Amount in USD with VAT not equal sum of expense!";
            }

            if (string.IsNullOrWhiteSpace(error))
                return string.Empty;
            return OptimaJet.Localization.LocalizationProvider.Provider.Get(error);
        }

        #region Expense
        public static List<dynamic> ExpenseUpdate(DateTime date, float vat, JsonArrayObjects jsonAllocation, JsonArrayObjects jsonExpense)
        {
            DictionaryToDynamicMapper mapperAllocation = new DictionaryToDynamicMapper("InvoiceAllocation");
            var allocation = mapperAllocation.Map(jsonAllocation.Select(c => c.ToDictionary(k => k.Key, k => (object)k.Value)));

            var expenses = jsonExpense != null ?
                (new DictionaryToDynamicMapper("InvoiceExpense")).Map(jsonExpense.Select(c => c.ToDictionary(k => k.Key, k => (object)k.Value))).ToList() :
                new List<dynamic>();

            #region Capex
            expenses.ForEach(c => c.AmountCAPEX = 0);

            var accounts = DynamicRepository.GetByView("AccountCode", FilterCriteriaSet.And.In(
                allocation.Where(c=>c.capexopex == 0).Select(c => (Guid)c.AccountCodeId).Distinct().ToList(), "Id"));

            foreach (dynamic item in allocation.Where(c => c.CapexOpex == 0))
            {
                int usefulLife = accounts.Where(c => c.Id == item.AccountCodeId).Select(c => c.UsefulLife).FirstOrDefault() ?? 0;
                ExpenseUpdateAddCapex(expenses, item.Amount, vat, date, usefulLife);
            }

            ExpenseRound(expenses, allocation, true);
            #endregion

            #region Opex

            decimal amountOpexAllocation = allocation.Where(c => c.CapexOpex == 1).Sum(c => (decimal)c.Amount);
            ExpenseUpdateSyncOpex(expenses, amountOpexAllocation, date);
            ExpenseRound(expenses, allocation, false);
            
            #endregion

            expenses.RemoveAll(c => c.Amount == 0 && c.AmountCAPEX == 0);

            return expenses;
        }
       
        private static void ExpenseUpdateAddCapex(List<dynamic> expenses, decimal amount, float vat, DateTime date, int usefulLife)
        {
            DateTime dt = (new DateTime(date.Year, date.Month, 1)).AddMonths(1);
            var usefulLifeMonth = usefulLife * 12;
            if (usefulLifeMonth == 0)
                usefulLifeMonth = 1;

            decimal sumVAT = Math.Round((amount * (decimal)vat) / (1 + (decimal)vat), 2);
            decimal sumIteration = (amount - sumVAT) / (decimal)usefulLifeMonth;

            for (int i = 0; i < usefulLifeMonth; i++)
            {
                var item = expenses.Where(c => c.Date.Year == dt.Year && c.Date.Month == dt.Month).FirstOrDefault();

                if (item == null)
                {
                    item = DynamicRepository.NewByView("InvoiceExpense");
                    item.Date = dt;
                    item.Amount = 0;
                    item.AmountCAPEX = 0;
                    expenses.Add(item);
                }

                var sum = sumIteration;

                if (i == 0)
                {
                    sum += sumVAT;
                }
                item.AmountCAPEX += sum;
                dt = dt.AddMonths(1);
            }
        }

        private static void ExpenseUpdateSyncOpex(List<dynamic> expenses, decimal amount, DateTime date)
        {
            expenses.Where(c=> c.Amount < 0).ToList().ForEach(c => c.Amount = 0);

            if (amount == 0)
            {
                expenses.ForEach(c => c.Amount = 0);
                return;
            }

            var oldSum = expenses.Sum(c => (decimal)c.Amount);
            if (oldSum == 0)
            {
                DateTime dt = (new DateTime(date.Year, date.Month, 1)).AddMonths(1);
                var item = expenses.Where(c => c.Date.Year == dt.Year && c.Date.Month == dt.Month).FirstOrDefault();
                if (item == null)
                {
                    item = DynamicRepository.NewByView("InvoiceExpense");
                    item.Date = dt;
                    item.Amount = 0;
                    item.AmountCAPEX = 0;
                    expenses.Add(item);
                }

                item.Amount += amount;
            }
            else if(oldSum != amount)
            {
                var delta = amount / oldSum;

                foreach(var item in expenses.Where(c=> c.Amount > 0))
                {
                    item.Amount = delta * item.Amount;
                }
            }
        }

        private static void ExpenseRound(List<dynamic> expenses, IEnumerable<dynamic> allocation, bool forCapex)
        {
            if (forCapex)
            {
                foreach (var item in expenses.Where(c => c.AmountCAPEX > 0))
                    item.AmountCAPEX = Math.Round((decimal)item.AmountCAPEX, 2);

                var firstItem = expenses.Where(c => c.AmountCAPEX > 0).OrderByDescending(c => (DateTime)c.Date).FirstOrDefault();
                if (firstItem != null)
                {
                    decimal sum = expenses.Sum(c => (decimal)c.AmountCAPEX);
                    decimal sumAllocation = allocation.Where(c => c.CapexOpex == 0).Sum(c => (decimal)c.Amount);
                    firstItem.AmountCAPEX += Math.Round(sumAllocation, 2) - Math.Round(sum, 2);
                }
            }
            else
            {
                foreach (var item in expenses.Where(c => c.Amount > 0))
                    item.Amount = Math.Round((decimal)item.Amount, 2);

                decimal sum = expenses.Sum(c => (decimal)c.Amount);
                decimal sumAllocation = allocation.Where(c => c.CapexOpex == 1).Sum(c => (decimal)c.Amount);
                decimal deltaOpex = Math.Round(sumAllocation, 2) - Math.Round(sum, 2);
                if (deltaOpex != 0)
                {
                    var firstItem = expenses.Where(c => c.Amount > deltaOpex).OrderBy(c => (DateTime)c.Date).FirstOrDefault();
                    if (firstItem != null)
                    {
                        firstItem.Amount -= deltaOpex;
                    }
                }
            }
        }

        #endregion
    }
}
