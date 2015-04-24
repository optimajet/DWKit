using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using OptimaJet.BJet;
using OptimaJet.BJet.VTB;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core.Runtime;
using ServiceStack.Text;
using OptimaJet.Common;
using OptimaJet.Security;
using OptimaJet.Localization;
using System.IO;
using System.Collections.Specialized;

namespace Workspaces.Controllers
{
    public class WorkflowController : Controller
    {
        static string errorMessageConst = LocalizationProvider.Provider.Get("The operation failed.");
        static string successMessageConst = LocalizationProvider.Provider.Get("The operation success.");
        static string itemsMessageConst = LocalizationProvider.Provider.Get("Items");
        static string itemMessageConst = LocalizationProvider.Provider.Get("Item");

        #region multi

        public ActionResult MultiGetState(string ids, string processName)
        {
            var idsList = ids.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => new Guid(x)).ToList();

            var items = DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.In(idsList, "Id")).ToList();

            var grouppedStates = new Dictionary<Guid, Tuple<string, List<object>, List<Guid>, List<long>>>();

            var routeIds =
                items.Where(i => i.EntityRouteId != null).Select(i => (Guid) i.EntityRouteId).Distinct().ToList();

            if (!routeIds.Any())
                return GetSuccessResult();

            var routes = DynamicRepository.GetByEntity("EntityRoute", FilterCriteriaSet.And.In(routeIds, "Id")).ToList();

            foreach (var route in routes)
            {
                var routeId = (Guid)route.Id;

                var states = WorkflowOperations.GetStates(routeId, processName);
                var routeStates =
                    new Tuple<string, List<object>, List<Guid>, List<long>>(
                        route.Name,
                        states.Select(s=>new {name=s.Name, text=s.VisibleName} as object).ToList(),
                        items.Where(i => i.EntityRouteId == routeId).Select(i => (Guid) i.Id).ToList(),
                        items.Where(i => i.EntityRouteId == routeId).Select(i => (long) i.NumberId).ToList());
                grouppedStates.Add(routeId, routeStates);
            }


            if (!grouppedStates.Any())
                return GetSuccessResult();
            
            var sb = new StringBuilder("[");
            bool isFirst = true;

            foreach (var c in grouppedStates)
            {
                if (!isFirst)
                    sb.Append(",");
                isFirst = false;

                var item = new
                {
                    routeid =c.Key,
                    routename = c.Value.Item1,
                    ids = c.Value.Item3.ToFormattedString(",", false),
                    numbers = c.Value.Item4.ToFormattedString(", ", false),
                    states =  JsonSerializer.SerializeToString(c.Value.Item2)
                };

                sb.Append(JsonSerializer.SerializeToString(item));
            }

            sb.Append("]");

