using System.Data.OleDb;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OptimaJet.BJet
{
    public class BudgetMethods
    {
        public static ExternalMethodCallResult CopyBudgetDictionary(EntityMetadata metadata,
                                                                 Dictionary<string, string> parameters,
                                                                 IEnumerable<DynamicEntity> entities)
        {
            List<string> forms = null;
            List<string> trivialFormsToCopy = null;

            if (parameters.ContainsKey("Forms"))
            {
                forms = parameters["Forms"].Split(',').Select(c => c.Trim()).ToList();
                trivialFormsToCopy = forms.Where(f => !BusinessEntitiesCreations.ContainsKey(f)).ToList();
            }

            foreach (DynamicEntity e in entities)
            {
                var b = new Budget();

                var versions = DynamicRepository.GetByView("BudgetVersion",
                    FilterCriteriaSet.And.Equal(e.GetId(), "BudgetId").Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent")));
                if (versions.Count == 0)
                {
                    var v = DynamicRepository.NewByView("BudgetVersion");
                    v.Id = Guid.NewGuid();
                    v.Name = "1";
                    v.BudgetId = e.GetId();
                    v.IsCurrent = true;
                    DynamicRepository.InsertByView("BudgetVersion", new List<dynamic>() { v }, ExternalMethodsCallMode.None);
                }

                var filters = new Dictionary<string, FilterCriteriaSet>
                {
                    { "ContractForBudgetCopy", FilterCriteriaSet.And.Custom("ContractStatusId = 1") }
                };
                var replaces = b.CopyEntityByForms("BudgetId", CommonSettings.CurrentBudget.Id, e.GetId(), trivialFormsToCopy, filters);

                if (forms == null)
                    continue;

                foreach (var k in BusinessEntitiesCreations.Keys)
                {
                    if (!forms.Any(f => f.Equals(k)))
                        continue;

                    BusinessEntitiesCreations[k].Invoke(e.GetId(), CommonSettings.CurrentBudget.Id, replaces);
                }

            }

            return new ExternalMethodCallResult(true);
        }

        public static ExternalMethodCallResult DeleteBudgetDictionary(EntityMetadata metadata,
                                                                 Dictionary<string, string> parameters,
                                                                 IEnumerable<DynamicEntity> entities)
        {
            ExternalMethodCallResult res = new ExternalMethodCallResult(true);
            List<string> views = null;

            if (parameters.ContainsKey("Views"))
            {
                views = parameters["Views"].Split(',').Select(c => c.Trim()).ToList();
            }

            List<string> forms = null;
            if (parameters.ContainsKey("Forms"))
            {
                forms = parameters["Forms"].Split(',').Select(c => c.Trim()).ToList();
            }

            string budgetColumnName = "BudgetId";
            if (parameters.ContainsKey("Column"))
            {
                budgetColumnName = parameters["Column"];
            }

            foreach (DynamicEntity e in entities)
            {
                if(parameters.ContainsKey("ValidateStoredProcedure"))
                {
                   var paramsIn = new Dictionary<string, object>();
                   paramsIn.Add(budgetColumnName, e.GetId());

                   var paramsOut = new Dictionary<string, object>();
                   paramsOut.Add("ErrorMessage", string.Empty);

                   DynamicRepository.ExecuteSP(parameters["ValidateStoredProcedure"],paramsIn,paramsOut);
                   if (!string.IsNullOrWhiteSpace(paramsOut["ErrorMessage"] as string))
                   {
                       res.AddGlobalError(paramsOut["ErrorMessage"].ToString());
                       res.Sucess = false;
                   }
                }
            }

            if (res.Sucess)
            {
                foreach (DynamicEntity e in entities)
                {
                    Budget b = new Budget();
                    b.DeleteEntityByViews(budgetColumnName, e.GetId(), views);
                    b.DeleteEntityByForms(budgetColumnName, e.GetId(), forms);
                }
            }

            return res;
        }

        /// <summary>
        /// Список методов, создающих бизнес-сущности
        /// </summary>
        public static Dictionary<string, Action<object, object, Dictionary<string, Dictionary<object, object>>>>
            BusinessEntitiesCreations =
                new Dictionary<string, Action<object, object, Dictionary<string, Dictionary<object, object>>>>();
    }
}
