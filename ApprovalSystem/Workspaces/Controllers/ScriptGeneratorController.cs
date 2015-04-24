using System;
using System.Web.Mvc;
using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.View;
using OptimaJet.DynamicEntities.View.ExtJs;
using OptimaJet.Security.Providers;
using System.Web.Optimization;
using OptimaJet.DynamicEntities.Model;


namespace Workspaces.Controllers
{
    public class ScriptGeneratorController : Controller
    {
        public ActionResult Form(string metaViewName,
                                         string renderTo, string version)
        {

            var dictionary = Request.Params.ToDictionary<string, string>();
            dictionary.Add("metaViewName", metaViewName);
            dictionary.Add("renderTo", renderTo);
            dictionary.Add("version", version);

            var res = ScriptGenerator.GenerateForm(dictionary);
            if (String.IsNullOrEmpty(res))
                return new EmptyResult();

            return new JavaScriptResult
            {
                Script = res
            };
          
        }

        public ActionResult Grid(string metaViewName,
                                         string renderTo, string version)
        {

            var dictionary = Request.Params.ToDictionary<string, string>();
            dictionary.Add("metaViewName", metaViewName);
            dictionary.Add("renderTo", renderTo);
            dictionary.Add("version", version);

            var res = ScriptGenerator.GenerateGrid(dictionary);
            if (String.IsNullOrEmpty(res))
                return new EmptyResult();

            return new JavaScriptResult
                {
                    Script = res
                };
        }

        public ActionResult AJAXTreeGrid(string metaViewName,
                                         string renderTo,
                                         
                                         string version
                                       )
        {
            var dictionary = Request.Params.ToDictionary<string, string>();
            dictionary.Add("metaViewName", metaViewName);
            dictionary.Add("renderTo", renderTo);
            dictionary.Add("version", version);

            var res = ScriptGenerator.GenerateTreeGrid(dictionary);
            if (String.IsNullOrEmpty(res))
                return new EmptyResult();

            return new JavaScriptResult
            {
                Script = res
            };
         
        }


        public ActionResult Store(string metaViewName, string version)
        {
            var dictionary = Request.Params.ToDictionary<string, string>();
            dictionary.Add("metaViewName", metaViewName);
            dictionary.Add("version", version);

            var res = ScriptGenerator.GenerateStore(dictionary);
            if (String.IsNullOrEmpty(res))
                return new EmptyResult();

            return new JavaScriptResult
            {
                Script = res
            };
        }

        [AllowAnonymous]
        public ActionResult Localization(string metaViewName)
        {
            var dictionary = Request.Params.ToDictionary<string, string>();
            dictionary.Add("Lang", metaViewName);
            dictionary.Add("Prefix", "optimajet.localization");

            var res = ScriptGenerator.GenerateLocalization(dictionary);
            if (String.IsNullOrEmpty(res))
                return new EmptyResult();

            return new JavaScriptResult
            {
                Script = res
            };
        }


    }
}
