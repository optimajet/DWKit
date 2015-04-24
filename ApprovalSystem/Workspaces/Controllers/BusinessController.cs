using System.Globalization;
using System.Linq;
using System.Transactions;
using System.Web;
using OptimaJet.BJet;
using OptimaJet.BJet.VTB;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.Sync;
using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Common;
using Admin.DAL;
using ServiceStack;
using ServiceStack.Text;
using OptimaJet.Localization;

namespace Workspaces.Controllers
{
    public class BusinessController : Controller
    {
        public ActionResult GetAccountCodeInfo(Guid Id)
        {
            var res = OptimaJet.BJet.VTB.AccountCode.GetInfo(Id);
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult GetVATByLegalEntityId(Guid Id)
        {
            var res = OptimaJet.BJet.VTB.LegalEntity.GetVAT(Id);
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult GetPlanCurrecyRate(Guid Id)
        {
            var res = OptimaJet.BJet.FXRate.GetPlanRate(Id);
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult GetCurrecyRate(Guid Id, string date)
        {
            var res = OptimaJet.BJet.FXRate.GetRate(Id, JsonSerializer.DeserializeFromString<DateTime?>(date));
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult GetEntityCaptionAttribute(string metaviewName)
        {
            DynamicEntityRepository repo = new DynamicEntityRepository();
            EntityMetadata metadata = repo.GetEntityMetadataByEntityName(metaviewName);

            string caption = metadata != null ? OptimaJet.BJet.CommonMethods.GetEntityCaptionAttribute(metadata).PropertyName : String.Empty;
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(caption));
        }

        public ActionResult GetDependingEntityAccess(string metaviewName, string ids, int deep = 0)
        {
            List<Guid> guids = new List<Guid>();
            string[] separateIds = ids.Split(new string[] { ",", ", " }, StringSplitOptions.RemoveEmptyEntries);
            Guid parseId;
            foreach (string id in separateIds)
            {
                if (Guid.TryParse(id, out parseId))
                    guids.Add(parseId);
                else
                    return Content(ServiceStack.Text.JsonSerializer.SerializeToString<string>(null));
            }

            var res = deep != 0 ? OptimaJet.BJet.VTB.EntityAccess.GetDependingEntityAccess(metaviewName, guids.ToArray(), deep) : null;
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult GetRestForBudgetItem(string ids)
        {
            var array = ids.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => new Guid(x)).ToList();

            var res = new List<dynamic>();
            var residuals = BudgetItem.GetBudgetItemsResidual(array);

            foreach (var r in residuals)
                res.Add(new { BudgetItemId = r.Key, Rest = r.Value });
            
            var content = JsonSerializer.SerializeToString(res);

            return Content(content);
        }
        

        #region BudgetSync
        public ActionResult BudgetSync(string formName, List<Guid> ids, List<Guid> budgetIds, bool useVersions)
        {
            List<object> syncIds = null;
            string syncName = null;
            if (useVersions)
            {
                syncIds = DynamicRepository.GetByEntity("BudgetVersion",
                    FilterCriteriaSet.And.In(budgetIds, "BudgetId").Equal(true, "IsCurrent")).Select(bv => bv.Id).ToList();
                syncName = "BudgetVersionId";
            }
            else
            {
                syncIds = budgetIds.Cast<object>().ToList();
                syncName = "BudgetId";
            }

            foreach (var id in ids)
            {
                try
                {
                    var sync = new UniversalSyncMain(formName, id, syncName, syncIds);
                    sync.Sync();
                }
                catch (Exception ex)
                {
                    return new ContentResult()
                    {
                        Content = string.Format("{{\"success\":false,\"message\":\"{0}\"}}", HttpUtility.JavaScriptStringEncode(ex.Message))
                    };
                }

            }

            return new ContentResult()
            {
                Content = string.Format("{{\"success\":true,\"message\":\"{0}\"}}", OptimaJet.Localization.LocalizationProvider.Provider.Get("Synchronization is successful!"))
            };
        }
        #endregion

        #region Information service

        public ActionResult InfoService(int? count)
        {
            var res = new
            {

            };
            return Content(ServiceStack.Text.JsonSerializer.SerializeToString(res));
        }

        public ActionResult InfoServiceInboxCount()
        {
            var res = "[]";
            var item = OptimaJet.BJet.InfoService.InboxCount();
            if (item != null)
            {
                res = ServiceStack.Text.JsonSerializer.SerializeToString((item as DynamicEntity).Dictionary);
            }
            return Content(res);
        }
        #endregion

        #region Allocation & Expense

        public ActionResult GetAllocationModel(Guid id)
        {
            var res = OptimaJet.BJet.VTB.AllocationModel.GetItems(id);
            var content = ServiceStack.Text.JsonSerializer.SerializeToString(res);
            return Content(content);
        }

        [HttpPost]
        public ActionResult GetBudgetItemAllocationModel()
        {
            var budgetitems = Request.Form.AllKeys.Contains("BudgetItems") ?
                ServiceStack.Text.JsonSerializer.DeserializeFromString<JsonArrayObjects>(Request.Form["budgetitems"])
                : null;

            var res = OptimaJet.BJet.VTB.AllocationModel.GetAllocations(budgetitems);
            var content = ServiceStack.Text.JsonSerializer.SerializeToString(res);
            return Content(content);
        }

        [HttpPost]
        public ActionResult ExpenseUpdate()
        {
            float vat = JsonSerializer.DeserializeFromString<float>(Request.Form["vat"]);
            DateTime date = JsonSerializer.DeserializeFromString<DateTime>(Request.Form["date"]);

            var allocation = JsonSerializer.DeserializeFromString<JsonArrayObjects>(Request.Form["allocation"]);
            var expense = Request.Form.AllKeys.Contains("Expense") ?
                ServiceStack.Text.JsonSerializer.DeserializeFromString<JsonArrayObjects>(Request.Form["expense"])
                : null;

            List<dynamic> res = OptimaJet.BJet.VTB.Invoice.ExpenseUpdate(date, vat, allocation, expense);
            var content = ServiceStack.Text.JsonSerializer.SerializeToString(res.Select(c => (c as DynamicEntity).Dictionary).ToArray());
            return Content(content);
        }
        #endregion

        public ActionResult InvoiceToState(Guid id, byte state)
        {
            string res = string.Empty;

            if (!SecurityCache.FormCan("Invoice", "ChangeState"))
            {
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied"))
                };
            }


            try
            {
                var error = OptimaJet.BJet.VTB.Invoice.ToState(id, state);
                if (!string.IsNullOrWhiteSpace(error))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(error)
                    };
                }
                res = OptimaJet.Localization.LocalizationProvider.Provider.Get("State is changed");
            }
            catch (Exception ex)
            {
                Logger.Log.Error(ex);

                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                };
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = DynamicEntityJSONDataSource.GetSuccess(res)
            };
        }

