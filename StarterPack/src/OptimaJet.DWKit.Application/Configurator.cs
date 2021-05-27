using System;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.CodeActions;
using OptimaJet.DWKit.Core.DataProvider;
using OptimaJet.DWKit.Core.Metadata;
using OptimaJet.DWKit.Core.ORM;
using OptimaJet.DWKit.Core.ORM.Interceptors;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.DWKit.Core.Utils;
using OptimaJet.DWKit.MSSQL;
using OptimaJet.DWKit.Oracle;
using OptimaJet.DWKit.PostgreSQL;
using OptimaJet.DWKit.Security.Providers;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core.Runtime;
using Oracle.ManagedDataAccess.Client;

namespace OptimaJet.DWKit.Application
{
    public static class Configurator
    {
        public static void Configure(IApplicationBuilder app, IConfigurationRoot configuration, string connectionStringName = "default",
            ILogger logger = null)
        {
            var httpContextAccessor = (IHttpContextAccessor)app.ApplicationServices.GetService(typeof(IHttpContextAccessor));
            var notificationHubContext = (IHubContext<ClientNotificationHub>)app.ApplicationServices.GetService(typeof(IHubContext<ClientNotificationHub>));
            var eventService = (IEventService)app.ApplicationServices.GetService(typeof(IEventService));
            var authenticationSchemeProvider = (IAuthenticationSchemeProvider)app.ApplicationServices.GetService(typeof(IAuthenticationSchemeProvider));
            var ldap = configuration.GetSection("LDAPConf").Get<Security.IdentityProvider.LDAPConf>();

            if (notificationHubContext != null)
            {
                DWKitRuntime.HubContext = notificationHubContext;
            }

            var security = new DefaultSecurityProvider(httpContextAccessor, eventService, authenticationSchemeProvider, ldap);

            Configure(security, configuration, connectionStringName, logger);
        }

        [Obsolete]
        public static void Configure(IHttpContextAccessor httpContextAccessor, IHubContext<ClientNotificationHub> notificationHubContext, IConfigurationRoot configuration,
            string connectionStringName = "default")
        {
            DWKitRuntime.HubContext = notificationHubContext;
            Configure(httpContextAccessor, configuration, connectionStringName);
        }

        [Obsolete]
        public static void Configure(IHttpContextAccessor httpContextAccessor, IConfigurationRoot configuration, string connectionstringName = "default")
        {
            Configure(new SecurityProvider(httpContextAccessor, configuration.GetSection("LDAPConf").Get<Security.IdentityProvider.LDAPConf>()), configuration, connectionstringName);
        }

        private static void Configure(ISecurityProvider security, IConfigurationRoot configuration,
            string connectionstringName = "default", ILogger logger = null)
        {
            DWKitRuntime.LicensePath = configuration["DWKit:LicensePath"] ?? string.Empty;
            DWKitRuntime.CheckLicense();

            #if (DEBUG)
            DWKitRuntime.UseMetadataCache = false;
            CodeActionsCompiler.DebugMode = true;
            #elif (RELEASE)
            DWKitRuntime.UseMetadataCache = true;
            #endif

            if (!string.IsNullOrWhiteSpace(configuration["DWKit:StoreSchemesInMetadataFolder"]))
            {
                DWKitRuntime.StoreSchemesInMetadataFolder = bool.Parse(configuration["DWKit:StoreSchemesInMetadataFolder"]);
            }

            DWKitRuntime.ConnectionStringData = configuration[$"ConnectionStrings:{connectionstringName}"];
            DWKitRuntime.DbProvider = AutoDetectProvider(configuration, logger);

            DWKitRuntime.AddExtraProvider("mssql", new SQLServerProvider());
            DWKitRuntime.AddExtraProvider("postgresql", new PostgreSqlProvider());
            DWKitRuntime.AddExtraProvider("oracle", new OracleProvider());

            DWKitRuntime.Security = security;
            DWKitRuntime.QueryInterceptor = GetQueryInterceptor();

            var path = configuration["DWKit:MetadataPath"];
            string metadataPath = null;

            if (string.IsNullOrEmpty(path))
            {
                path = Path.Combine("Metadata", "metadata.json");
                metadataPath = "Metadata";
            }else
            {
                metadataPath = Path.GetDirectoryName(path);
            }

            DWKitRuntime.Metadata = new DefaultMetadataProvider(path,
                Path.Combine(metadataPath, "Forms"),
                Path.Combine(metadataPath, "Localization"),
                workflowFolder: Path.Combine(metadataPath, "Workflow"),
                mobileFormFolder: Path.Combine(metadataPath, "MobileForms"));

            if ("true".Equals(configuration["DWKit:DeveloperMode"], StringComparison.InvariantCultureIgnoreCase))
            {
                DWKitRuntime.Metadata.DeveloperMode = true;
            }

            if ("true".Equals(configuration["DWKit:BlockMetadataChanges"], StringComparison.InvariantCultureIgnoreCase))
            {
                DWKitRuntime.Metadata.BlockMetadataChanges = true;
            }

            if (!string.IsNullOrWhiteSpace(configuration["DWKit:ResourceFolder"]))
            {
                DWKitRuntime.Metadata.ResourceFolder = configuration["DWKit:ResourceFolder"];
            }

            if (!string.IsNullOrWhiteSpace(configuration["DWKit:CodeActionsDebugMode"]))
            {
                DWKitRuntime.CodeActionsDebugMode = bool.Parse(configuration["DWKit:CodeActionsDebugMode"]);
            }

            CodeActionsCompiler.RegisterAssembly(typeof(WorkflowRuntime).Assembly);
            //It is necessary to have this assembly for compile code with dynamic
            CodeActionsCompiler.RegisterAssembly(typeof(Microsoft.CSharp.RuntimeBinder.Binder).Assembly);
            DWKitRuntime.CompileAllCodeActionsAsync().Wait();
            DWKitRuntime.ServerActions.RegisterUsersProvider("filters", new Filters());
            DWKitRuntime.ServerActions.RegisterUsersProvider("triggers", new Triggers());
            DWKitRuntime.ServerActions.RegisterUsersProvider("actions", new FormActions());

            //Forcing the creation of a WF runtime to initialize timers and the Flow.
            try
            {
                WorkflowInit.ForceInit();
            }
            catch (Exception e)
            {
                if (Debugger.IsAttached)
                {
                    var info = ExceptionUtils.GetExceptionInfo(e);
                    var errorBuilder = new StringBuilder();
                    errorBuilder.AppendLine("Workflow engine start failed.");
                    errorBuilder.AppendLine($"Message: {info.Message}");
                    errorBuilder.AppendLine($"Exceptions: {info.Exeptions}");
                    errorBuilder.Append($"StackTrace: {info.StackTrace}");
                    Debug.WriteLine(errorBuilder);
                }
            }


            //Init plugins
            DWKitRuntime.InitPlugins().Wait();
        }

