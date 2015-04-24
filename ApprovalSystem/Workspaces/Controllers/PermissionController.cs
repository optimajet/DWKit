using OptimaJet.Security.Providers;
using System.Web.Mvc;

namespace Workspaces.Controllers
{
    public class PermissionController : Controller
    {
        public ActionResult FormCan(string name, string permission)
        {
            var res = SecurityCache.FormCan(name, permission);
            return Content(res.ToString());
        }

        public ActionResult ViewCan(string name, string permission)
        {
            var res = SecurityCache.ViewCan(name, permission);
            return Content(res.ToString());
        }

        public ActionResult Can(string group, string permission)
        {
            var res = SecurityCache.CheckPermission(group, permission);
            return Content(res.ToString());
        }

    }
}
