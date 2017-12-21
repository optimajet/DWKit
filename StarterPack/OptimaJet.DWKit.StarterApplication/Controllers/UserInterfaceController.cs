using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core;
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
                if(form == null)
                    throw new Exception("This form is not found!");

                if (!await DWKitRuntime.Security.CheckFormPermission(form, "View"))
                {
                    throw new Exception("Access denied!");
                }
                
                if (wrapResult)
                {
                    if (enableSecurity)
                    {
                        var userId = DWKitRuntime.Security.CurrentUser.GetOperationUserId();
                        await form.FillPermissions(userId);
                    }
                    return Json(new ItemSuccessResponse<object>(form));
                }

                string json = form.Source;
                if(string.IsNullOrEmpty(json))
                    throw new Exception("This form is not found!");
                return Json(Newtonsoft.Json.JsonConvert.DeserializeObject(json));
            }
            catch (Exception e)
            {
                if (wrapResult)
                    return Json(new FailResponse(e));
                throw;
            }
        }
        
        [Route("ui/form/businessobjects.js")]
        public async Task<ActionResult> GetFormsBusinesscode()
        {
            return Content(DWKitRuntime.Metadata.GetFormsBusinessCode());
        }
        
        [AllowAnonymous]
        [Route("ui/login")]
        public async Task<ActionResult> Login()
        {
            return await GetForm("login");
        }
    }
}
    
