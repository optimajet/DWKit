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
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.CodeActions;
using OptimaJet.DWKit.Core.DataProvider;
using OptimaJet.DWKit.Core.Metadata;
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
        public static void Configure(IApplicationBuilder app, IConfigurationRoot configuration, string connectionStringName = "default")
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

            Configure(security, configuration, connectionStringName);
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

        private static void Configure(ISecurityProvider security, IConfigurationRoot configuration, string connectionstringName = "default")
        {
            #region License

            var licensefile = "license.key";
            if (File.Exists(licensefile))
            {
                try
                {
                    var licenseText = File.ReadAllText(licensefile);
                    DWKitRuntime.RegisterLicense(licenseText);
                }
                catch
                {
                    //TODO add write to log
                }
            }

            #endregion

#if (DEBUG)
            DWKitRuntime.UseMetadataCache = false;
            //CodeActionsCompiler.DebugMode = true;
#elif (RELEASE)
            DWKitRuntime.UseMetadataCache = true;
#endif

            DWKitRuntime.ConnectionStringData = configuration[$"ConnectionStrings:{connectionstringName}"];
            DWKitRuntime.DbProvider = AutoDetectProvider();
            DWKitRuntime.Security = security;


            var path = configuration["Metadata:path"];

            if (string.IsNullOrEmpty(path))
            {
                path = "Metadata/metadata.json";
            }

            DWKitRuntime.Metadata = new DefaultMetadataProvider(path, "Metadata/Forms", "Metadata/Localization");

            if (configuration["DWKit:BlockMetadataChanges"] == "True")
            {
                DWKitRuntime.Metadata.BlockMetadataChanges = true;
            }

            if (configuration["DWKit:BlockMetadataChanges"] == "True")
            {
                DWKitRuntime.Metadata.BlockMetadataChanges = true;
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

        }


        public static IDbProvider AutoDetectProvider()
        {
            IDbProvider provider = null;

            try
            {
                using (new System.Data.SqlClient.SqlConnection(DWKitRuntime.ConnectionStringData))
                {}

                provider = new SQLServerProvider();
            }
            catch (ArgumentException)
            {
            }

            if (provider == null)
            {
                try
                {
                    using (IDbConnection connection = new Npgsql.NpgsqlConnection(DWKitRuntime.ConnectionStringData)) {}
                    provider = new PostgreSqlProvider();
                }
                catch (ArgumentException)
                {
                }
            }

            if (provider == null)
            {
                try
                {
                    using (IDbConnection connection = new OracleConnection(DWKitRuntime.ConnectionStringData)) {}
                    provider = new OracleProvider();
                }
                catch (ArgumentException)
                {
                }
            }


            return provider;
        }
    }
}
