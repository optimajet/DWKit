using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    public class BudgetSecurityProvider : SecurityProvider
    {
        public override bool CheckPermission(Guid userId, string groupPermissionCode, string permissionCode)
        {
            if ((!CommonSettings.CurrentBudgetVersion.IsCurrent || CommonSettings.CurrentBudget.Status == 3) && 
                groupPermissionCode != "Form_Budget")
            {
                var blockPermissions = new string[]{
                    "AccessToAdminPanel",
                    "Add",
                    "Delete",
                    "Edit",
                    "Generate",
                    "ImpersonateImport",
                    "SetState",
                    "StartNewPlanCycle",
                    "ChangeManager"
                };

                if (blockPermissions.Contains(permissionCode))
                {
                    return false;
                }
            }

            if ((!CommonSettings.CurrentBudgetVersion.IsCurrent || CommonSettings.CurrentBudget.Status == 2) &&
                groupPermissionCode == "Form_BudgetItem")
            {
                var blockPermissions = new string[]{
                    "Add",
                    "Delete",
                    "Edit"                    
                };

                if (blockPermissions.Contains(permissionCode))
                {
                    return false;
                }
            }

            return base.CheckPermission(userId, groupPermissionCode, permissionCode);
        }
    }
}
