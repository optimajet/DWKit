using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.Core.IntegrationApi;
using OptimaJet.DWKit.Core.View;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public class IntegrationApiController : Controller
    {
        [Authorize]
        [Route("swagger/{mode?}/{name?}")]
        [HttpGet]
        public async Task<ActionResult> GetSwaggerFile()
        {
            try
            {
                var swagger = await IntegrationApiHttp.GetSwaggerSpecsAsync(HttpContext.Request);
                var filename = "dwkit.yaml";
                var contentType = "application/yaml";

                return File(Encoding.UTF8.GetBytes(swagger), contentType, filename);
            }
            catch (Exception ex)
            {
                return Json(new FailResponse(ex));
            }
        }
        
        [Route("api/{operation?}/model/{name?}/{level?}/{id?}")]
        [HttpGet]
        [HttpPost]
        public async Task<ActionResult> ModelApi()
        {
            try
            {
                var result = await IntegrationApiHttp.Process(HttpContext.Request);
                return Json(result);
            }
            catch (Exception ex)
            {
                return Json(new IntegrationApiFailResponse(ex));
            }
        }
        
        [Route("api/{operation?}/form/{name?}/{id?}")]
        [HttpGet]
        [HttpPost]
        public async Task<ActionResult> FormApi()
        {
            try
            {
                var result = await IntegrationApiHttp.Process(HttpContext.Request);
                return Json(result);
            }
            catch (Exception ex)
            {
                return Json(new IntegrationApiFailResponse(ex));
            }
        }

    }
}