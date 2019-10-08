using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.Core.Security;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    public class Triggers : IServerActionsProvider
    {
        #region IServerActionsProvider implementation

        private Dictionary<string, Func<EntityModel, List<dynamic>, TriggerExecutionContext, dynamic,  TriggerResult>> _triggers
            = new Dictionary<string, Func<EntityModel, List<dynamic>,TriggerExecutionContext, dynamic,TriggerResult>>();

        private Dictionary<string, Func<EntityModel, List<dynamic>,TriggerExecutionContext, dynamic, Task<TriggerResult>>> _triggersAsync
            = new Dictionary<string, Func<EntityModel, List<dynamic>,TriggerExecutionContext, dynamic, Task<TriggerResult>>>();

        public List<string> GetFilterNames()
        {
            return new List<string>();
        }

        public bool IsFilterAsync(string name)
        {
            return false;
        }

        public bool ContainsFilter(string name)
        {
            return false;
        }

        public Filter GetFilter(string name, EntityModel model, List<dynamic> entities, dynamic options)
        {
            throw new NotImplementedException();
        }

        public Task<Filter> GetFilterAsync(string name, EntityModel model, List<dynamic> entities, dynamic options)
        {
            throw new NotImplementedException();
        }

        public List<string> GetTriggerNames()
        {
            return _triggers.Keys.Concat(_triggersAsync.Keys).ToList();
        }

        public bool IsTriggerAsync(string name)
        {
            return _triggersAsync.ContainsKey(name);
        }

        public bool ContainsTrigger(string name)
        {
            return _triggersAsync.ContainsKey(name) || _triggers.ContainsKey(name);
        }

        public TriggerResult ExecuteTrigger(string name, EntityModel model, List<dynamic> entities,TriggerExecutionContext context, dynamic options)
        {
            if (_triggers.ContainsKey(name))
                return _triggers[name](model, entities,context, options);
            throw new System.NotImplementedException();
        }

        public Task<TriggerResult> ExecuteTriggerAsync(string name, EntityModel model, List<dynamic> entities, TriggerExecutionContext context, dynamic options)
        {
            if (_triggersAsync.ContainsKey(name))
                return _triggersAsync[name](model, entities, context, options);
            throw new System.NotImplementedException();
        }

        public List<string> GetActionNames()
        {
            return new List<string>();
        }

        public bool IsActionAsync(string name)
        {
            return false;
        }

        public bool ContainsAction(string name)
        {
            return false;
        }

        public dynamic ExecuteAction(string name, dynamic request)
        {
            throw new System.NotImplementedException();
        }

#pragma warning disable 1998
        public async Task<dynamic> ExecuteActionAsync(string name, dynamic request)
#pragma warning restore 1998
        {
            throw new System.NotImplementedException();
        }

        #endregion

        public Triggers()
        {
            _triggersAsync.Add("initDocument", InitDocument);
        }

        public async Task<TriggerResult> InitDocument(EntityModel model, List<dynamic> entities, TriggerExecutionContext context, dynamic options)
        {
            var user = DWKitRuntime.Security.CurrentUser;
            var schemes = DWKitRuntime.Metadata.GetWorkflowByForm(model.Name);
            foreach (var entity in entities)
            {
                if (entity.Id == null)
                {
                    var initialState = schemes.Count == 0 ? 
                        new WorkflowState(){ Name = "", SchemeCode = "", VisibleName = ""} :
                        await WorkflowInit.Runtime.GetInitialStateAsync(schemes[0]);
                    entity.AuthorId = user.GetOperationUserId();
                    entity.AuthorId_Name = user.GetOperationUserName();
                    entity.State = initialState.Name;
                    entity.StateName = initialState.VisibleName;
                }
            }
            return TriggerResult.Success();
        }

    }
}
