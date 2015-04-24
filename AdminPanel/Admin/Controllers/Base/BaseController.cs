using System.Web.Mvc;
using System.Web;

namespace Admin.Controllers
{
    public class BaseController : Controller
    {
        public bool Readonly { get; set; }
    }
}