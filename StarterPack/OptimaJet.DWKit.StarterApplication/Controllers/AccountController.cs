using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.DWKit.Core.View;
using OptimaJet.DWKit.StarterApplication.Models;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        [AllowAnonymous]
        [HttpGet]
        public ActionResult Login()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Login(string login, string password, bool remember)
        {
            if (await DWKitRuntime.Security.ValidateUserByLoginAsync(login, password))
            {
                await DWKitRuntime.Security.SignIn(login, remember);
                return Json(new SuccessResponse());
            }

            return Json(new FailResponse("Login or password is not correct."));
        }

        [Route("account/get")]
        public async Task<ActionResult> GetUserInfo()
        {
            try
            {
                return Json(new ItemSuccessResponse<User>(await DWKitRuntime.Security.GetCurrentUserAsync()));
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("account/logoff")]
        public async Task<ActionResult> Logoff()
        {
            try
            {
                await DWKitRuntime.Security.SignOut();
                return Redirect("/");
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }
    }
}
