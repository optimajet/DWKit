using System;
using System.Collections.Generic;
using System.Web.Mvc;
using OptimaJet.Security;
using Admin.Helpers;
using Ionic.Zip;
using System.IO;
using OptimaJet.Common;

namespace Admin.Controllers
{
    public class EventsLogController : DictionaryController
    {
        public ActionResult Index()
        {
            return View(GetArchiveFiles());
        }

        private List<string> GetArchiveFiles()
        {
            string path = Server.MapPath(System.Configuration.ConfigurationManager.AppSettings["EventsLogFolder"]);
            List<string> archiveFiles = new List<string>();
            if (!string.IsNullOrWhiteSpace(path))
            {
                try
                {
                    foreach (var f in Directory.GetFiles(path, "*.zip"))
                    {
                        FileInfo fi = new FileInfo(f);
                        if (fi != null)
                            archiveFiles.Add(fi.Name);
                    }
                }
                catch (Exception ex)
                {
                    Logger.Log.Error(ex);
                }
            }
            return archiveFiles;
        }

        public virtual ActionResult AchiveListPartial()
        {
            return PartialView("AchiveList", GetArchiveFiles());            
        }

        //public ActionResult Clean()
        //{
        //    EventsLogHelper.DropEventsLog();
        //    return Content(MessageHelper.FormedMessageSuccess("Журнал очищен!"), "");
        //}

        public ActionResult Archive()
        {
            string path = Server.MapPath(System.Configuration.ConfigurationManager.AppSettings["EventsLogFolder"]);
            
            if(path.Length > 0 && path[path.Length - 1] != '\\')
                path += '\\';

            string fileName = string.Format("eventlogs_{0}.log", DateTime.Now.ToString("yyyy_MM_dd_hh_mm_ss"));
            string fileZipName = string.Format("eventlogs_{0}.zip", DateTime.Now.ToString("yyyy_MM_dd_hh_mm_ss"));

            Dictionary<string,string> columns = new Dictionary<string,string>();
            columns.Add("UserName", "Пользователь");
            columns.Add("UserIP", "IP");
            columns.Add("ActionType", "Тип события");
            columns.Add("ObjectType", "Тип объекта");
            columns.Add("ObjectName", "Объект");
            columns.Add("ObjectId", "Id объекта");        
            columns.Add("Comment", "Комментарий");

            EventsLogHelper.ArchiveEventsLog(path + fileName, columns);

            using (ZipFile zip = new ZipFile())
            {
                zip.AddFile(path + fileName, string.Empty);
                zip.Save(path + fileZipName);                
            }

            System.IO.File.Delete(path + fileName);

            return Content(MessageHelper.FormedMessageSuccess(string.Format("Журнал заархивирован! Имя файла: {0}", fileZipName)), "");
        }

        public FileResult DownloadArchive(string id)
        {
            string path = Server.MapPath(System.Configuration.ConfigurationManager.AppSettings["EventsLogFolder"]);
            if (path.Length > 0 && path[path.Length - 1] != '\\')
                path += '\\';

            return File(path + id, "application/zip");
                 
        }

        public ActionResult AchiveListDelete(string[] checkedRecords)
        {            
            try
            {
                string path = Server.MapPath(System.Configuration.ConfigurationManager.AppSettings["EventsLogFolder"]);
                if (path.Length > 0 && path[path.Length - 1] != '\\')
                    path += '\\';

                     foreach (var name in checkedRecords)
                {
                    System.IO.File.Delete(path + name);
                }

            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.RowsDeleted + "!"), "");
        }
    }
}
