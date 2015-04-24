//using OptimaJet.Security.Providers;
//using System;
//using System.Linq;
//using System.Text;
//using System.Web.Mvc;
//using System.Web.Routing;
//using Workspaces.Controllers;

//namespace Workspaces.Security
//{
//    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
//    public class CheckPermissionAttribute : AuthorizeAttribute
//    {
//        private readonly string groupPermissionCode;
//        private readonly string[] groupPermissionCodes;
//        private readonly string permissionCode;

//        public CheckPermissionAttribute(string permissionCode, string groupPermissionCode, params string[] groupPermissionCodes)
//        {
//            this.groupPermissionCode = groupPermissionCode;
//            this.groupPermissionCodes = groupPermissionCodes;
//            this.permissionCode = permissionCode;
//        }

//        public bool UseRedirect { get; set; }

//        public override void OnAuthorization(AuthorizationContext filterContext)
//        {
//            base.OnAuthorization(filterContext);
//            var isAuthorized = SecurityCache.Provider.CheckPermission(groupPermissionCode, permissionCode);
//            var reportName = filterContext.HttpContext.Request.Params["reportName"];
//            if (!isAuthorized && !String.IsNullOrEmpty(reportName) && ReportController.ReportPermissionsMap.ContainsKey(reportName))
//            {
//                var reportCode = ReportController.ReportPermissionsMap[reportName];
//                var allowedPermissionCode = groupPermissionCodes.FirstOrDefault(x => reportCode == x);
//                isAuthorized = SecurityCache.Provider.CheckPermission(allowedPermissionCode, permissionCode);
//            }
//            if (!isAuthorized)
//            {
//                if (UseRedirect)
//                {
//                    var route = new RouteValueDictionary { { "action", "AccessDenied" }, { "controller", "Report" } };
//                    filterContext.Result = new RedirectToRouteResult(route);
//                }
//                else
//                {
//                    filterContext.Result = new JsonResult
//                        {
//                            ContentEncoding = Encoding.UTF8,
//                            JsonRequestBehavior = JsonRequestBehavior.AllowGet,
//                            Data = new { success = false, message = "Access is denied" }
//                        };
//                }
//            }
//        }
//    }
//}