using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core.View;
using OptimaJet.DWKit.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using OptimaJet.DWKit.Core.Configurations;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class ConfigAPIController : Controller
    {
        private IWebHostEnvironment _env;
        private readonly IConfigurationRoot _configuration;

        public ConfigAPIController(IWebHostEnvironment env)
        {
            _env = env;
            DWKitRuntime.Metadata.SetRootPath(_env.ContentRootPath);

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            _configuration = builder.Build();
        }

        [Route("Admin")]
        public ActionResult Admin()
        {
            if (!CheckAccess())
            {
                return AccessDenied();
            }
            return View("Admin");
        }

        [Route("ConfigAPI")]
        public async Task<ActionResult> API()
        {
            if (!CheckAccess())
            {
                return AccessDenied();
            }

            var pars = new NameValueCollection();
            foreach (var item in Request.Query)
            {
                pars.Add(item.Key, item.Value);
            }

            if(Request.HasFormContentType)
            {
                foreach (var item in Request.Form)
                {
                    pars.Add(item.Key, item.Value);
                }
            }

            Stream filestream = null;
            var isPost = Request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase);
            if (isPost && Request.HasFormContentType && Request.Form.Files.Count > 0)
                filestream = Request.Form.Files[0].OpenReadStream();

            try
            {
                var res = await DWKitRuntime.Metadata.ConfigAPI(pars, filestream);

                if (res is StreamItem zipArchive)
                {
                    Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition");
                    return File(zipArchive.Content, "application/octet-stream;", zipArchive.Name);
                }

                return Json(res);
            }
            catch (Exception ex)
            {
                return Json(new FailResponse(ex));
            }
        }

        private bool CheckAccess()
        {
            var role = _configuration["DWKit:AdminRole"];
            if (string.IsNullOrEmpty(role) || role == "*")
                return true;

            return (DWKitRuntime.Security.CurrentUser != null && DWKitRuntime.Security.CurrentUser.IsInRole(role));
        }

        private ActionResult AccessDenied()
        {
            return Content("It's just for admins!");
        }
    }
}
