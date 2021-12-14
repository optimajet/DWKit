using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.IntegrationApi;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public sealed class IntegrationApiAuthenticationFilter : IAsyncAuthorizationFilter
    {
        private static readonly string Message =
            $"Parameter '{IntegrationApiKeys.ApiKey}' or header '{IntegrationApiKeys.HeaderApiKey}' is required";

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            if (string.IsNullOrWhiteSpace(DWKitRuntime.IntegrationApiKey))
            {
                context.Result = new UnauthorizedObjectResult("IntegrationApiKey must have value. Set it in DWKit settings");
                return;
            }

            context.HttpContext.Request.EnableBuffering();
            var queryDictionary = await IntegrationApiHttp.GetParametersFromRequest(context.HttpContext.Request);
            context.HttpContext.Request.Body.Position = 0;
            queryDictionary.TryGetValue(IntegrationApiKeys.ApiKey, out var queryKey);
            if (await Authenticate(queryKey).ConfigureAwait(false)) return;

            var (_, headerValue) = context.HttpContext.Request.Headers.FirstOrDefault(header =>
                header.Key.Equals(IntegrationApiKeys.HeaderApiKey, StringComparison.OrdinalIgnoreCase));
            if (!await Authenticate(headerValue.ToString()).ConfigureAwait(false))
            {
                context.Result = new UnauthorizedObjectResult(Message);
            }
        }

        private static async Task<bool> Authenticate(string key)
        {
            if (string.IsNullOrWhiteSpace(key) || !key.Equals(DWKitRuntime.IntegrationApiKey, StringComparison.Ordinal)) return false;

            var login = DWKitRuntime.IntegrationApiLogin;
            await DWKitRuntime.Security.AuthenticateAsync(login).ConfigureAwait(false);
            return true;
        }
    }
}
