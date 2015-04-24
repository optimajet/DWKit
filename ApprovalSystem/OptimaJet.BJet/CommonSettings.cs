using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace OptimaJet.BJet
{
    public class CommonSettings
    {

        private static Dictionary<string, Func<object>> _knownParameters =
            new Dictionary<string, Func<object>>()
            {
                {"CurrentBudgetId", () => CurrentBudget.Id},
                {"CurrentBudgetYear", () => CurrentBudget.Name},
                {"CurrentBudgetVersionId", () => CurrentBudgetVersion.Id},
                {"CurrentOrganizationalStructureId", () => CurrentEmployee.OrganizationalStructureId},
                {"CurrentUserId", () => SecurityCache.CurrentUser.Id},
                {"CurrentUserName", () => SecurityCache.CurrentUser.Name},
                {"DateTimeNow", () => DateTime.Now},
                {"DateNow", () => DateTime.Now.Date},
                {"DateNow+1Year", () => DateTime.Now.Date.AddYears(1)},
                {"NextYear", () => DateTime.Now.Year + 1},
                {"CurrentEmployeeId", () => CurrentEmployee.Id},
            };

        public static object GetParam(string param)
        {
            if (_knownParameters.ContainsKey(param))
                return _knownParameters[param].Invoke();
            return null;
        }

        public static bool IsParam(string param)
        {
            return _knownParameters.ContainsKey(param);
        }

        #region Budget & BudgetVersion
        public static dynamic CurrentBudget
        {
            get
            {
                var key = "CurrentBudget";
                if (HttpContext.Current.Items[key] == null)
                {
                    dynamic budget = null;
                    var budgetName = HttpContext.Current.Request.Params["B"];
                    List<dynamic> budgets = null;
                    if (!string.IsNullOrWhiteSpace(budgetName))
                    {
                        budgets = DynamicRepository.GetByEntity("Budget", FilterCriteriaSet.And.Equal(budgetName, "Name"));
                        if (budgets.Count > 0)
                            budget = budgets[0];
                    }
                    else if(Settings.Current.ParamExists("CurrentBudget"))
                    {
                        try
                        {
                            budgets = DynamicRepository.GetByEntity("Budget", FilterCriteriaSet.And.Equal(Settings.Current["CurrentBudget"], "Name"));
                            if (budgets.Count > 0)
                                budget = budgets[0];
                        }
                        catch(Exception ex)
                        {
                            Logger.Log.Error(ex);
                        }
                    }

                    if (budgets == null || budgets.Count == 0)
                    {
                        budgets = DynamicRepository.GetByEntity("Budget", FilterCriteriaSet.And.Equal(DateTime.Now.Year, "Name"));
                        if (budgets.Count == 0)
                        {
                            budgets = DynamicRepository.GetByEntity("Budget");
                        }
                    }

                    if (budgets.Count > 0)
                        budget = budgets[0];

                    HttpContext.Current.Items.Add(key, budget);
                }

                return HttpContext.Current.Items[key];
            }
        }

        public static dynamic CurrentBudgetVersion
        {
            get
            {
                var key = "CurrentBudgetVersion";
                if (HttpContext.Current.Items[key] == null)
                {
                    dynamic budgetVersion = null;
                    dynamic cb = CurrentBudget;
                    if (cb != null)
                    {
                        var budgetVersionName = HttpContext.Current.Request.Params["BV"];
                        List<dynamic> bvs = null;
                        if (!string.IsNullOrWhiteSpace(budgetVersionName))
                        {
                            bvs = DynamicRepository.GetByEntity("BudgetVersion",
                                    FilterCriteriaSet.And.Equal((Guid)cb.Id, "BudgetId").Merge(FilterCriteriaSet.And.Equal(budgetVersionName, "Name")));
                        }

                        if (bvs == null || bvs.Count == 0)
                        {
                            bvs = DynamicRepository.GetByEntity("BudgetVersion",
                                FilterCriteriaSet.And.Equal((Guid)cb.Id, "BudgetId").Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent")));
                        }


                        if (bvs.Count > 0)
                            budgetVersion = bvs[0];

                        HttpContext.Current.Items.Add(key, budgetVersion);
                    }
                }
                return HttpContext.Current.Items[key];
            }
        }
        #endregion

        #region Employee
        public static ImpersonationInfo ImpersonationInfo
        {
            get
            {
                var key = "ImpersonationInfo";
                if (HttpContext.Current.Items[key] == null)
                {
                    var impUserStr = HttpContext.Current.Request.Params["ImpUser"];
                    Guid impUserId;
                    if (!string.IsNullOrWhiteSpace(impUserStr) && Guid.TryParse(impUserStr, out impUserId))
                    {
                        var imps = SecurityUserImpersonation.GetImpersonationForUser(SecurityCache.CurrentUser.Id);
                        HttpContext.Current.Items.Add(key, imps.FirstOrDefault(c => c.Id == impUserId));
                    }
                    
                }
                return HttpContext.Current.Items[key] as ImpersonationInfo;
            }
        }

        public static dynamic CurrentEmployee
        {
            get
            {
                if (ImpersonationInfo == null)
                {
                    var key = "CurrentEmployee";
                    if (HttpContext.Current.Items[key] == null)
                    {
                        var budgetId = CurrentBudget.Id;
                        var trusteeId = SecurityCache.CurrentUser.Id;

                        var employee = DynamicRepository.GetByView("Employee",
                                        FilterCriteriaSet.And.Equal(trusteeId, "SecurityUserId")).FirstOrDefault();
                        if (HttpContext.Current.Items.Contains(key))
                            HttpContext.Current.Items[key] = employee;
                        else
                            HttpContext.Current.Items.Add(key, employee);
                    }
                    return HttpContext.Current.Items[key];
                }
                else
                {
                    return ImpersonationInfo.Employee;
                }
            }
        }

        public static List<Guid> CurrentEmployeeChildrenOrganizationalStructures
        {
            get
            {
                var key = "CurrentEmployeeChildrenOrganizationalStructures";
                if (HttpContext.Current.Items[key] == null)
                {
                    const string query = "SELECT [Id] FROM [dbo].[GetChildOrganizationalStructure_fn] (@parentId)";
                    var parameters = new Dictionary<string, object> { { "parentId", (Guid)CurrentEmployee.OrganizationalStructureId } };
                    var result = DynamicRepository.GetByQuery(query, parameters);
                    HttpContext.Current.Items.Add(key, result.Select(r => (Guid)r.Id).ToList());
                }
                return HttpContext.Current.Items[key] as List<Guid>;
            }
        }

        public static List<Guid> CurrentEmployeeParentOrganizationalStructures
        {
            get
            {
                var key = "CurrentEmployeeParentOrganizationalStructures";
                if (HttpContext.Current.Items[key] == null)
                {
                    const string query = "SELECT [Id] FROM [dbo].[GetParentOrganizationalStructure_fn] (@childId)";
                    var parameters = new Dictionary<string, object> { { "childId", (Guid)CurrentEmployee.OrganizationalStructureId } };
                    var result = DynamicRepository.GetByQuery(query, parameters);
                    HttpContext.Current.Items.Add(key, result.Select(r => (Guid)r.Id).ToList());
                }
                return HttpContext.Current.Items[key] as List<Guid>;
            }
        }

        public static List<string> CurrentEmployeeChildrenOrganizationalStructureCodes
        {
            get
            {
                var key = "CurrentEmployeeChildrenOrganizationalStructureCodes";
                if (HttpContext.Current.Items[key] == null)
                {
                    var item =
                        DynamicRepository.GetByEntity("OrganizationalStructure",
                            FilterCriteriaSet.And.In(CurrentEmployeeChildrenOrganizationalStructures, "Id"))
                            .Select(sd => (string)sd.Code)
                            .ToList();

                    HttpContext.Current.Items.Add(key, item);
                }
                return HttpContext.Current.Items[key] as List<string>;
            }
        }

        public static dynamic CurrentDivision
        {
            get
            {
                var key = "CurrentDivision";
                if (HttpContext.Current.Items[key] == null)
                {
                    var employee = CurrentEmployee;
                    if (employee != null)
                    {
                        var sd = DynamicRepository.GetByEntity("OrganizationalStructure", FilterCriteriaSet.And.Equal((Guid)employee.OrganizationalStructureId, "Id")).FirstOrDefault();
                        HttpContext.Current.Items.Add(key, sd);
                    }
                }

                return HttpContext.Current.Items[key];
            }
        }
        #endregion

        public static dynamic Profile
        {
            get
            {
                var key = "Profile";
                if (HttpContext.Current.Items[key] == null)
                {
                    var user = OptimaJet.Security.Providers.SecurityCache.CurrentUser;
                    if (user == null)
                    {
                        return null;
                    }
                    var item = DynamicRepository.GetByView("Profile",
                            FilterCriteriaSet.And.Equal(user.Id, "Id")).FirstOrDefault();

                    HttpContext.Current.Items.Add(key, item);
                }
                return HttpContext.Current.Items[key] as dynamic;
            }
        }
    }
}