        public ActionResult BudgetStartNewPlanCycle(Guid id)
        {
            string res = string.Empty;

            if (SecurityCache.FormCan("Budget", "StartNewPlanCycle"))
            {
                try
                {
                    OptimaJet.BJet.VTB.BudgetItem.StartNewPlanCycle(id);
                    res = OptimaJet.Localization.LocalizationProvider.Provider.Get("Plan cycle is created");
                }
                catch (Exception ex)
                {
                    Logger.Log.Error(ex);

                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                    };
                }
            }
            else
            {
                res = OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied");
            }

            return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetSuccess(res)
                    };
        }

        public ActionResult BudgetRecalc(Guid id)
        {
            string res = string.Empty;

            if (SecurityCache.FormCan("Budget", "Recalc"))
            {
                try
                {
                    OptimaJet.BJet.VTB.BudgetItem.RecalcBudget(id);
                    res = OptimaJet.Localization.LocalizationProvider.Provider.Get("Recalculation complete");
                }
                catch (Exception ex)
                {
                    Logger.Log.Error(ex);

                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                    };
                }
            }
            else
            {
                res = OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied");
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = DynamicEntityJSONDataSource.GetSuccess(res)
            };
        }

        public ActionResult BudgetItemChangeManager(Guid employeeid, string budgetitems)
        {
            var idsList = budgetitems.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => new Guid(x)).ToList();

            if (SecurityCache.FormCan("BudgetItem", "ChangeManager"))
            {
                try
                {
                    string message;
                    if (BudgetItem.ChangeManager(employeeid, idsList, out message))
                    {
                        return new ContentResult
                        {
                            ContentType = "text/html",
                            Content = DynamicEntityJSONDataSource.GetSuccess(message)
                        };
                    }

                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(message)
                    };
                }
                catch (Exception ex)
                {
                    Logger.Log.Error(ex);

                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
                    };
                }
            }
            else
            {
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied"))
                };
              
            }

       
        }


        public ActionResult GetBudgetVersions(Guid id, bool excludecurrent)
        {
            var budgetversions = excludecurrent ? 
                 DynamicRepository.GetByEntity("BudgetVersion",
                FilterCriteriaSet.And.Equal(id, "BudgetId").NotEqual(true,"IsCurrent"),
                OrderByCriteriaSet.Asc("Name")) :
                DynamicRepository.GetByEntity("BudgetVersion",
                FilterCriteriaSet.And.Equal(id, "BudgetId"),
                OrderByCriteriaSet.Asc("Name"));

            return new ContentResult
            {
                ContentType = "text/html",
                Content = DynamicEntityJSONDataSource.GetSuccessWithPlainSerializedValues("OK", budgetversions, "values")
            };
        }




        public ActionResult BudgetRollbackToVersion(Guid budgetid, Guid versionid, bool ignorecheck = false)
        {
            string message = string.Empty;

            if (!SecurityCache.FormCan("Budget", "RollbackVersion"))
            {
                message = OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied");
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(message)
                };
            }
            bool needConfirm;
            var success = BudgetItem.RollbackToVersion(budgetid, versionid, ignorecheck, out needConfirm, out message);

            if (!success)
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(message)
                };


            return new ContentResult
            {
                ContentType = "text/html",
                Content = DynamicEntityJSONDataSource.GetSuccess(message,needConfirm)
            };
        }

        public ActionResult BudgetItemUploadFromExcel(string ignoreerror = null, string impimport = null)
        {
            var fileName = Guid.NewGuid().ToString("N");

            var filePath = Server.MapPath(Settings.Current["TemporaryFolderForImportExport"]);

            ExcelType excelType = ExcelType.Xlsx;

            try
            {
                if (Request.Files.Count != 1 || Request.Files[0] == null)
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess("Неверное количество файлов в запросе.")
                    };


                var ds = ExcelHelper.FromExcel(Request.Files[0].InputStream, fileName, filePath, excelType);
                var report = "";
                OptimaJet.BJet.VTB.BudgetItem.Import(ds, out report, ignoreerror == "on", impimport == "on", BudgetItemImportProgress);

                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetSuccess(report.Replace("\r\n", "&lt;/br&gt;"))
                };
            }
            catch (Exception ex)
            {
                Logger.Log.Error(string.Format("Ошибка загрузки шаблона Budget Items"), ex);
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

        private bool BudgetItemImportProgress(dynamic info)
        {
            //Response.Write(ServiceStack.Text.JsonSerializer.SerializeToString(info));
            return true;
        }

        public ActionResult ProjectStatusUpdate(string ids, byte status)
        {
            string res = "";
            if (SecurityCache.FormCan("Project", SecurityPermissionBaseTypeEnum.Edit))
            {

                List<Guid> guids = new List<Guid>();
                string[] separateIds = ids.Split(new string[] { ",", ", " }, StringSplitOptions.RemoveEmptyEntries);
                Guid parseId;
                foreach (string id in separateIds)
                {
                    if (Guid.TryParse(id, out parseId))
                        guids.Add(parseId);
                    else
                        return Content(ServiceStack.Text.JsonSerializer.SerializeToString<string>(null));
                }

                OptimaJet.BJet.VTB.Project.SetStatus(guids, status);
                res = OptimaJet.Localization.LocalizationProvider.Provider.Get("The operation is completed") + "!";
                return Content(DynamicEntityJSONDataSource.GetSuccess(res));
            }
            else
            {
                res = OptimaJet.Localization.LocalizationProvider.Provider.Get("Access is denied") + "!";
                return Content(DynamicEntityJSONDataSource.GetNotSuccess(res));
            }
        }
        public ActionResult RunImportFXRate()
        {
            string report = String.Empty;
            bool res = false;

            //if (SecurityCache.CheckPermission("Form_FXRate", "Add"))
            //{
            //    try
            //    {
            //        CultureInfo cInfo = CultureInfo.CurrentCulture;
            //        DateTime startDate = DateTime.ParseExact(Request.Form.Get("startDate"), "dd.MM.yyyy", cInfo);
            //        DateTime endDate = DateTime.ParseExact(Request.Form.Get("endDate"), "dd.MM.yyyy", cInfo);

            //        FXRateImporter importer = new FXRateImporter(FXRateMethods.FXRateImportView, FXRateMethods.FXRateImportConnectionString);
            //        res = importer.ImportFXRates(startDate, endDate, out report);
            //    }
            //    catch (Exception ex)
            //    {
            //        Logger.Log.Error(ex);

            //        return new ContentResult
            //        {
            //            ContentType = "text/html",
            //            Content = DynamicEntityJSONDataSource.GetNotSuccess(ex.Message)
            //        };
            //    }
            //}
            //else
            //{
                report = LocalizationProvider.Provider.Get("Access is denied");
            //}

            return new ContentResult
            {
                ContentType = "text/html",
                Content = res ? DynamicEntityJSONDataSource.GetSuccess(LocalizationProvider.Provider.Get("Import has been completed successfully")) 
                    : DynamicEntityJSONDataSource.GetNotSuccess(report)
            };
        }
    }
}
