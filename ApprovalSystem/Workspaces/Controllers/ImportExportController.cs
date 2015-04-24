using System;
using System.Linq;
using System.Web.Mvc;
using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.View;
using ServiceStack.Text;
using System.Collections.Generic;
using OptimaJet.Localization;

namespace Workspaces.Controllers
{
    public class ImportExportController : Controller
    {
        public ActionResult GetImportExportProperties(string formName)
        {
            bool isAvailableForImportExport = false;
            try
            {
                MetaForm mf = OptimaJet.Meta.Objects.MetaFormHelper.GetByName(formName + "_Edit") ?? OptimaJet.Meta.Objects.MetaFormHelper.GetByName(formName);
                if (mf != null)
                    isAvailableForImportExport = mf.IsAvailableForImportExport;
            }
            catch (Exception ex)
            {
                Logger.Log.Error("Ошибка получения метаданных для формы " + formName, ex);
            }
            return Json(new { IsAvailableForImportExport = isAvailableForImportExport }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetForms()
        {
            var forms = FormModelRepository.GetFormsForImportExport();
            return new ContentResult
                {
                    ContentType = "text/html",
                    Content = JsonSerializer.SerializeToString(
                        new { success = true, count = forms.Count, data = forms.Select(f => new { caption = f.Value, name = f.Key }) })
                };
        }

        [HttpGet]
        public ActionResult GetTemplate(string name, string type = "Xlsx")
        {
            string fileName;
            string folderName = Server.MapPath(Settings.Current["TemporaryFolderForImportExport"]);

            var fileStream = ImportExportHelper.GetTemplate(name, type, out  fileName, folderName);

            if (fileStream != null)
                return File(fileStream,
                            "application/excel",
                             fileName);
            return new EmptyResult();
        }

        public ActionResult UploadExcel(string name, string type = "Xlsx")
        {
            var fileName = Guid.NewGuid().ToString("N");

            var filePath = Server.MapPath(Settings.Current["TemporaryFolderForImportExport"]);

            ExcelType excelType;
            ExcelType.TryParse(type, true, out excelType);

            try
            {
                if (Request.Files.Count != 1 || Request.Files[0] == null)
                    return new ContentResult
                        {
                            ContentType = "text/html",
                            Content = DynamicEntityJSONDataSource.GetNotSuccess("Неверное количество файлов в запросе.")


                        };


                var ds = ExcelHelper.FromExcel(Request.Files[0].InputStream, fileName, filePath, excelType);


                var result = ImportExportHelper.Import(name, ds);

                var report = result.GetReport(new ImportResultTextFormatter());


                return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetSuccess(report.Replace("\r\n", "&lt;/br&gt;"))
                    };
            }
            catch (OptimaJet.DynamicEntities.Exceptions.DynamicEntitiesConvertException ex)
            {
                string msg = String.Format("{0}: {1}.", LocalizationProvider.Provider.Get("Error of template loading"),
                    LocalizationProvider.Provider.Get("Incorrect format of fields in file"));
                
                Logger.Log.Error(ex.Message, ex);
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(msg)
                };
            }
            catch (Exception ex)
            {
                Logger.Log.Error(LocalizationProvider.Provider.Get("Error of template loading") + " " + name, ex);
                return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                    };
            }
            finally
            {
                try
                {
                    var fullName = ExcelHelper.GetFullFilePath(fileName, filePath, excelType);
                    if (System.IO.File.Exists(fullName))
                    {
                        System.IO.File.Delete(fullName);
                    }
                }
                catch (Exception ex)
                {
                    Logger.Log.Error("Ошибка удаления временного файла", ex);
                }
            }

        }

        public ActionResult UploadExcelForClient(string name, string type = "Xlsx")
        {
            var fileName = Guid.NewGuid().ToString("N");
            var filePath = Server.MapPath(Settings.Current["TemporaryFolderForImportExport"]);

            ExcelType excelType;
            ExcelType.TryParse(type, true, out excelType);

            try
            {
                if (Request.Files.Count != 1 || Request.Files[0] == null)
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess("Неверное количество файлов в запросе.")
                    };


                var ds = ExcelHelper.FromExcel(Request.Files[0].InputStream, fileName, filePath, excelType);

                List<dynamic> records;
                var result = ImportExportHelper.ImportForClient(name, ds, out records);
                var report = result.GetReport(new ImportResultTextFormatter());

                var res = new
                {
                    success = !(result.HaveMappingErrors || result.HaveParsingErrors),
                    message = report,
                    records = records.Select(c=>(c as DynamicEntity).Dictionary).ToArray()
                };

                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = ServiceStack.Text.JsonSerializer.SerializeToString(res)
                };
            }
            catch (Exception ex)
            {
                Logger.Log.Error(string.Format("Ошибка загрузки шаблона {0}", name), ex);
                
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                };
            }
            finally
            {
                try
                {
                    var fullName = ExcelHelper.GetFullFilePath(fileName, filePath, excelType);
                    if (System.IO.File.Exists(fullName))
                    {
                        System.IO.File.Delete(fullName);
                    }
                }
                catch (Exception ex)
                {
                    Logger.Log.Error("Ошибка удаления временного файла", ex);
                }
            }

        }
    }
}
