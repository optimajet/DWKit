using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using IdentityServer4.Services;
using System.Threading.Tasks;
using IdentityServer4.Models;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHostingEnvironment _environment;
        private readonly ILogger<HomeController> _logger;
        private readonly IIdentityServerInteractionService _interaction;

        public HomeController(IHostingEnvironment environment, ILogger<HomeController> logger, IIdentityServerInteractionService interaction)
        {
            _environment = environment;
            _logger = logger;
            _interaction = interaction;
        }

        [Route("home/error")]
        public async Task<IActionResult> Error(string errorId)
        {
            var vm = new ErrorMessage()
            {
                Error = "empty",
                ErrorDescription = "empty"
            };


            // retrieve error details from identityserver
            var message = await _interaction.GetErrorContextAsync(errorId);
            if (message != null)
            {
                vm = message;
            }
            ViewBag.VM = vm;
            return View("Error", vm);
        }
    }
}
