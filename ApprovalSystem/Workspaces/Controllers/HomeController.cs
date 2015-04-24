using OptimaJet.Security.Providers;
using ServiceStack.Text;
using System.Web.Mvc;
using Workspaces.Helpers;

namespace Workspaces.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            if (SecurityCache.CurrentUser == null)
                return Redirect("/Account/Register");

            if (Request.QueryString.Count == 0)
            {
                string url = "/";
                if (Request.Cookies["budget"] != null)
                {
                    url += string.Format("?B={0}", Request.Cookies["budget"].Value);

                    if (Request.Cookies["budgetversion"] != null)
                    {
                        url += string.Format("&BV={0}", Request.Cookies["budgetversion"].Value);
                    }
                    return Redirect(url);
                }
                else if (OptimaJet.BJet.CommonSettings.CurrentBudget != null)
                {
                    url += string.Format("?B={0}", OptimaJet.BJet.CommonSettings.CurrentBudget.Name);
                    return Redirect(url);
                }
           }
           return View("Index");
        }               

        public ActionResult About()
        {
            return View();
        }

        public ActionResult Contact()
        {
            return View();
        }
    }
}