//using Admin.DAL;
//using OptimaJet.BJet;
//using OptimaJet.BJet.VTB;
//using OptimaJet.Common;
//using OptimaJet.DynamicEntities.DataSource;
//using OptimaJet.DynamicEntities.Model;
//using OptimaJet.DynamicEntities.Query;
//using OptimaJet.Security.Providers;
//using System;
//using System.Collections.Generic;
//using System.Data.SqlClient;
//using System.Linq;
//using System.Web.Mvc;
//using WebBjet.Reporting;
//using WebBjet.Reporting.Controllers;
//using WebBjet.Reporting.Helpers;
//using WebBjet.Reporting.Model;
//using WebBjet.Reporting.Properties;
//using WebBjet.Reporting.Report;
//using Workspaces.Helpers;
//using Workspaces.Report;
//using Workspaces.Security;

//namespace Workspaces.Controllers
//{
//    public class ReportController : ReportControllerBase
//    {
//        public static readonly Dictionary<string, string> ReportPermissionsMap = new Dictionary<string, string>
//        {
//            {"Budget Analysis", "Menu_BudgetAnalysis"},
//            {"Budget Versions Analysis", "Menu_BudgetVersionAnalysis"},
//            {"Invoice Analysis", "Menu_InvoiceAnalysis"}
//        };

//        public ReportController()
//            : base(Settings.ConnectionString,
//            SecurityCache.CurrentUser != null ? SecurityCache.CurrentUser.Id : Guid.Empty,
//            SecurityCache.CurrentUser != null ? SecurityCache.CurrentUser.Localization : "en")
//        {
//        }

//        protected override string TemplateAuthorTableName
//        {
//            get { return "SecurityUser"; }
//        }

//        [CheckPermission("View", "Menu_BudgetAnalysis", UseRedirect=true)]
//        public ActionResult BudgetAnalysis()
//        {
//            var model = CreateModel("Budget Analysis", BudgetItemMethods.GetVisibilityFilter);
//            ViewBag.Title = model.DataConfiguration.ViewTitle;

//            return View("MetaReport", model);
//        }

//        [CheckPermission("View", "Menu_BudgetAnalysisDiff", UseRedirect = true)]
//        public ActionResult BudgetAnalysisDiff()
//        {
//            var model = CreateModel("Budget Versions Analysis", BudgetItemMethods.GetVisibilityFilter);
//            SetBudgetData(model);
//            ViewData["IsDiffReport"] = true;
//            ViewBag.Title = model.DataConfiguration.ViewTitle;

//            return View("MetaReport", model);
//        }

//        [CheckPermission("View", "Menu_InvoiceAnalysis", UseRedirect = true)]
//        public ActionResult InvoiceAnalysis()
//        {
//            var model = CreateModel("Invoice Analysis", InvoiceMethods.GetVisibilityFilter);
//            ViewBag.Title = model.DataConfiguration.ViewTitle;

//            return View("MetaReport", model);
//        }

//        [CheckPermission("View", "Menu_BudgetAnalysis", "Menu_BudgetAnalysisDiff", "Menu_InvoiceAnalysis")]
//        public ActionResult GetMetaReportData(string pivotConfiguration, string reportName, Guid? budgetVersionId1, Guid? budgetVersionId2)
//        {
//            var checkReportFormed = true;
//            var reportParams = CreateReportParams(reportName);
//            Analysis analysis;
//            if(budgetVersionId1.HasValue && budgetVersionId2.HasValue)
//            {
//                checkReportFormed = false;
//                analysis = new BudgetVersionsAnalysis(reportParams, budgetVersionId1.Value, budgetVersionId2.Value);
//            }
//            else
//            {
//                analysis = new Analysis(reportParams);
//            }

//            return GetMetaReportData(analysis, pivotConfiguration, checkReportFormed);
//        }

//        [CheckPermission("Generate", "Menu_BudgetAnalysis", "Menu_BudgetAnalysisDiff", "Menu_InvoiceAnalysis")]
//        public ActionResult CreateReport(string reportName)
//        {
//            var reportParams = CreateReportParams(reportName);
//            var reportMetaData = new ReportMetaData(reportName);
//            if (reportMetaData.IsGenerationInProgress)
//                return GetResult(false, null, Resources.ReportGenerationHasAlreadyBeenRun);
//            if (String.IsNullOrWhiteSpace(reportMetaData.QueryFormedReport))
//                return GetResult(false, null, Resources.SpecifyParameters);

//            var userId = SecurityCache.CurrentUser.Id;

//            CreateReport(reportMetaData, userId, true);
//            reportMetaData.RefreshGenerationResults();

//            var reportStatusInfo = reportMetaData.GetReportStatusInfo();

//            return GetResult(true, reportStatusInfo.Message, Resources.ReportGenerationStarted);
//        }

//        public ActionResult GetDrillDownData(int page, int limit, string keyColumnName, string metaReport, string filter, string detalizationProperty, Guid? budgetVersionId1, Guid? budgetVersionId2)
//        {
//            var reportParams = CreateReportParams(metaReport);
//            Analysis analysis;
//            if (budgetVersionId1.HasValue && budgetVersionId2.HasValue)
//            {
//                analysis = new BudgetVersionsAnalysis(reportParams, budgetVersionId1.Value, budgetVersionId2.Value);
//            }
//            else
//            {
//                analysis = new Analysis(reportParams);
//            }

//            return GetDrillDownData(analysis, page, limit, keyColumnName, filter, detalizationProperty);
//        }

