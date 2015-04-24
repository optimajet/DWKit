using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Security.Providers;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.BJet.VTB
{
    public class WorkflowCommandEqualityComparer : IEqualityComparer<WorkflowCommand>
    {
        public bool Equals(WorkflowCommand wc1, WorkflowCommand wc2)
        {
            return wc1.CommandName.Equals(wc2.CommandName, StringComparison.CurrentCultureIgnoreCase);
        }

        public int GetHashCode(WorkflowCommand wc)
        {
            return wc.CommandName.GetHashCode();
        }
    }

    public static class WorkflowOperations
    {
        public static List<WorkflowCommand> GetFormattedCommands(string id, Guid? entityRouteId)
        {
            var commands = new List<WorkflowCommand>();

            if (!entityRouteId.HasValue)
            {
                return commands;
            }

            if (!string.IsNullOrEmpty(id) && Workflow.Runtime.IsProcessExists(new Guid(id)))
            {
                var user = (string)CommonSettings.CurrentEmployee.SecurityUserId.ToString("N");
                commands = Workflow.Runtime.GetAvailableCommands(new Guid(id), user).Distinct(new WorkflowCommandEqualityComparer()).ToList();
            }
            else
            {
                List<string> users = new List<string>() { (string)CommonSettings.CurrentEmployee.SecurityUserId.ToString("N") };
                commands = Workflow.Runtime.GetInitialCommands(string.Empty, users, GetWorkflowParameters(entityRouteId.Value)).ToList();
            }
            
            return commands;
        }


        private static Dictionary<string, object> GetWorkflowParameters(Guid entityRouteId)
        {
            return new Dictionary<string, object>()
            {
                {"EntityRouteId", entityRouteId}
            };
        }

        public static List<WorkflowState> GetStates(Guid routeId, string processName)
        {
            return Workflow.Runtime.GetAvailableStateToSet(processName,GetWorkflowParameters(routeId)).ToList();
        }

        public static string GetFormattedStates(string id)
        {
            string emptyStates = "[]";

            if (string.IsNullOrEmpty(id))
            {
                return emptyStates;
            }

            var states = new List<WorkflowState>();

            try
            {
                states = Workflow.Runtime.GetAvailableStateToSet(new Guid(id)).ToList();
            }
            catch (Exception ex)
            {
                Logger.Log.Error(string.Format("Error in getting states from workflow, {0}", ex.Message), ex);
            }

            var convertedStates = new List<object>();

            foreach (var workflowState in states)
            {
                convertedStates.Add(new
                {
                    name = workflowState.Name,
                    text = workflowState.VisibleName
                });
            }

            return Serialize(convertedStates);

        }

        public static string ConvertWorkflowCommandToJSON(WorkflowCommand command)
        {
            var clientCommand = GetClientCommand(command);

            return ServiceStack.Text.JsonSerializer.SerializeToString(clientCommand);

        }

        public static string ConvertWorkflowCommandsToJSON(List<WorkflowCommand> commands)
        {
            var clientCommands = new List<object>();

            if (commands == null || !commands.Any())
            {
                return "[]";
            }

            foreach (var workflowCommand in commands)
            {
                var clientCommand = GetClientCommand(workflowCommand);

                clientCommands.Add(clientCommand);
            }

            return Serialize(clientCommands);
        }

        private static dynamic GetClientCommand(WorkflowCommand workflowCommand)
        {
            var form = GetForm(workflowCommand);

            string style = "btn-white";

            if (workflowCommand.Classifier == TransitionClassifier.Direct)
                style = "btn-primary";

            if (workflowCommand.Classifier == TransitionClassifier.Reverse)
                style = "btn-danger";

            dynamic clientCommand = new
            {
                text = workflowCommand.LocalizedName,
                name = workflowCommand.CommandName,
                style,
                form
            };
            return clientCommand;
        }

        private static string Serialize(List<object> clientCommands)
        {
            var sb = new StringBuilder("[");
            bool isFirst = true;

            foreach (var c in clientCommands)
            {
                if (!isFirst)
                    sb.Append(",");
                isFirst = false;
                sb.Append(ServiceStack.Text.JsonSerializer.SerializeToString(c));
            }

            sb.Append("]");

            return sb.Length > 0 ? sb.ToString() : "[]";
        }

        private static dynamic GetForm(WorkflowCommand workflowCommand)
        {
            if (workflowCommand.Parameters.Count() == 0)
                return null;

            var width = 500;
            var height = workflowCommand.Parameters.Count()*100 + 50;

            var items = new List<dynamic>();

            foreach (var parameter in workflowCommand.Parameters)
            {
                dynamic item = new
                {
                    fieldLabel = parameter.LocalizedName,
                    name = parameter.ParameterName,
                    allowBlank = AllowBlank(workflowCommand, parameter),
                    xtype = GetXType(parameter)
                };

                items.Add(item);
            }

            dynamic form = new
            {
                width,
                height,
                items = items.ToArray()
            };


            return form;
        }

        private static bool AllowBlank(WorkflowCommand workflowCommand, CommandParameter parameter)
        {
            List<string> requiredFields = new List<string>() {};

            if (requiredFields.Any(e => e.Equals(parameter.ParameterName, StringComparison.InvariantCultureIgnoreCase)))
            {
                return false;
            }

            if (workflowCommand.Classifier == TransitionClassifier.Reverse &&
                parameter.ParameterName.Equals("comment", StringComparison.CurrentCultureIgnoreCase))
            {
                return false;
            }
            else if (parameter.ParameterName.Equals("comment", StringComparison.CurrentCultureIgnoreCase))
            {
                return true;
            }

            var type = Type.GetType(parameter.TypeName);
            return type.IsNullable();
        }

        private static string GetXType(CommandParameter parameter)
        {
            var type = Type.GetType(parameter.TypeName);

            if (type.IsNullable())
            {
                type = type.GetUnderlyingType();
            }

            if (type == typeof (string))
                return "textarea";
            if (type == typeof (bool))
                return "checkboxfield";
            if (type.IsNumeric())
                return "numberfield";
            if (type == typeof (DateTime))
                return "datefield";

            return "textfield";

        }

        public static bool Execute(Guid processId, string commandName, Dictionary<string, object> parameters,
            out string message)
        {
            InitializeIfNotExistProcess(processId);
           
            Guid identityId = SecurityCache.CurrentUser.Id;
            Guid impersonatedIdentityId = CommonSettings.CurrentEmployee.SecurityUserId;
            var availCommands = Workflow.Runtime.GetAvailableCommands(processId, 
                new List<string>(){ 
                    identityId.ToString("N"),
                    impersonatedIdentityId.ToString("N")
                }).ToList();
            return Execute(processId, commandName, parameters, out message, availCommands, identityId,impersonatedIdentityId);
        }

        private static bool Execute(Guid processId, string commandName, Dictionary<string, object> parameters, out string message,
            List<WorkflowCommand> availCommands, Guid identityId, Guid impersonatedIdentityId)
        {
            var commandToExecute =
                availCommands.FirstOrDefault(
                    c => c.CommandName.Equals(commandName, StringComparison.CurrentCultureIgnoreCase));

            if (commandToExecute == null)
            {
                message = "Command not found";
                return false;
            }

            foreach (var p in parameters)
            {
                if(commandToExecute.Parameters.Any(c=> c.ParameterName == p.Key))
                    commandToExecute.SetParameter(p.Key, p.Value);
            }

            try
            {
                Workflow.Runtime.ExecuteCommand(processId, identityId.ToString("N"), impersonatedIdentityId.ToString("N"), commandToExecute);
                Notification.DocumentCommandExecute(processId, identityId, identityId, commandToExecute);

                if (commandToExecute.Classifier == TransitionClassifier.Direct)
                {
                    var newCommands = Workflow.Runtime.GetAvailableCommands(processId, impersonatedIdentityId.ToString("N")).ToList();
                    var newCommand =
                        newCommands.FirstOrDefault(
                            c =>
                                c.CommandName.Equals(commandToExecute.CommandName,
                                    StringComparison.InvariantCultureIgnoreCase) &&
                                c.Classifier == TransitionClassifier.Direct);
                    if (newCommand != null)
                    {
                        var newParameters = new Dictionary<string, object>
                        {
                            {"Comment", string.Format("Automatic execution of command {0}", newCommand.LocalizedName)}
                        };
                        var res = Execute(processId, newCommand.CommandName, newParameters, out message, newCommands,
                            identityId, impersonatedIdentityId);
                        return res;
                    }
                }
            }
            catch (Exception ex)
            {
                message = ex.Message;
                return false;
            }
            message = null;
            return true;
        }

        public static bool SetState(Guid processId, string name, Dictionary<string, object> parameters,
            out string message)
        {
            Guid identityId = CommonSettings.CurrentEmployee.SecurityUserId;//SecurityCache.CurrentUser.Id;

            if (!Workflow.Runtime.IsProcessExists(processId))
            {
                message = "Process not exists";
                return false;
            }

            try
            {
                Workflow.Runtime.SetState(processId, identityId.ToString("N"), identityId.ToString("N"), name, parameters);
                Notification.DocumentSetState(processId, identityId, identityId, name, parameters);
            }
            catch (Exception ex)
            {
                Logger.Log.Error(ex);
                message = ex.Message;
                return false;
            }

            message = null;
            return true;
        }
        
        public static bool UpdateRoutes(Guid id, out string message)
        {
            message = null;

            var allBudgetItemIds =
                DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.Equal(id, "EntityRouteId"))
                    .Select(bi => (Guid) bi.Id)
                    .ToList();
            var parameters = new Dictionary<string, object>() {{"EntityRouteId", id}};
            foreach (var budgetItemId in allBudgetItemIds)
            {
                Workflow.Runtime.UpdateSchemeIfObsolete(budgetItemId,parameters);
            }

            return true;
        }

        public static void SetRoute(Guid id, Guid routeId)
        {
            var view = GetDocumnetTypeById(id);
            var item = DynamicRepository.GetByView(view, FilterCriteriaSet.And.Equal(id, "Id")).FirstOrDefault();

            if (item == null)
                throw new Exception("Object is not found");

            if (item.EntityRouteId != null && item.EntityRouteId == routeId)
                return;

            item.EntityRouteId = routeId;
            DynamicRepository.UpdateByView(view, new List<dynamic>() { item });
            InitializeIfNotExistProcess(item.Id, routeId);
        }

        public static Guid? GetRoute(Guid id)
        {
            var view = GetDocumnetTypeById(id);
            var item = DynamicRepository.GetByView(view, FilterCriteriaSet.And.Equal(id, "Id")).FirstOrDefault();

            if (item == null)
                return null;

            return item.EntityRouteId;
        }

        public static string GetPrevComment(string id)
        {
            var historyRow = DynamicRepository.GetByEntity("WorkflowHistory", 
                FilterCriteriaSet.And.Equal(id, "ProcessId"), 
                OrderByCriteriaSet.Desc("Date"),
                PagingCriteria.Create(0, 1)).FirstOrDefault();

            string res = string.Empty;
            if(historyRow != null)
            {
                res = historyRow.Comment;
            }

            return res;
        }

        public static string GetFormattedRoutesForUser(Guid userId)
        {
            var routes = GetRoutesForUser(userId);
            var sb = new StringBuilder("[");
            bool isFirst = true;

            foreach (var route in routes)
            {
                if (!isFirst)
                    sb.Append(",");
                isFirst = false;

                var routeItem = new
                {
                    name = route.Name,
                    id = route.Id
                };

                sb.Append(ServiceStack.Text.JsonSerializer.SerializeToString(routeItem));
            }

            sb.Append("]");

            return sb.ToString();
        }

        public static List<dynamic> GetRoutesForUser(Guid userId)
        {
            string filterStr = string.Format(@"Id in 
(select EntityRouteId from [dbo].[EntityRouteUser] 
    where SecurityUserId = @UserIdValue) OR (select COUNT(*) from [dbo].[EntityRouteUser] where EntityRoute.Id = EntityRouteId) = 0");
            
            var param = new Dictionary<string, object>();
            param.Add("UserIdValue", userId);
            FilterCriteriaSet filter = FilterCriteriaSet.And.Custom(filterStr, param);
            return DynamicRepository.GetByEntity("EntityRoute", filter, OrderByCriteriaSet.Asc("Name"));
        }

        public static string GetDocumnetTypeById(Guid id)
        {
            var types = new string[] { "BudgetItem_Edit" };

            foreach (string t in types)
            {
                var obj = DynamicRepository.GetByView(t, FilterCriteriaSet.And.Equal(id, "Id")).FirstOrDefault();
                if (obj != null)
                {
                    return t;
                }
            }

            throw new Exception("Unknow documnet type. Please, check global action CheckDocumentType.");
        }

        private static void InitializeIfNotExistProcess(Guid processId, Guid? routeId = null)
        {
            if (Workflow.Runtime.IsProcessExists(processId))
                return;

            if(!routeId.HasValue)
            {
                routeId = GetRoute(processId);
            }

            if (!routeId.HasValue)
            {
                throw new Exception("EntityRouteId is not defined!");
            }

            string schemaCode = string.Format("Route_{0}", routeId.Value.ToString("N"));
            Workflow.Runtime.CreateInstance(schemaCode, processId,
                    new Dictionary<string, object>() { { "EntityRouteId", routeId.Value } });

            //else
            //{

            //    var instance =
            //        DynamicRepository.GetByEntity("WorkflowProcessInstance",
            //            FilterCriteriaSet.And.Equal(item.Item1, "Id")).FirstOrDefault();
            //    if (instance != null)
            //    {
            //        instance.IsDeterminingParametersChanged = true;
            //    }

            //    DynamicRepository.UpdateByEntity("WorkflowProcessInstance", new List<dynamic> { instance });
            //}
        }
    }
}
