using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.View.ExtJs;
using OptimaJet.Workspace;
using System.Linq;
using OptimaJet.Security;
using OptimaJet.BJet;

namespace Workspaces.Controllers
{
    public class WorkspaceController : Controller
    {     
        public ActionResult GetContent(string form, string id)
        {
            var dictionary = Request.QueryString.AllKeys.ToDictionary(key => key, key => Request.QueryString[key]);
            var query = (dictionary.Count > 0 ? "?" + Request.QueryString : "");

            if (id != null)
            {
                if (!dictionary.Keys.Any(k => k.Equals("id", StringComparison.InvariantCultureIgnoreCase)))
                {
                    dictionary.Add("id",id);
                }
            }

            if(CommonSettings.CurrentEmployee == null)
            {
                form = "AccessDenied";
            }

            var wsForm = WsFactory.CreateModel(form, dictionary, query, Request.Url.PathAndQuery);


            EventsLogHelper.WorkspaceEvent(wsForm.Name, wsForm.Caption, Request);
            
            return Content(wsForm.Body);
        }

        public ActionResult GenerateMainToolbar(string name, string parentRenderTo, string childRenderTo)
        {
            string res = ExtJSGenerator.GenerateMainToolbar(name, parentRenderTo, childRenderTo,
                                                                       new ExtJSGenerator.Styles
                                                                           {
                                                                               ParentToolbarClass = "mainMenu_parenttoolbar",
                                                                               ParentItemClass = "mainMenu_parentitem",
                                                                               ParentItemActiveClass = "mainMenu_parentitem_active",
                                                                               ParentItemPassiveClass = "mainMenu_parentitem_passive",
                                                                               ChildItemClass = "mainMenu_childitem",
                                                                               ChildItemActiveClass = "mainMenu_childitem_active",
                                                                               ChildItemPassiveClass = "mainMenu_childitem_passive",
                                                                               SubmenuClass = "workspace_main_menu_submenu",
                                                                               SubmenuChildItemClass = "workspace_main_menu_submenu_child"
                                                                           });
            return Content(res, "text/javascript");
        }

        public ActionResult GenerateStoreForLeftMenu(string name)
        {
            string res = ExtJSGenerator.GenerateStoreForLeftMenu(name, WsFactory.GetLeftMenu());
            return Content(res, "text/javascript");
        }
    }
}