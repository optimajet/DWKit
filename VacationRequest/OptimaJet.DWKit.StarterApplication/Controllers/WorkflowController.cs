using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.View;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class WorkflowController : Controller
    {
        private IHostingEnvironment _env;
        private IConfigurationRoot _configuration;
        public WorkflowController(IHostingEnvironment env)
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

        [Route("workflow/designerapi")]
        public IActionResult DesignerAPI()
        {
            Stream filestream = null;
            var isPost = Request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase);
            if (isPost && Request.Form.Files != null && Request.Form.Files.Count > 0)
                filestream = Request.Form.Files[0].OpenReadStream();

            var pars = new NameValueCollection();
            foreach (var q in Request.Query)
            {
                pars.Add(q.Key, q.Value.First());
            }


            if (isPost)
            {
                var parsKeys = pars.AllKeys;
                foreach (var key in Request.Form.Keys)
                {
                    if (!parsKeys.Contains(key))
                    {
                        pars.Add(key, Request.Form[key]);
                    }
                }
            }

            var operation = pars["operation"].ToLower();
            if (operation == "save")
            {
                if (!CheckAccess())
                {
                    return AccessDenied();
                }

                if (DWKitRuntime.Metadata.BlockMetadataChanges)
                    return Content("ConfigAPI: Changes are locked!");
            }

            var res = WorkflowInit.Runtime.DesignerAPI(pars, filestream);

            if (pars["operation"].ToLower() == "downloadscheme")
                return File(Encoding.UTF8.GetBytes(res), "text/xml", "scheme.xml");
            if (pars["operation"].ToLower() == "downloadschemebpmn")
                return File(Encoding.UTF8.GetBytes(res), "text/xml", "scheme.bpmn");

            return Content(res);
        }

        [Route("workflow/get")]
        public async Task<ActionResult> GetData(string name, string urlFilter)
        {
            try
            {
                Guid? entityId;
                string filterActionName = null;
                string idValue = null;
                var filterItems = new List<ClientFilterItem>();

                if (NotNullOrEmpty(urlFilter))
                {
                    try
                    {
                        filterItems.AddRange(JsonConvert.DeserializeObject<List<ClientFilterItem>>(urlFilter));
                    }
                    catch
                    {
                        if (DWKitRuntime.ServerActions.ContainsFilter(urlFilter))
                        {
                            filterActionName = urlFilter;
                        }
                        else
                        {
                            idValue = urlFilter;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(idValue))
                {
                    entityId = Guid.Parse(idValue);
                }
                else
                {
                    var data = await DataSource.GetDataForFormAsync(new GetDataRequest(name) { Filter = filterItems, FilterActionName = filterActionName });
                    entityId = (Guid?)data.Entity?.GetId();
                }

                var userId = GetUserId();

                if (entityId.HasValue && (await WorkflowInit.Runtime.IsProcessExistsAsync(entityId.Value)))
                {
                    var commands = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(entityId.Value, userId.ToString())).Select(c =>
                        new ClientWorkflowCommand() { Text = c.LocalizedName, Type = (byte)c.Classifier, Value = c.CommandName }).ToList();
                    var states = (await WorkflowInit.Runtime.GetAvailableStateToSetAsync(entityId.Value)).Select(s =>
                        new ClientWorkflowState() { Value = s.Name, Text = s.VisibleName }).ToList();

                    return Json(new ItemSuccessResponse<ClientWorkflowResponse>(new ClientWorkflowResponse() { Commands = commands, States = states }));
                }
                else
                {
                    var commands = await GetInitialCommands(name, userId);
                    return Json(new ItemSuccessResponse<ClientWorkflowResponse>(new ClientWorkflowResponse() { Commands = commands, States = new List<ClientWorkflowState>() }));
                }
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        private static Guid GetUserId()
        {
            return DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.HasValue
                ? DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.Value
                : DWKitRuntime.Security.CurrentUser.Id;
        }

        [Route("workflow/execute")]
        [HttpPost]
        public async Task<ActionResult> ExecuteCommand(string name, string id, string command)
        {
            try
            {
                var idGuid = Guid.Parse(id);
                var userId = GetUserId();

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(idGuid))
                {
                    var wfcommand = (await GetInitialCommands(name, userId)).FirstOrDefault(c => c.Value.Equals(command));
                    if (wfcommand == null)
                        return Json(new FailResponse("Command not found."));
                    await WorkflowInit.Runtime.CreateInstanceAsync(new CreateInstanceParams(wfcommand.Scheme, idGuid)
                    {
                        IdentityId = userId.ToString()
                    });
                }

                var commandObject = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(idGuid, userId.ToString())).FirstOrDefault(c => c.CommandName.Equals(command));

                if (commandObject == null)
                    return Json(new FailResponse("Command not found."));

                await WorkflowInit.Runtime.ExecuteCommandAsync(commandObject, userId.ToString(), userId.ToString());

                return Json(new SuccessResponse());
            }

            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("workflow/set")]
        [HttpPost]
        public async Task<ActionResult> SetState(string name, string id, string state)
        {
            try
            {
                var idGuid = Guid.Parse(id);
                var userId = GetUserId();

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(idGuid))
                {
                    return Json(new FailResponse($"Process with id={id} is not found."));
                }

                await WorkflowInit.Runtime.SetStateAsync(idGuid, userId.ToString(), userId.ToString(), state);

                return Json(new SuccessResponse());
            }

            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        private static bool NotNullOrEmpty(string urlFilter)
        {
            return !string.IsNullOrEmpty(urlFilter) && !urlFilter.Equals("null", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<List<ClientWorkflowCommand>> GetInitialCommands(string name, Guid userId)
        {
            List<string> schemeNames = DWKitRuntime.Metadata.GetWorkflowByForm(name);
            var commands = new List<ClientWorkflowCommand>();
            if (schemeNames != null)
            {
                foreach (var schemeName in schemeNames)
                {
                    var schemeCommands = (await WorkflowInit.Runtime.GetInitialCommandsAsync(schemeName,
                        userId.ToString())).Select(c =>
                        new ClientWorkflowCommand()
                        {
                            Text = c.LocalizedName,
                            Type = (byte)c.Classifier,
                            Value = c.CommandName,
                            Scheme = schemeName
                        }).ToList();

                    commands.AddRange(schemeCommands.Where(a => commands.All(b => a.Value != b.Value)));
                }
            }
            return commands;
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
