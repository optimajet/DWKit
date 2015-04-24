using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using System.Xml.Linq;
using System.Text;
using System.IO;

namespace Admin.Controllers
{
    public class SettingsController : BaseController
    {
        public ActionResult Index()
        {
            Settings.Current.AppSettingsReset();
            return View(Settings.Current.AppSettings);
        }

        public ActionResult Save()
        {
            foreach (var setting in Settings.Current.AppSettings)
            {
                if (setting.EditorType == 1)
                {
                    Settings.Current[setting.Name] = (Request.Form[setting.Name] == "on").ToString();                        
                }
                else
                {
                    if (Request.Form.AllKeys.Contains(setting.Name))
                    {
                        Settings.Current[setting.Name] = Request.Form[setting.Name];
                    }
                }
            }

            Settings.Current.AppSettingsReset();
            return View("Index", Settings.Current.AppSettings);
        }

        public ActionResult ExportMetadata()
        {
            var doc = OptimaJet.Meta.MetaHelper.GetMetadataXML();
            return File(UTF8Encoding.UTF8.GetBytes(doc.ToString()), "text/xml", "metadata.xml");
        }

        [HttpPost]
        public ActionResult UploadMetadata()
        {
            Stream filestream = null;
            if (Request.Files.Count > 0)
                filestream = Request.Files[0].InputStream;
            else
                throw new Exception("File isn't found!");
            var el = XElement.Load(filestream);
            OptimaJet.Meta.MetaHelper.LoadXMLAndSaveInDB(el);

            return View();
        }
    }
}
