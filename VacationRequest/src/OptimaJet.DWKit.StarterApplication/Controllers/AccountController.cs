using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.DWKit.Core.View;

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
        [Route("account/external")]
        [HttpGet]
        public async Task<ActionResult> ExternalProviders()
        {
            return Json(await DWKitRuntime.Security.GetExternalProvidersAsync());
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Login(string login, string password, bool remember)
        {
            if (await DWKitRuntime.Security.ValidateUserByLoginAsync(login, password))
            {
                await DWKitRuntime.Security.SignInAsync(login, remember);
                return Json(new SuccessResponse());
            }

            return Json(new FailResponse("Login or password is not correct."));
        }

        [Route("account/get")]
        public async Task<ActionResult> GetUserInfo()
        {
            try
            {
                var user = await DWKitRuntime.Security.GetCurrentUserAsync();
                user.DefaultForm = DWKitRuntime.DefaultForm;
                return Json(new ItemSuccessResponse<User>(user));
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
                await DWKitRuntime.Security.SignOutAsync();
                return Redirect("/");
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("account/profile")]
        public async Task<ActionResult> Profile(string data)
        {
            var isPost = Request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase);
            if (!isPost)
            {
                var cu = DWKitRuntime.Security.CurrentUser;
                if (cu == null)
                    return Json(new FailResponse("The current user is not found!"));

                object obj = null;
                obj = new
                {
                    cu.Name,
                    cu.Email,
                    cu.Localization,
                    Roles = string.Join(", ", cu.Roles),
                    Groups = string.Join(", ", cu.Groups),
                    IsRTL = cu.IsRTL,
                    Theme = cu.Theme
                };
                return Json(obj);
            }
            else
            {
                var cu = DWKitRuntime.Security.CurrentUser;
                if (cu == null)
                    return Json(new FailResponse("The current user is not found!"));

                var su = await Core.Metadata.DbObjects.SecurityUser.SelectByKey(DWKitRuntime.Security.CurrentUser.Id);
                if (su == null)
                    return Json(new FailResponse("The current user is not found!"));

                su.StartTracking();
                var dataJson = JToken.Parse(data);

                su.Email = dataJson["email"].ToString();
                su.Localization = dataJson["localization"].ToString();
                bool isRTL = false;
                if (bool.TryParse(dataJson["isRTL"].ToString(), out isRTL))
                {
                    su.IsRTL = isRTL;
                }

                su.Theme = dataJson["theme"].ToString();

                await su.ApplyAsync();
                return Json(new SuccessResponse());
            }
        }
    }
}
