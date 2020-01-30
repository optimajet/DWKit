using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Security.OpenIdConnect;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public class ExternalController : Controller
    {
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IExternalLogonService _externalLogonService;

        public ExternalController(IIdentityServerInteractionService interaction,
            IExternalLogonService externalLogonService)
        {
            _interaction = interaction;
            _externalLogonService = externalLogonService;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("external/challenge")]
        public ActionResult Challenge(string name, string returnUrl = null)
        {
            if (string.IsNullOrEmpty(returnUrl)) returnUrl = "~/";

            // validate returnUrl - either it is a valid OIDC URL or back to a local page
            if (Url.IsLocalUrl(returnUrl) == false && _interaction.IsValidReturnUrl(returnUrl) == false)
            {
                // user might have clicked on a malicious link - should be logged
                throw new Exception("invalid return URL");
            }

            // start challenge and roundtrip the return URL and scheme 
            var props = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(Callback)),
                Items =
                {
                    { "returnUrl", returnUrl },
                    { "scheme", name },
                }
            };

            return Challenge(props, name);

        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Callback()
        {
            return Redirect(await _externalLogonService.Callback());
        }
    }
}