            if (sb.Length > 0)
            {
                return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = string.Format("{{\"success\" : true, \"values\" : {0}}}", sb)
                };
            }

            return GetSuccessResult();



        }

        public ActionResult MultiGetCommand(string ids, string processName )
        {
            var idsList = ids.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => new Guid(x)).ToList();
            //var numbersList = numbers.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => int.Parse(x)).ToList();

            var items = DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.In(idsList, "Id")).ToList();

            var grouppedCommands = new Dictionary<string, Tuple<WorkflowCommand, List<Guid>, List<long>>>();

            for (int i = 0; i < idsList.Count; i++)
            {
                var id = idsList[i];
                var item = items.FirstOrDefault(bi => bi.Id.Equals(id));
                if (item == null)
                    continue;

                var commands = BudgetItem.GetCommands(item);
                foreach (var command in commands)
                {
                    Tuple<WorkflowCommand, List<Guid>, List<long>> value;

                    if (grouppedCommands.ContainsKey(command.CommandName))
                    {
                        value = grouppedCommands[command.CommandName];
                    }
                    else
                    {
                        value = new Tuple<WorkflowCommand, List<Guid>, List<long>>(command, new List<Guid>(),
                            new List<long>());
                        grouppedCommands.Add(command.CommandName, value);
                    }

                    value.Item2.Add(id);
                    value.Item3.Add(item.NumberId);
                }
            }

            if (!grouppedCommands.Any())
                return GetSuccessResult();

            var sb = new StringBuilder("[");
            bool isFirst = true;

            foreach (var c in grouppedCommands)
            {
                if (!isFirst)
                    sb.Append(",");
                isFirst = false;

                var item = new
                {
                    ids = c.Value.Item2.ToFormattedString(",",false),
                    numbers = c.Value.Item3.ToFormattedString(", ",false),
                    command = WorkflowOperations.ConvertWorkflowCommandToJSON(c.Value.Item1)
                };

              

                sb.Append(JsonSerializer.SerializeToString(item));
            }

            sb.Append("]");

            if (sb.Length > 0)
            {
                var routes = WorkflowOperations.GetFormattedRoutesForUser(CommonSettings.CurrentEmployee.SecurityUserId);
                  return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = string.Format("{{\"success\" : true, \"values\" : {0},\"routes\": {1}}}",sb,routes)
                };
            }

            return GetSuccessResult();
        }

        [HttpPost]
        public ActionResult MultiExecuteCommand(string ids, string processName, string commandName, string parameters )
        {
            return MultiExecute(ids, commandName, parameters, false);
        }

        private static ActionResult MultiExecute(string ids, string commandName, string parameters, bool isSetState)
        {
            var idsList = ids.Split(',').Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => new Guid(x)).ToList();

            var items = DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.In(idsList, "Id")).ToList();
            var succesNumbers = new List<long>();
            var errors = new List<Tuple<long, string>>();
            foreach (var id in idsList)
            {
                var item = items.FirstOrDefault(bi => bi.Id.Equals(id));
                if (item == null)
                    continue;
                string message;
                var res = Execute(id, commandName, parameters, isSetState, out message);
                if (res)
                {
                    succesNumbers.Add(item.NumberId);
                }
                else
                {
                    errors.Add(new Tuple<long, string>(item.NumberId, message));
                }
            }

            var report = new StringBuilder();

            if (succesNumbers.Any())
            {
                report.AppendFormat("{0} {1} - {2}", itemsMessageConst,
                    succesNumbers.OrderBy(s => s).ToList().ToFormattedString(", ", false),
                    successMessageConst);
            }

            if (succesNumbers.Any() && errors.Any())
                report.Append("</br>");

            if (errors.Any())
            {
                for (int i = 0; i < errors.Count; i++)
                {
                    var error = errors[i];
                    report.AppendFormat("{0} {1} - {2}",
                        itemMessageConst,
                        error.Item1,
                        error.Item2);

                    if (i < errors.Count - 1)
                        report.Append("</br");
                }
            }

            var reportMessage = report.ToString();

            if (!errors.Any())
            {
                return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = string.Format("{{\"success\" : true, \"message\" : \"{0}\"}}", reportMessage)
                };
            }

            return new ContentResult
            {
                ContentEncoding = Encoding.UTF8,
                Content = string.Format("{{\"success\" : false, \"message\" : \"{0}\"}}", reportMessage)
            };
        }

        [HttpPost]
        public ActionResult MultiSetState(string ids, string processName, string stateName, string parameters)
        {
            return MultiExecute(ids, stateName, parameters, true);
        }
        #endregion

        [HttpPost]
        public ActionResult ExecuteCommand(Guid id, string processName, string commandName, string parameters, string visibility)
        {
            return Execute(id, commandName, parameters, false);
        }

        [HttpPost]
        public ActionResult SetState(Guid id, string processName, string stateName, string parameters, string visibility)
        {
            return Execute(id, stateName, parameters, true);
        }

        private static ActionResult Execute(Guid id, string name, string parameters, bool isSetState)
        {
            try
            {
                var commandParameters = GetParameters(parameters);

                if(commandParameters.Any(p=> p.Key == "EntityRoute"))
                {
                    var routeParam = commandParameters.Single(c => c.Key == "EntityRoute");
                    WorkflowOperations.SetRoute(id, new Guid(routeParam.Value.ToString()));
                }

                string message = null;
                var result = false;
                
                if (isSetState)
                    result = WorkflowOperations.SetState(id, name, commandParameters, out  message);
                else
                    result = WorkflowOperations.Execute(id, name, commandParameters, out  message);

                if (!result)
                    return GetErrorResult(message);
                return GetSuccessResult();
            }
            catch (Exception ex)
            {
                Logger.Log.Error(ex);
                return GetErrorResult(ex);
            }
        }

        private static bool Execute(Guid id, string name, string parameters, bool isSetState, out string message)
        {
            try
            {
                var commandParameters = GetParameters(parameters);

                if (commandParameters.Any(p => p.Key == "EntityRoute"))
                {
                    var routeParam = commandParameters.Single(c => c.Key == "EntityRoute");
                    WorkflowOperations.SetRoute(id, new Guid(routeParam.Value.ToString()));
                }

                message = null;
                bool result;

                if (isSetState)
                    result = WorkflowOperations.SetState(id, name, commandParameters, out  message);
                else
                    result = WorkflowOperations.Execute(id, name, commandParameters, out  message);

                if (!result)
                {
                    return false;
                }
                return true;
            }
            catch (Exception ex)
            {
                message = ex.Message;
                return false;
            }
        }

        [HttpPost]
        public  ActionResult UpdateRoutes(Guid id)
        {
            try
            {
                string message = null;
                var result = WorkflowOperations.UpdateRoutes(id,out message);
             
                if (!result)
                    return GetErrorResult(message);
                return GetSuccessResult();
            }
            catch (Exception ex)
            {
                return GetErrorResult(ex);
            }
        }

        public ActionResult API()
        {
            Stream filestream = null;
            if (Request.Files.Count > 0)
                filestream = Request.Files[0].InputStream;

            var pars = new NameValueCollection();
            pars.Add(Request.Params);

            if (Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase))
            {
                var parsKeys = pars.AllKeys;
                foreach (var key in Request.Form.AllKeys)
                {
                    if (!parsKeys.Contains(key))
                    {
                        pars.Add(Request.Form);
                    }
                }
            }

            var res = OptimaJet.BJet.VTB.Workflow.Runtime.DesignerAPI(pars, filestream, true);
            if (pars["operation"].ToLower() == "downloadscheme")
                return File(UTF8Encoding.UTF8.GetBytes(res), "text/xml", "scheme.xml");
            return Content(res);
        }

        #region private
        private static ActionResult GetSuccessResult()
        {
            return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = JsonSerializer.SerializeToString(new { success = true })
                };
        }

 

        private static ActionResult GetErrorResult(string message)
        {
            string errorMessage = string.Concat(errorMessageConst, Environment.NewLine, message);
            return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = JsonSerializer.SerializeToString(new { success = false, message = errorMessage })
                };
        }

        private static ActionResult GetErrorResult(Exception ex)
        {
            string errorMessage = string.Concat(errorMessageConst, Environment.NewLine, ex.Message);
            return new ContentResult
                {
                    ContentEncoding = Encoding.UTF8,
                    Content = JsonSerializer.SerializeToString(new { success = false, message = errorMessage })
                };
        }

        private static Dictionary<string, object> GetParameters(string parameters)
        {
            var commandParameters = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(parameters))
            {
                commandParameters = JsonSerializer.DeserializeFromString<Dictionary<string, object>>(parameters);
            }
            //TODO Затычка
         

         
            return commandParameters;
        }
        #endregion
    }
}
