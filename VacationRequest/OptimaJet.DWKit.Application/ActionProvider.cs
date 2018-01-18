using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    public class ActionProvider : OptimaJet.Workflow.Core.Runtime.IWorkflowActionProvider
    {
        private readonly Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>> _actions = new Dictionary<string, Action<ProcessInstance, WorkflowRuntime, string>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>> _asyncActions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>> _conditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, bool>>();

        private readonly Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>> _asyncConditions =
            new Dictionary<string, Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<bool>>>();

        public ActionProvider()
        {
            //Register your actions in _actions and _asyncActions dictionaries
            _asyncActions.Add("WriteTransitionHistory", WriteTransitionHistoryAsync);
            _asyncActions.Add("UpdateTransitionHistory", UpdateTransitionHistoryAsync);

            //Register your conditions in _conditions and _asyncConditions dictionaries
             _asyncConditions.Add("CheckBigBossMustSign", CheckBigBossMustSignAsync); 
        }

        private async Task WriteTransitionHistoryAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            if (processInstance.IdentityIds == null)
                return;

            var currentstate = WorkflowInit.Runtime.GetLocalizedStateName(processInstance.ProcessId, processInstance.CurrentState);

            var nextState = WorkflowInit.Runtime.GetLocalizedStateName(processInstance.ProcessId, processInstance.ExecutedActivityState);

            var command = WorkflowInit.Runtime.GetLocalizedCommandName(processInstance.ProcessId, processInstance.CurrentCommand);

            var userModel = await MetadataToModelConverter.GetEntityModelByModelAsync("dwSecurityUser");
            var userNames = (await userModel.GetAsync(
                Filter.And.In(processInstance.IdentityIds.Select(c=> 
                    Guid.Parse(c)).ToList(), "Id")))
                .Select(u => u["Name"].ToString()).OrderBy(n => n).ToList();
            var userNamesString = String.Join(',', userNames);

            var historyItem = new DynamicEntity();
            var dm = (dynamic) historyItem;
            dm.Id = Guid.NewGuid();
            dm.AllowedToEmployeeNames = userNamesString ?? string.Empty;
            dm.DestinationState = nextState;
            dm.DocumentId = processInstance.ProcessId;
            dm.InitialState = currentstate;
            dm.Command = command;

            var historyModel = await MetadataToModelConverter.GetEntityModelByModelAsync("DocumentTransitionHistory");
            await historyModel.InsertSingleAsync(historyItem);
        }

        private async Task UpdateTransitionHistoryAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            if (string.IsNullOrEmpty(processInstance.CurrentCommand))
                return;

            var currentstate = WorkflowInit.Runtime.GetLocalizedStateName(processInstance.ProcessId, processInstance.CurrentState);

            var nextState = WorkflowInit.Runtime.GetLocalizedStateName(processInstance.ProcessId, processInstance.ExecutedActivityState);

            var command = WorkflowInit.Runtime.GetLocalizedCommandName(processInstance.ProcessId, processInstance.CurrentCommand);

            var isTimer = !string.IsNullOrEmpty(processInstance.ExecutedTimer);
            
            var historyModel = await MetadataToModelConverter.GetEntityModelByModelAsync("DocumentTransitionHistory");
            var existingModel = (await historyModel.GetAsync(Filter.And.Equal(processInstance.ProcessId, "DocumentId").Equal(Null.Value, "TransitionTime")
                .Equal(currentstate, "InitialState").Equal(nextState, "DestinationState"))).FirstOrDefault();

            if (existingModel == null)
            {
                existingModel = new DynamicEntity();
                var dynModel = existingModel as dynamic;
                dynModel.Id = Guid.NewGuid();
                dynModel.AllowedToEmployeeNames = string.Empty;
                dynModel.DestinationState = nextState;
                dynModel.DocumentId = processInstance.ProcessId;
                dynModel.InitialState = currentstate;
              
            }

            var dm = existingModel as dynamic;

            dm.Command =  !isTimer ? command : string.Format("Timer: {0}",processInstance.ExecutedTimer);
            dm.TransitionTime = DateTime.Now;
            dm.EmployeeId = Guid.Parse(processInstance.IdentityId);

            await historyModel.UpdateSingleAsync(existingModel);
        }

        private async Task<bool> CheckBigBossMustSignAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            var documentModel = await MetadataToModelConverter.GetEntityModelByModelAsync("Document");
            return (await documentModel.GetCountAsync(Filter.And.Equal(processInstance.ProcessId, "Id").GreaterOrEqual(100, "Amount"))) > 0;
        }

        #region Implementation of IWorkflowActionProvider

        public void ExecuteAction(string name, ProcessInstance processInstance, WorkflowRuntime runtime,
            string actionParameter)
        {
            if (_actions.ContainsKey(name))
                _actions[name].Invoke(processInstance, runtime, actionParameter);
            else
                throw new NotImplementedException($"Action with name {name} isn't implemented");
        }

        public async Task ExecuteActionAsync(string name, ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_asyncActions.ContainsKey(name))
                await _asyncActions[name].Invoke(processInstance, runtime, actionParameter, token);
            else
                throw new NotImplementedException($"Async Action with name {name} isn't implemented");
        }

        public bool ExecuteCondition(string name, ProcessInstance processInstance, WorkflowRuntime runtime,
            string actionParameter)
        {
            if (_conditions.ContainsKey(name))
                return _conditions[name].Invoke(processInstance, runtime, actionParameter);

            throw new NotImplementedException($"Condition with name {name} isn't implemented");
        }

        public async Task<bool> ExecuteConditionAsync(string name, ProcessInstance processInstance, WorkflowRuntime runtime, string actionParameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_asyncConditions.ContainsKey(name))
                return await _asyncConditions[name].Invoke(processInstance, runtime, actionParameter, token);

            throw new NotImplementedException($"Async Condition with name {name} isn't implemented");
        }

        public bool IsActionAsync(string name)
        {
            return _asyncActions.ContainsKey(name);
        }

        public bool IsConditionAsync(string name)
        {
            return _asyncConditions.ContainsKey(name);
        }

        public List<string> GetActions()
        {
            return _actions.Keys.Union(_asyncActions.Keys).ToList();
        }

        public List<string> GetConditions()
        {
            return _conditions.Keys.Union(_asyncConditions.Keys).ToList();
        }

        #endregion
    }
}
