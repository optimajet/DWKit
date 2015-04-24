using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace Admin.Helpers
{
    public class SecurityFilter : FilterAttribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (HttpContext.Current.Request.QueryString.AllKeys.Contains("ConnectionKey"))
            {
                var connectionKey = HttpContext.Current.Request.QueryString["ConnectionKey"];
                Admin.Helpers.CurrentSettings.SetConnectionKeyToCookies(connectionKey);
                InitConnection(connectionKey);
            }
            else if(HttpContext.Current.Request.Cookies.AllKeys.Contains("ConnectionKey"))
            {
                var connectionKey = HttpContext.Current.Request.Cookies["ConnectionKey"];
                if (Admin.DAL.Settings.ConnectionKey != connectionKey.Value)
                {
                    InitConnection(connectionKey.Value);
                }
            }

            if (HttpContext.Current.Request.QueryString.AllKeys.Contains("LangKey"))
            {
                var lang = HttpContext.Current.Request.QueryString["LangKey"];
                if (!string.IsNullOrEmpty(lang))
                {
                    Admin.Helpers.CurrentSettings.SetLangToCookies(lang);
                    InitCulture(lang);
                }
            }
            else if(HttpContext.Current.Request.Cookies.AllKeys.Contains("LangKey"))
            {
                var lang = HttpContext.Current.Request.Cookies["LangKey"];
                if (!string.IsNullOrEmpty(lang.Value) && Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName != lang.Value)
                {
                    InitCulture(lang.Value);
                }
            }
            else
            {
                InitCulture("en");
            }

            string controllerName = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName;

            if (controllerName == "Account")
                return;

            bool isAllow = SecurityCache.CheckPermission("Common", "AccessToAdminPanel");
           
            if (!isAllow)
            {
                filterContext.HttpContext.Response.Redirect("~/Account/AccessDenied");
            }
        }

        private void InitConnection(string connectionKey)
        {
            Admin.DAL.Settings.ConnectionKey = connectionKey;

            CurrentSettings.InitConnection();
            Admin.DAL.Settings.Current.AppSettingsReset();
        }

        private void InitCulture(string lang)
        {
            Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(lang);
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(lang);
        }
    }


}