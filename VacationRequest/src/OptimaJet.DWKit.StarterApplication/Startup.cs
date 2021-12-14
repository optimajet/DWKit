using System;
using System.Collections.Generic;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using OptimaJet.DWKit.Application;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Security;
using System.Linq;
using IdentityServer4.Models;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using OptimaJet.DWKit.Core.Autocomplete;

namespace OptimaJet.DWKit.StarterApplication
{
    public class Startup
    {
        private const string _defaultCorsPolicyName = "localhost";

        public IWebHostEnvironment Environment { get; }
        private readonly ILoggerFactory _loggerFactory;

        public Startup(IWebHostEnvironment env)
        {
            Environment = env;

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();

            _loggerFactory = LoggerFactory.Create(loggingBuilder =>
            {
                loggingBuilder.AddConfiguration(Configuration.GetSection("Logging"));
                loggingBuilder.AddConsole();
                loggingBuilder.AddDebug();
            });
        }

        public IConfigurationRoot Configuration { get; }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
            var mvcBuilder = services.AddControllersWithViews();
            var useDateTimeZoneHandling = GetConfigParam("DWKit:UseDateTimeZoneHandling", bool.Parse, false);
            if (useDateTimeZoneHandling)
            {
                var dateTimeZoneHandling = GetConfigParam("DWKit:DateTimeZoneHandling",
                    s => Enum.TryParse(s, out DateTimeZoneHandling result) ? result : DateTimeZoneHandling.Utc,
                    DateTimeZoneHandling.Utc);
                var dateFormatString = GetConfigParam("DWKit:DateFormatString", s => s, "yyyy'-'MM'-'dd'T'HH':'mm':'ssZ");
                mvcBuilder.AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.DateTimeZoneHandling = dateTimeZoneHandling;
                    options.SerializerSettings.DateFormatString = dateFormatString;
                });
            }
            else
            {
                mvcBuilder.AddNewtonsoftJson();
            }
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

            var extraClients = new List<Client>()
            {
                //TODO: Insert your clients for OpenId Connect
                //https://identityserver4.readthedocs.io/en/latest/quickstarts/1_client_credentials.html#defining-the-client
            };

            services.ConfigureIdentityServer(Configuration,
                Environment,
                _loggerFactory.CreateLogger<Startup>(),
                extraClients);

            //TODO: Here you can initialize external authentication providers like as Facebook or OpenID Connect.
            //var authBuilder = new AuthenticationBuilder(services);
            //authBuilder.AddFacebook(options => {
            //   options.ClientId = "<App ID>";
            //   options.ClientSecret = "<App Secret>";
            //   options.SignInScheme = IdentityServer4.IdentityServerConstants.ExternalCookieAuthenticationScheme;
            //});


            services.AddMvc(options => {
                options.Filters.Add(typeof(AuthorizationFilter));
                options.Filters.Add(new ResponseCacheAttribute
                    {
                        NoStore = true,
                        Location = ResponseCacheLocation.None
                    });
            });

            services.AddSignalR(o =>
            {
                o.EnableDetailedErrors = true;
            }).AddNewtonsoftJsonProtocol();
            services.AddSingleton<IUserIdProvider, SignalRIdProvider>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.ConfigureForwardHeaders(Configuration, logger: _loggerFactory.CreateLogger<Startup>());

            app.UseCors(Configuration, "CorsSettings");
            app.UseCookiePolicy(new CookiePolicyOptions
            {
                MinimumSameSitePolicy = SameSiteMode.None,
                Secure = CookieSecurePolicy.SameAsRequest,
            });

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

            app.UseRouting();

            // UseIdentityServer includes a call to UseAuthentication
            app.UseIdentityServer();
            app.UseAuthorization();
            app.UseStaticFiles();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapControllerRoute("form", "form/{formName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                endpoints.MapControllerRoute("flow", "flow/{flowName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                endpoints.MapControllerRoute("workflow", "workflow/{workflowName}/{*other}",
                    defaults: new { controller = "StarterApplication", action = "Index" });
                endpoints.MapControllerRoute("account", "account/{action}",
                    defaults: new { controller = "Account", action = "Index" });
                endpoints.MapControllerRoute(
                    name: "default",
                    "{controller=StarterApplication}/{action=Index}/");

                endpoints.MapHub<ClientNotificationHub>("/hubs/notifications");
                endpoints.MapHub<AutocompleteHub>(AutocompleteHub.SignalRUrl);
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

        private T GetConfigParam<T>(string name, Func<string, T> converter, T defaultValue)
        {
            var value = Configuration[name];
            return !string.IsNullOrWhiteSpace(value) ? converter(value) : defaultValue;
        }
    }
}
