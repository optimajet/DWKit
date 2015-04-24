using System;
using System.Configuration;
using System.Globalization;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using OptimaJet.Common;
using Admin.Helpers;
using OptimaJet.Security.Providers;
using OptimaJet.DynamicEntities.View;
using OptimaJet.DynamicEntities;
using OptimaJet.Security;
using OptimaJet.DynamicEntities.SQLDataProvider;
using Admin.DAL;

namespace Admin
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new AuthorizeAttribute());
            filters.Add(new HandleErrorAttribute());
            filters.Add(new SecurityFilter());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "CustomRoute",
                "{controller}/customroute/{page}/{orderBy}/{filter}",
                new {controller = "Grid", action = "CustomRoute", page = 1, orderBy = "", filter = ""});

            routes.MapRoute(
               "Default", // Route name
               "{controller}/{action}/{id}", // URL with parameters
               new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
               );
        }

        protected void Application_Start()
        {
            //var securityProviderType = Type.GetType(ConfigurationManager.AppSettings["SecurityProvider"]);
            //SecurityCache.Provider = (ISecurityProvider)Activator.CreateInstance(securityProviderType);

            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
            Logger.InitLogger();
            Scheduler.Start();

            Thread.CurrentThread.CurrentUICulture = new CultureInfo("en");
            Thread.CurrentThread.CurrentCulture = new CultureInfo("en");

            ConfigureDynamicEntities();
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            HttpContext ctx = HttpContext.Current;
            Exception ex = ctx.Server.GetLastError();
            Logger.Log.Error(ex);
        }

        private static void ConfigureDynamicEntities()
        {

            bool useTransactionScopeInTransactions = true;
            if (Settings.Current.ParamExists("UseTransactionScopeInTransactions"))
            {
                bool.TryParse(Settings.Current["UseTransactionScopeInTransactions"], out useTransactionScopeInTransactions);
            }

            DynamicEntityJSONDataSource.UseTransactionScopeInTransactions = useTransactionScopeInTransactions;

            //disble for remote database
            bool ignoreTransactions = false;
            if (Settings.Current.ParamExists("IgnoreTransactions"))
            {
                bool.TryParse(Settings.Current["IgnoreTransactions"], out ignoreTransactions);
            }
            DynamicEntityJSONDataSource.IgnoreTransactions = ignoreTransactions;

            //Only for test. For production need set 'true'
            DynamicEntitiesSettings.UseMetadataCache = false;
            DynamicEntitiesSettings.UseExecutorCache = false;

            DynamicEntitiesSettings.EventLogger = new EventsLogHelper();

            DynamicEntitiesSettings.FieldsToIdentifyName.Add("Code");
            DynamicEntitiesSettings.FieldsToIdentifyName.Add("Name");

            CurrentSettings.InitConnection();

            //Provider SQL
            DynamicEntitiesSettings.CRUDProvider = SQLProvider.SQLServer;
        }
    }
}