//        public ActionResult ExportDrillDown(string keyColumnName, string metaReport, string filter, string detalizationProperty, string reportName, Guid? budgetVersionId1, Guid? budgetVersionId2)
//        {
//            var reportParams = CreateReportParams(metaReport);
//            Analysis analysis;
//            if (budgetVersionId1.HasValue && budgetVersionId2.HasValue)
//            {
//                analysis = new BudgetVersionsAnalysis(reportParams, budgetVersionId1.Value, budgetVersionId2.Value);
//            }
//            else
//            {
//                analysis = new Analysis(reportParams);
//            }

//            return ExportDrillDownData(analysis, metaReport, keyColumnName, filter, detalizationProperty, reportName);
//        }

//        [CheckPermission("Generate", "Menu_BudgetAnalysis", "Menu_BudgetAnalysisDiff", "Menu_InvoiceAnalysis")]
//        public ActionResult ResetReportGenerationStatus(string reportName)
//        {
//            var reportParams = CreateReportParams(reportName);
//            var reportMetaData = new ReportMetaData(reportName);
//            reportMetaData.ResetProcessFlagQuery();
//            reportMetaData.RefreshGenerationResults();

//            var configuration = reportMetaData.CreateReportConfiguration();

//            return GetSuccessResult(new { configuration.State, configuration.Message });
//        }

//        public ActionResult AccessDenied()
//        {
//            return PartialView();
//        }


//        #region Private methods

//        private ReportParams CreateReportParams(string reportName, Func<EntityMetadata, FilterCriteriaSet> visibilityFunc = null)
//        {
//            return new ReportParams
//            {
//                ReportName = reportName,
//                VisibilityFunc = visibilityFunc
//            };
//        }

//        private ReportModel<String> CreateModel(string reportName, Func<EntityMetadata, FilterCriteriaSet> visibilityFunc)
//        {
//            var reportParams = CreateReportParams(reportName, visibilityFunc);
//            var reportMetaData = new ReportMetaData(reportName);
//            var configuration = reportMetaData.CreateReportConfiguration();
//            var model = new ReportModel<String>
//            {
//                DataConfiguration = configuration,
//                EditForm = reportMetaData.DetalizationEntityForm,
//                KeyColumnName = reportMetaData.KeyColumnName,
//                ReportName = reportName
//            };

//            return model;
//        }

//        private void CreateReport(ReportMetaData reportMetaData, Guid userId, bool throwIfError = false)
//        {
//            Logger.Log.Debug("CreateReport start");
//            Exception exception = null;
//            try
//            {
//                var parameters = new List<SqlParameter>
//                {
//                    new SqlParameter("@MetaReportId", reportMetaData.ReportId),
//                    new SqlParameter("@BudgetVersionId", reportMetaData.BudgetVersionId),
//                    new SqlParameter("@AuthorId", userId)
//                }.ToArray();

//                ReportHelper.CreateReport(reportMetaData.QueryFormedReport, Settings.ConnectionString, parameters);
//            }
//            catch(Exception e)
//            {
//                Logger.Log.ErrorFormat("CreateReport failed. ReportId: {0}; BudgetVersionId: {1}\r\nException: {2}",
//                    reportMetaData.ReportId, reportMetaData.BudgetVersionId, exception);
//                exception = e;
//                if (throwIfError)
//                {
//                    throw;
//                }
//            }
//            if(exception == null)
//            {
//                Logger.Log.Debug("CreateReport end");
//            }
//        }

//        private void SetBudgetData(ReportModel<String> reportModel)
//        {
//            var budgets = DynamicRepository.GetByEntity("Budget", FilterCriteriaSet.Empty, OrderByCriteriaSet.Asc("Name"));
//            var filter = FilterCriteriaSet.And.Equal((Guid)CommonSettings.CurrentBudget.Id, "BudgetId");
//            var budgetVersions = DynamicRepository.GetByEntity("BudgetVersion", filter, OrderByCriteriaSet.Asc("Name"));

//            var model = new BudgetInfoModel
//            {
//                Budgets = budgets.Select(b => new BudgetModel
//                {
//                    Id = b.Id,
//                    Name = b.Name.ToString(),
//                    Versions = GetBudgetVersions(b.Id)
//                }),
//                CurrentBudgetId = CommonSettings.CurrentBudget.Id,
//                CurrentBudgetVersionId = CommonSettings.CurrentBudgetVersion.Id
//            };

//            reportModel.BudgetInfo = model;
//        }

//        private IEnumerable<BudgetVersionModel> GetBudgetVersions(Guid budgetId)
//        {
//            var filter = FilterCriteriaSet.And.Equal(budgetId, "BudgetId");
//            var budgetVersions = DynamicRepository.GetByEntity("BudgetVersion", filter, OrderByCriteriaSet.Asc("Name"));

//            return budgetVersions.Select(bv => new BudgetVersionModel
//            {
//                Id = bv.Id,
//                Name = bv.Name,
//                BudgetId = budgetId
//            });
//        }

//        private ActionResult ExportDrillDownData(Analysis analysis, string metaReport, string keyColumnName, string filter, string detalizationProperty, string reportName)
//        {
//            var reportParams = CreateReportParams(metaReport);
//            var name = String.Format("{0}_Detalization_{1}", reportName, detalizationProperty);
//            var table = GetDrillDownDataTable(analysis, keyColumnName, filter, detalizationProperty);
//            table.Columns.Remove(keyColumnName);

//            return GridExportHelper.ExportToXls(name, table);
//        }

//        #endregion
//    }
//}