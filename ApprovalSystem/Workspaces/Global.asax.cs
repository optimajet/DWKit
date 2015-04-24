using System;
using System.Configuration;
using System.Globalization;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using OptimaJet.BJet.VTB;
using OptimaJet.BJet.VTB.Calculation;
using OptimaJet.Common;
using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.SQLDataProvider;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Security;
using System.Web.Optimization;
using OptimaJet.Security.Providers;
using OptimaJet.Workspace;
using ServiceStack.Text;
using Admin.DAL;
using System.Xml.Linq;
using OptimaJet.BJet;
using Workspaces.Filters;
using System.Collections.Specialized;

namespace Workspaces
{
    public class MvcApplication : HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new AuthorizeAttribute());
            filters.Add(new HandleErrorAttribute());
            filters.Add(new LogExceptionFilter());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Workspace",
                "WS/{form}/{action}/{id}",
                new { controller = "Workspace", action = "Index", form = "Dashboard", id = UrlParameter.Optional } // Parameter defaults
            );

            routes.MapRoute(
              "Account",
              "AC/{action}",
              new { controller = "Account", action = "Index" } // Parameter defaults
            );

            routes.MapRoute(
                "Panel",
                "Panel/Header",
                new { controller = "Panel", action = "Header" } // Parameter defaults
            );
            

            #region Workflow
            routes.MapRoute(
                "Workflow",
                "WF/{action}/",
                new { controller = "Workflow" } 
                );
            #endregion

            #region FileUpload
            routes.MapRoute(
                "FileUpload",
                "FU/{action}/",
                new { controller = "FileUpload" }
                );
            #endregion

            #region ScriptGenerator

            routes.MapRoute(
             "ScriptGeneratorFormShort",
             "SG/Form/{metaViewName}.js",
             new { controller = "ScriptGenerator", action = "Form" } // Parameter defaults
             );

          //  routes.MapRoute(
          //    "ScriptGeneratorForm",
          //    "SG/Form/{metaViewName}_{formName}_{version}.js",
          //    new { controller = "ScriptGenerator", action = "Form" } // Parameter defaults
          //);

            routes.MapRoute(
                "ScriptGenerator",
                "SG/{action}/{metaViewName}_{renderTo}_{version}.js",
                new { controller = "ScriptGenerator", parentPropertyName = string.Empty, action = "Index"} // Parameter defaults
            );

            //routes.MapRoute(
            //    "ScriptGenerator_full",
            //    "SG/{action}/{metaViewName}_{renderTo}_{mode}_{version}.js",
            //    new { controller = "ScriptGenerator", parentPropertyName = string.Empty, action = "Index" } // Parameter defaults
            //);

            

            routes.MapRoute(
                "ScriptGeneratorTree",
                "SG/{action}/{metaViewName}_{renderTo}_{parentPropertyName}_{version}.js",
                new { controller = "ScriptGenerator", action = "Index"} // Parameter defaults
            );

            routes.MapRoute(
                "ScriptGenerator_lite",
                "SG/{action}/{metaViewName}.js",
                new { controller = "ScriptGenerator", action = "Index", parentPropertyName = string.Empty, mode = 1, renderTo = string.Empty, version = "0" }
                );// Parameter defaults
            
            #endregion

            #region DynamicDataSource

            routes.MapRoute("DynamicDataSource", "DDS/{action}/{metaViewName}.dds/{*pathInfo}",
                            new {controller = "DynamicDataSource", action = "Index"});

            routes.MapRoute("DynamicDataExportCSV", "DDS/{metaViewName}.csv/{*pathInfo}",
                            new { controller = "DynamicDataSource", action = "ExportCSV" });

            routes.MapRoute("DynamicDataExportXls", "DDS/{metaViewName}.xls/{*pathInfo}",
                            new { controller = "DynamicDataSource", action = "ExportXls" });

            routes.MapRoute("DynamicDataExportXlsx", "DDS/{metaViewName}.xlsx/{*pathInfo}",
                            new { controller = "DynamicDataSource", action = "ExportXlsx" });

            #endregion

            #region PlatformActions

            routes.MapRoute(
                "PlatformActions",
                "PA/{action}/{id}",
                new { controller = "PlatformActions", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

            #endregion

            #region ImportExport

            routes.MapRoute(
                "ImportExport",
                "IE/{action}",
                new { controller = "ImportExport" } // Parameter defaults
            );

            #endregion

            routes.MapRoute(
                "Default",
                "{controller}/{action}/{id}",
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );
        }

        protected void Application_Start()
        {
            NameValueCollection wfpars = new NameValueCollection();
            wfpars.Add("operation", "registerservicestack");
            OptimaJet.Workflow.Designer.DesignerAPI(null, wfpars);
            //OptimaJet.Workflow.Core.Runtime.WorkflowRuntime.RegisterLicense("<Your license key for WorkflowEngine.NET>");

            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            Logger.InitLogger();
            System.Threading.Thread.CurrentThread.CurrentUICulture = new CultureInfo("en");
            System.Threading.Thread.CurrentThread.CurrentCulture = new CultureInfo("en");

            OptimaJet.Security.Providers.SecurityCache.Provider = new BudgetSecurityProvider();
            
            ConfigureDynamicEntities();

            //Сериализация дат изменена
            JsConfig<DateTime>.SerializeFn = SerializeDateFn;

            RazorTemplates.CompileAllFormTemplates();

            CheckMetadata();

            //OptimaJet.DynamicEntities.ExternalMethods.ExternalMethodCompiller.DebugMode = true;
            //OptimaJet.Workflow.Core.CodeActions.CodeActionsCompiller.DebugMode = true;
            //DWKitHelper.ExternalMethodCompileAll();
        }

        private static void ConfigureDynamicEntities()
        {

            bool useTransactionScopeInTransactions = true;
            if (Settings.Current.ParamExists("UseTransactionScopeInTransactions"))
            {
                bool.TryParse(Settings.Current["UseTransactionScopeInTransactions"], out useTransactionScopeInTransactions);
            }

            DynamicEntityJSONDataSource.UseTransactionScopeInTransactions = useTransactionScopeInTransactions;

            //Отключаем только для удаленных бд
            bool ignoreTransactions = false;
            if (Settings.Current.ParamExists("IgnoreTransactions"))
            {
                bool.TryParse(Settings.Current["IgnoreTransactions"], out ignoreTransactions);
            }
            DynamicEntityJSONDataSource.IgnoreTransactions = ignoreTransactions;

            bool useMetadataCache = true;
            if (Settings.Current.ParamExists("UseMetadataCache"))
            {
                bool.TryParse(Settings.Current["UseMetadataCache"], out useMetadataCache);
            }

            DynamicEntitiesSettings.UseMetadataCache = useMetadataCache;

            bool useExecutorCache = false;
            if (Settings.Current.ParamExists("UseExecutorCache"))
            {
                bool.TryParse(Settings.Current["UseExecutorCache"], out useExecutorCache);
            }
            DynamicEntitiesSettings.UseExecutorCache = useExecutorCache;
           
            DynamicEntitiesSettings.EventLogger = new EventsLogHelper();
            DynamicEntitiesSettings.Extension = new DynamicEntityExtension();
            //DynamicEntitiesSettings.Notifier = new SearchEngineNotifier();
            //DynamicEntitiesSettings.PrimaryKeyGenerator = new PkGen();


            DynamicEntitiesSettings.FieldsToIdentifyName.Add("Code");
            DynamicEntitiesSettings.FieldsToIdentifyName.Add("Name");

            DynamicEntitiesSettings.ConnectionStringMetadataForEF = Admin.DAL.Settings.ConnectionStringForEF;
            DynamicEntitiesSettings.ConnectionStringData = ConfigurationManager.ConnectionStrings["DEData"] != null ?
                ConfigurationManager.ConnectionStrings["DEData"].ConnectionString : Admin.DAL.Settings.ConnectionString;
            DynamicEntitiesSettings.ConnectionStringMetadata = ConfigurationManager.ConnectionStrings["DEMetadata"] != null ? ConfigurationManager.ConnectionStrings["DEMetadata"].ConnectionString : Admin.DAL.Settings.ConnectionString; 
            DynamicEntitiesSettings.ConnectionStringVersion = ConfigurationManager.ConnectionStrings["DEData"] != null ? ConfigurationManager.ConnectionStrings["DEVersion"].ConnectionString : Admin.DAL.Settings.ConnectionString;
                

            //Провайдер SQL
            DynamicEntitiesSettings.CRUDProvider = SQLProvider.SQLServer;

            DynamicEntitiesSettings.CommandTimeout = 600;

            //Пересчет сумм
            VtbRestCalculator.SubscribeOnDynamicEntityNotifications();

            //Копирование бизнес сущностей в бюджет
            BudgetMethods.BusinessEntitiesCreations.Add("BudgetItem",BudgetItem.CopyToNewBudgetVersion);
        }

        private string SerializeDateFn(DateTime dateTime)
        {
            return dateTime.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fffK", CultureInfo.InvariantCulture);
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            HttpContext ctx = HttpContext.Current;
            Exception ex = ctx.Server.GetLastError();
            Logger.Log.Error(ex);

        }

        private static void CheckMetadata()
        {
            string path = HttpContext.Current.Server.MapPath("~/Update/metadata.xml");

            if (System.IO.File.Exists(path))
            {

                try
                {
                    var el = XElement.Load(path);
                    OptimaJet.Meta.MetaHelper.LoadXMLAndSaveInDB(el);
                    Logger.Log.Info("Metadata is imported and stored in a database.");

                    try 
                    {
                        System.IO.File.Delete(path);
                    }
                    catch (Exception ex)
                    {
                        Logger.Log.Error("Error with delete the metadata.");
                        Logger.Log.Error(ex);
                    }

                }
                catch (Exception ex)
                {
                    Logger.Log.Error("Error with import the metadata.");
                    Logger.Log.Error(ex);
                }
            }           
        }
       
    }
}