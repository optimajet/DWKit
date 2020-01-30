using System;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Application;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Security;
using System.Linq;
using OptimaJet.DWKit.Core.Autocomplete;

namespace OptimaJet.DWKit.StarterApplication
{
    public class Startup
    {
        private const string _defaultCorsPolicyName = "localhost";

        public IHostingEnvironment Environment { get; }
        private readonly ILoggerFactory _loggerFactory;

        public Startup(IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            Environment = env;

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();

            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();
            _loggerFactory = loggerFactory;
        }

        public IConfigurationRoot Configuration { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            // Add framework services.
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton(_loggerFactory);
            services.AddSingleton((p) => WorkflowInit.Runtime);

            /*
             // DEPRECATED. You should uncomment this code if you still continue using old SecurityProvider for some reasons.
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options => {
                options.ExpireTimeSpan = TimeSpan.FromDays(365);
                options.LoginPath = "/Account/Login/";
            });*/

            services.ConfigureIdentityServer(Configuration, Environment, _loggerFactory.CreateLogger<Startup>());

            //TODO: Here you can initialize external authentication providers like as Facebook or OpenID Connect.
            //var authBuilder = new AuthenticationBuilder(services);
            //authBuilder.AddFacebook(options => {
            //   options.ClientId = "<App ID>";
            //   options.ClientSecret = "<App Secret>";
            //   options.SignInScheme = IdentityServer4.IdentityServerConstants.ExternalCookieAuthenticationScheme;
            //});


            services.AddMvc(options => {
                options.Filters.Add(typeof(AuthorizationFilter));
                options.Filters.Add(
                         new ResponseCacheFilter(
                            new CacheProfile()
                            {
                                NoStore = true
                            }));
                options.Conventions.Add(new Security.OpenIdConnect.AuthorizationPolicyConvention(Configuration));
            });

            services.AddSignalR(o =>
            {
                o.EnableDetailedErrors = true;
            });
            services.AddSingleton<IUserIdProvider, SignalRIdProvider>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseCors(Configuration, "CorsSettings");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            // DEPRECATED. You should uncomment this code if you still continue using old SecurityProvider for some reasons.
            //app.UseAuthentication();

            // UseIdentityServer includes a call to UseAuthentication
            app.UseIdentityServer();

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute("form", "form/{formName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("flow", "flow/{flowName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                routes.MapRoute("account", "account/{action}",
                    defaults: new { controller = "Account", action = "Index" });
                routes.MapRoute(
                    name: "default",
                    template: "{controller=StarterApplication}/{action=Index}/");
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<ClientNotificationHub>("/hubs/notifications");
                routes.MapHub<AutocompleteHub>(AutocompleteHub.SignalRUrl);
            });

            //app.ApplicationServices.GetRequiredService<CustomCookieAuthenticationEvents>()

            //DWKIT Init
            Configurator.Configure(app, Configuration, logger: _loggerFactory.CreateLogger<Startup>());

            /*
            // DEPRECATED. You should uncomment this code if you still continue using old SecurityProvider for some reasons.
            Configurator.Configure(
               (IHttpContextAccessor)app.ApplicationServices.GetService(typeof(IHttpContextAccessor)),
               (IHubContext<ClientNotificationHub>)app.ApplicationServices.GetService(typeof(IHubContext<ClientNotificationHub>)),
               Configuration);*/

#if DEBUG
            TelemetryConfiguration.Active.DisableTelemetry = true;
#endif
        }
    }
}
