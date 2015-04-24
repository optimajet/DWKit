using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml.Linq;

namespace Workspaces.Controllers
{
    public class HelpInfoController : Controller
    {
        //
        // GET: /HelpInfo/

        private static XDocument doc;

        private static Dictionary<string,string> GetFilePaths(string formName)
        {
            if (doc == null)
            {
                string filePath = "~/Configuration/HelpFiles.xml";
                string fullFilePath = System.Web.HttpContext.Current.Server.MapPath(filePath);
                doc = XDocument.Load(fullFilePath);
            }

            Dictionary<string, string> res = new Dictionary<string, string>();

            XElement formXml = doc.Root.Elements().Where(el => el.Name == "Form" && el.Attribute("Name").Value == formName).FirstOrDefault();
            
            if (formXml != null)
                res = formXml.Elements().ToDictionary(k => k.Attribute("Name").Value, k => k.Attribute("Path").Value);

            return res;
        }


        public JsonResult GetHelp(string formName)
        {
            Dictionary<string, string> filePaths = GetFilePaths(formName);
            Dictionary<string, string> result = new Dictionary<string, string>();

            foreach (string objectType in filePaths.Keys)
            {
                using (StreamReader reader = new StreamReader(System.Web.HttpContext.Current.Server.MapPath(filePaths[objectType])))
                {
                    string fileContent = reader.ReadToEnd();
                    result[objectType] = fileContent;
                }
            }

            return new JsonResult
            {
                JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet,
                ContentEncoding = System.Text.Encoding.UTF8,
                Data = new
                {
                    messages = result
                }
            };
        }
    }
}
