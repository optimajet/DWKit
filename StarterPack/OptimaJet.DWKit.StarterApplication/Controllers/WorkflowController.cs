using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
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
using OptimaJet.Workflow.Core.Runtime;
using HashHelper = OptimaJet.DWKit.Core.Utils.HashHelper;

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
                object entityId;
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
                    if (Guid.TryParse(idValue, out Guid parsedGuid))
                    {
                        entityId = parsedGuid;
                    }
                    else
                    {
                        entityId = idValue;
                    }
                }
                else
                {
                    var data = await DataSource.GetDataForFormAsync(new GetDataRequest(name) { Filter = filterItems, FilterActionName = filterActionName });
                    entityId = data.Entity?.GetPrimaryKey();
                }

                var userId = GetUserId();
                var processId = GetProcessId(entityId, name);

                if (processId.HasValue && (await WorkflowInit.Runtime.IsProcessExistsAsync(processId.Value)))
                {
                    var commands = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(processId.Value, userId.ToString())).Select(c =>
                        new ClientWorkflowCommand() { Text = c.LocalizedName, Type = (byte)c.Classifier, Value = c.CommandName }).ToList();
                    var states = (await WorkflowInit.Runtime.GetAvailableStateToSetAsync(processId.Value)).Select(s =>
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

      

        [Route("workflow/execute")]
        [HttpPost]
        public async Task<ActionResult> ExecuteCommand(string name, string id, string command)
        {
            try
            {
                var processId = GetProcessIdFromString(id,name);
                
                var userId = GetUserId();

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(processId))
                {
                    var wfCommand = (await GetInitialCommands(name, userId)).FirstOrDefault(c => c.Value.Equals(command));
                    if (wfCommand == null)
                        return Json(new FailResponse("Command not found."));
                    await WorkflowInit.Runtime.CreateInstanceAsync(new CreateInstanceParams(wfCommand.Scheme, processId)
                    {
                        IdentityId = userId.ToString()
                    });
                }

                var commandObject = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(processId, userId.ToString())).FirstOrDefault(c => c.CommandName.Equals(command));

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
                var processId = GetProcessIdFromString(id,name);
                var userId = GetUserId();

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(processId))
                {
                    return Json(new FailResponse($"Process with id={id} is not found."));
                }

                await WorkflowInit.Runtime.SetStateAsync(processId, userId.ToString(), userId.ToString(), state);

                return Json(new SuccessResponse());
            }

            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }
        
        private static Guid GetProcessIdFromString(string id, string formName)
        {
            if (Guid.TryParse(id, out Guid idGuid))
                return idGuid;
            
            return HashHelper.FromString($"{formName}_{id}");
        }
        
        private static Guid? GetProcessId(object entityId, string formName)
        {
            if (entityId == null)
                return null;
            
            if (entityId is Guid entityIdAsGuid)
                return entityIdAsGuid;

            return HashHelper.FromString($"{formName}_{entityId}");
        }
        
        private static Guid GetUserId()
        {
            return DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.HasValue
                ? DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.Value
                : DWKitRuntime.Security.CurrentUser.Id;
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
