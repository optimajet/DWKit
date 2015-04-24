using System.Web.Mvc;

namespace Admin.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            return Redirect("/MetadataEntity");
            //return View();
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