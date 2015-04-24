using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    public class FXRate
    {
        public static double? GetPlanRate(Guid Id, Guid? budgetId = null)
        {
            if(!budgetId.HasValue)
            {
                budgetId = (Guid)CommonSettings.CurrentBudget.Id;
            }

            var filter = FilterCriteriaSet.And.Equal(Id, "CurrencyId");
            filter = filter.Merge(FilterCriteriaSet.And.Equal(budgetId, "BudgetId"));

            var item = DynamicRepository.GetByEntity("FXRatePlan", filter).FirstOrDefault();
            return item == null ? null : (double?)item.Rate;
        }

        public static double? GetRate(Guid Id, DateTime? date)
        {
            if (date == null)
                date = DateTime.Now;

            if (Id == CommonSettings.CurrentBudget.BaseCurrencyId)
                return 1;

            var filter = FilterCriteriaSet.And.Equal(Id, "CurrencyId");
            //filter = filter.Merge(FilterCriteriaSet.And.Custom(string.Format("{0} >= '{1}' AND {0} < '{2}'", "Date", 
            //    date.Value.ToString("yyyy-MM-dd"), date.Value.AddDays(1).ToString("yyyy-MM-dd"))));

            filter = filter.Merge(FilterCriteriaSet.And.Custom(string.Format("{0} >= CONVERT(DATETIME,'{1}', 120) AND {0} < CONVERT(DATETIME,'{2}', 120)", "Date",
                date.Value.ToString("yyyy-MM-dd"), date.Value.AddDays(1).ToString("yyyy-MM-dd"))));

            var item = DynamicRepository.GetByEntity("FXRate", filter).FirstOrDefault();
            return item == null ? null : (double?)item.Rate;
        }
    }
}
