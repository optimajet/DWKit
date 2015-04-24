using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Workspaces.Controllers
{
    public class PanelController : Controller
    {
        //
        // GET: /Panel/

        public ActionResult Header()
        {
            return  PartialView("Panel/Header");
        }

    }
}
