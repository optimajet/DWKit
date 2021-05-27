using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OptimaJet.DWKit.Application;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Metadata.CommandForms;
using OptimaJet.DWKit.Core.View;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core.Model;
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

            var res = WorkflowInit.Runtime.DesignerAPI(pars, out _, filestream);
            return Content(res);
        }

        [Route("workflow/get")]
        public async Task<ActionResult> GetData(string name, string urlFilter, bool forCopy = false, bool loadParameters = false, string schemeName = null)
        {
            try
            {
                object entityId = null;
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
                        var filterActions = DWKitRuntime.ServerActions.GetFilterNames().Where(n => n.Equals(urlFilter, StringComparison.OrdinalIgnoreCase)).ToList();
                        string filterAction = null;
                        filterAction = filterActions.Count == 1 ? filterActions.First()
                            : filterActions.FirstOrDefault(n => n.Equals(urlFilter, StringComparison.Ordinal));

                        if (!string.IsNullOrEmpty(filterAction))
                            filterActionName = filterAction;
                        else
                        {
                            idValue = urlFilter;
                        }
                    }
                }

                if (!forCopy)
                {
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
                    else if (filterItems.Any() || !string.IsNullOrEmpty(filterActionName))
                    {
                        var (entity, _) = await DataSource.GetDataForFormAsync(new GetDataRequest(name)
                        {
                            Filter = filterItems,
                            FilterActionName = filterActionName
                        }).ConfigureAwait(false);
                        ;

                        entityId = entity?.GetPrimaryKey();
                    }
                }

                var userId = GetUserId();
                var processId = GetProcessId(entityId, name);
                var culture = DWKitRuntime.Security.CurrentUser?.GetCulture() ?? CultureInfo.CurrentCulture;

                if (processId.HasValue && (await WorkflowInit.Runtime.IsProcessExistsAsync(processId.Value).ConfigureAwait(false)))
                {
                    var info = await WorkflowInit.Runtime.GetProcessSchemeAsync(processId.Value);

                    var commands = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(processId.Value, userId.ToString(), culture).ConfigureAwait(false))
                        .Select(c => new ClientWorkflowCommand { Text = c.LocalizedName, Type = (byte)c.Classifier, Value = c.CommandName, Scheme = info.Name }).ToList();

                    var states = (await WorkflowInit.Runtime.GetAvailableStateToSetAsync(processId.Value, culture).ConfigureAwait(false))
                        .Select(s => new ClientWorkflowState { Value = s.Name, Text = s.VisibleName }).ToList();

                    await new FormFillStrategy().FillFormForCommandsAsync(commands).ConfigureAwait(false);

                    var processParams = new Dictionary<string, object>();

                    if (loadParameters)
                    {
                        var pi = await WorkflowInit.Runtime.GetProcessInstanceAndFillProcessParametersAsync(processId.Value).ConfigureAwait(false);
                        foreach (var p in pi.ProcessParameters.Where(p => p.Purpose != Workflow.Core.Model.ParameterPurpose.System))
                        {
                            processParams.Add(p.Name, p.GetDynamicValue());
                        }
                    }

                    return Json(new ItemSuccessResponse<ClientWorkflowResponse>(new ClientWorkflowResponse()
                    {
                        Commands = commands,
                        States = states,
                        ProcessExists = true,
                        ProcessParameters = processParams
                    }));
                }
                else
                {
                    var commands = await GetInitialCommands(name, userId, culture, schemeName).ConfigureAwait(false);
                    await new FormFillStrategy().FillFormForCommandsAsync(commands).ConfigureAwait(false);
                    return Json(new ItemSuccessResponse<ClientWorkflowResponse>(new ClientWorkflowResponse()
                    { Commands = commands, States = new List<ClientWorkflowState>(), ProcessExists = false }));
                }
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }



        [Route("workflow/execute")]
        [HttpPost]
        public async Task<ActionResult> ExecuteCommand(string name, string id, string command, string data, string schemeName)
        {
            try
            {
                var processId = GetProcessIdFromString(id, name, schemeName);
                var userId = GetUserId();
                var culture = DWKitRuntime.Security.CurrentUser?.GetCulture() ?? CultureInfo.CurrentCulture;

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(processId))
                {
                    var wfCommand = (await GetInitialCommands(name, userId, culture, schemeName)).FirstOrDefault(c => c.Value.Equals(command));
                    if (wfCommand == null)
                        return Json(new FailResponse("Command not found."));
                    var createParams = new CreateInstanceParams(wfCommand.Scheme, processId)
                    {
                        IdentityId = DWKitRuntime.Security.CurrentUser?.Id.ToString(),
                        ImpersonatedIdentityId = userId.ToString()
                    };

                    createParams.AddPersistentParameter("ObjectId", processId.ToString())
                        .AddPersistentParameter("InitialForm", name);
                    await WorkflowInit.Runtime.CreateInstanceAsync(createParams);
                }

                var commandObject = (await WorkflowInit.Runtime.GetAvailableCommandsAsync(processId, userId.ToString(), culture)).FirstOrDefault(c => c.CommandName.Equals(command));

                if (commandObject == null)
                    return Json(new FailResponse("Command not found."));

                var instance = await WorkflowInit.Runtime.GetProcessInstanceAndFillProcessParametersAsync(processId);

                var scheme = await WorkflowInit.Runtime.Builder.GetProcessSchemeAsync(instance.SchemeCode).ConfigureAwait(false);

                if (!string.IsNullOrWhiteSpace(data))
                {
                    var json = JObject.Parse(data);

                    foreach (var t in json.Properties())
                    {
                        if (t.Name == "__id") continue;

                        var parameter = scheme.Parameters.FirstOrDefault(p => p.Name == t.Name);

                        if (parameter != null)
                        {
                            commandObject.SetParameter(t.Name, t.ToObject(parameter.Type));
                        }
                        else
                        {
                            commandObject.SetParameter(t.Name, t.Value.ToObject<object>());
                        }
                    }
                }

                var executionResult = await WorkflowInit.Runtime.ExecuteCommandAsync(commandObject, DWKitRuntime.Security.CurrentUser?.Id.ToString(), userId.ToString());
                var res = new
                {
                    EntityId = executionResult.ProcessInstance.ProcessId,
                    Entity = executionResult.ProcessInstance.ProcessParameters
                        .ToDictionary(c => c.Name,
                            v => v.Value)
                };

                return Json(new ItemSuccessResponse<object>(res));
            }

            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("workflow/set")]
        [HttpPost]
        public async Task<ActionResult> SetState(string name, string id, string state, string data, string schemeName)
        {
            try
            {
                var processId = GetProcessIdFromString(id, name, schemeName);
                var userId = GetUserId();

                if (!await WorkflowInit.Runtime.IsProcessExistsAsync(processId))
                {
                    return Json(new FailResponse($"Process with id={id} is not found."));
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();

                if (!string.IsNullOrWhiteSpace(data))
                {
                    var json = JObject.Parse(data);

                    foreach (var t in json.Properties())
                    {
                        parameters.Add(t.Name, t.Value.ToObject<object>());
                    }
                }

                await WorkflowInit.Runtime.SetStateAsync(processId, DWKitRuntime.Security.CurrentUser?.Id.ToString(), userId.ToString(), state, parameters);

                return Json(new SuccessResponse());
            }

            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        private static Guid GetProcessIdFromString(string id, string formName, string schemeName)
        {
            if (Guid.TryParse(id, out Guid idGuid))
                return idGuid;

            if (id == null || id.Contains("CLIENT__"))
            {
                if (!string.IsNullOrEmpty(schemeName))
                    return Guid.NewGuid();

                id = "SPECIALWORKFLOW";
            }

            return HashHelper.FromString($"{formName}_{id}");
        }

        private static Guid? GetProcessId(object entityId, string formName)
        {
            if (entityId is Guid entityIdAsGuid)
                return entityIdAsGuid;

            if (entityId == null)
                return null;

            if (entityId is string && ((string)entityId).Contains("CLIENT__"))
            {
                entityId = "SPECIALWORKFLOW";
            }

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

        private async Task<List<ClientWorkflowCommand>> GetInitialCommands(string name, Guid userId, CultureInfo culture, string schemeName)
        {
            List<string> schemeNames = string.IsNullOrEmpty(schemeName) ? DWKitRuntime.Metadata.GetWorkflowByForm(name) :
                new List<string>(){schemeName};
            var commands = new List<ClientWorkflowCommand>();
            if (schemeNames != null)
            {
                foreach (var scheme in schemeNames)
                {
                    var schemeCommands = (await WorkflowInit.Runtime.GetInitialCommandsAsync(scheme,
                        userId.ToString(), culture)).Select(c =>
                        new ClientWorkflowCommand()
                        {
                            Text = c.LocalizedName,
                            Type = (byte)c.Classifier,
                            Value = c.CommandName,
                            Scheme = scheme
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
