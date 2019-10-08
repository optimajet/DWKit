using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Security.IdentityProvider;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class StarterApplicationController : Controller
    {
        private IHostingEnvironment _env;

        public StarterApplicationController(IHostingEnvironment env)
        {
            _env = env;
            DWKitRuntime.Metadata.SetRootPath(_env.ContentRootPath);
        }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
    }
}
