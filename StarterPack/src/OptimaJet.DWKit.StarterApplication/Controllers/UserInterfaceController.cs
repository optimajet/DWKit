using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Metadata;
using OptimaJet.DWKit.Core.View;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class UserInterfaceController : Controller
    {
        [Route("ui/form/{name}")]
        public async Task<ActionResult> GetForm(string name, bool wrapResult = false, bool enableSecurity = false)
        {
            try
            {
                var form = DWKitRuntime.Metadata.GetForm(name);
                if (form == null)
                    throw new Exception("This form is not found!");

                return await GetForm(form, wrapResult, enableSecurity);
            }
            catch (Exception e)
            {
                if (wrapResult)
                    return Json(new FailResponse(e));
                throw;
            }
        }

        [Route("ui/flow/{name}")]
        public async Task<ActionResult> GetFlow(string name, string urlFilter, bool forCopy = false)
        {
            try
            {
                Guid? id = null;
                if (!forCopy && !string.IsNullOrEmpty(urlFilter))
                {
                    if (Guid.TryParse(urlFilter, out Guid entityId))
                        id = entityId;
                }

                var form = await BusinessFlow.GetForm(name, id).ConfigureAwait(false);
                if (form != null)
                {
                    return await GetForm(form, true, true).ConfigureAwait(false);
                }

                return Json(new FailResponse("The form is not found for this BusinessFlow!"));
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("ui/localization.js")]
        public ActionResult GetLocalization()
        {
            var cu = DWKitRuntime.Security.CurrentUser;
            if (cu == null)
            {
                return Content("");
            }
            var localization = cu.Localization;
            return Content(DWKitRuntime.Metadata.GetLocalizationScript(localization));
        }

        [Route("ui/form/businessobjects.js")]
        public ActionResult GetFormsBusinessCode()
        {
            return Content(DWKitRuntime.Metadata.GetFormsBusinessCode());
        }

        [AllowAnonymous]
        [Route("ui/login")]
        public async Task<ActionResult> Login()
        {
            return await GetForm("login");
        }

        private async Task<ActionResult> GetForm(Form form, bool wrapResult, bool enableSecurity)
        {
            if (!await DWKitRuntime.Security.CheckFormPermissionAsync(form, "View"))
            {
                throw new Exception("Access denied!");
            }

            var localization = DWKitRuntime.Security.CurrentUser?.Localization;
            if (!string.IsNullOrWhiteSpace(localization))
            {
                await form.FillCustomBlockFormsAndLocalizateAsync(localization);
            }
            else
            {
                await form.FillCustomBlockFormsAsync();
            }

            if (wrapResult)
            {
                if (enableSecurity)
                {
                    var userId = DWKitRuntime.Security.CurrentUser.GetOperationUserId();
                    await form.FillPermissionsAsync(userId);
                }
                await form.FillMappingAsync();
                return Json(new ItemSuccessResponse<object>(form));
            }

            string json = form.Source;
            if (string.IsNullOrEmpty(json))
                throw new Exception("This form is not found!");
            return Json(Newtonsoft.Json.JsonConvert.DeserializeObject(json));
        }

        private static bool NotNullOrEmpty(string urlFilter)
        {
            return !string.IsNullOrEmpty(urlFilter) && !urlFilter.Equals("null", StringComparison.OrdinalIgnoreCase);
        }
    }
}
