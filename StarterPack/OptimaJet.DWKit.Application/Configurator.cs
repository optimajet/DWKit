using System;
using System.Data;
using System.Diagnostics;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.CodeActions;
using OptimaJet.DWKit.Core.DataProvider;
using OptimaJet.DWKit.Core.Metadata;
using OptimaJet.DWKit.MSSQL;
using OptimaJet.DWKit.PostgreSQL;
using OptimaJet.DWKit.Security.Providers;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    public static class Configurator
    {
        static Configurator()
        {
        }

        public static void Configure(IHttpContextAccessor httpContextAccessor,IConfigurationRoot configuration, string connectionstringName = "default")
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
#elif (RELEASE)
            DWKitRuntime.UseMetadataCache = true;
#endif

            DWKitRuntime.ConnectionStringData = configuration[$"ConnectionStrings:{connectionstringName}"];
            DWKitRuntime.DbProvider = AutoDetectProvider();
            DWKitRuntime.Security = new SecurityProvider(httpContextAccessor);
            DWKitRuntime.Metadata = new DefaultMetadataProvider("Metadata/metadata.json", "Metadata/Forms", "Metadata/Localization");

            if (configuration["DWKit:BlockMetadataChanges"] == "True")
            {
                DWKitRuntime.Metadata.BlockMetadataChanges = true;
            }
            
            CodeActionsCompiller.RegisterAssembly(typeof(WorkflowRuntime).Assembly);
            CodeActionsCompiller.DebugMode = true;
            //DWKitRuntime.CompileAllCodeActionsAsync().Wait();
            DWKitRuntime.ServerActions.RegisterUsersProvider("filters", new Filters());
            DWKitRuntime.ServerActions.RegisterUsersProvider("triggers", new Triggers());
        }
        
        public static IDbProvider AutoDetectProvider()
        {
            IDbProvider provider = null;

            try
            {
                using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(DWKitRuntime.ConnectionStringData)) { };
                provider = new SQLServerProvider();
            }
            catch (ArgumentException) { }

            if (provider == null)
            {
                try
                {
                    using (IDbConnection connection = new Npgsql.NpgsqlConnection(DWKitRuntime.ConnectionStringData)) { };
                    provider = new PostgreSqlProvider();
                }
                catch (ArgumentException) { }
            }

            return provider;
        }
    }
}