        public static IInterceptor GetQueryInterceptor()
        {
            return new CompositeInterceptor(new MasterTableInterceptor());
        }

        #region detect db provider
        public static IDbProvider AutoDetectProvider(IConfigurationRoot configuration, ILogger logger)
        {
            IDbProvider provider = null;
            bool createDb = "true".Equals(configuration["DWKit:CreateDatabaseObjects"], StringComparison.InvariantCultureIgnoreCase);

            try
            {
                using (new System.Data.SqlClient.SqlConnection(DWKitRuntime.ConnectionStringData))
                { }

                provider = new SQLServerProvider();

                if (createDb)
                {
                    CreateDatabaseIfNotExists(configuration, new MSSQL.DbCreator(DWKitRuntime.ConnectionStringData), "MSSQL", logger);
                }
            }
            catch (ArgumentException)
            {
            }

            if (provider == null)
            {
                try
                {
                    using (IDbConnection connection = new Npgsql.NpgsqlConnection(DWKitRuntime.ConnectionStringData)) { }
                    provider = new PostgreSqlProvider();

                    if (createDb)
                    {
                        CreateDatabaseIfNotExists(configuration, new PostgreSQL.DbCreator(DWKitRuntime.ConnectionStringData), "PostgreSql", logger);
                    }
                }
                catch (ArgumentException)
                {
                }
            }

            if (provider == null)
            {
                try
                {
                    using (IDbConnection connection = new OracleConnection(DWKitRuntime.ConnectionStringData)) { }
                    provider = new OracleProvider();

                    if (createDb)
                    {
                        CreateDatabaseIfNotExists(configuration, new Oracle.DbCreator(DWKitRuntime.ConnectionStringData), "Oracle", logger);
                    }
                }
                catch (ArgumentException)
                {
                }
            }

            if (provider == null)
            {
                throw new Exception($"Can't autodetect provider for connection string: {DWKitRuntime.ConnectionStringData}");
            }


            return provider;
        }

        private static void CreateDatabaseIfNotExists(IConfigurationRoot configuration, IDbCreator dbCreator, string providerName, ILogger logger)
        {
            var databaseScriptList = configuration["DWKit:DatabaseScriptList"];

            if (string.IsNullOrWhiteSpace(databaseScriptList))
            {
                databaseScriptList = Path.Combine("..", "DB", providerName, "create_db.txt");
            }

            if (!File.Exists(databaseScriptList))
            {
                logger?.LogWarning($"Script list file for database creation doesn't exist. Expected file path: {databaseScriptList}");
            }
            else
            {
                dbCreator.CreateDatabaseIfNotExists(databaseScriptList, logger);
            }
        }
        #endregion
    }
}
