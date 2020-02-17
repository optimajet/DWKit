using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OptimaJet.DWKit.Application
{
    public class ServerActions : IServerActionsProvider
    {
        public ServerActions()
        {
            //TODO Register your actions in the _actionsAsync Dictionary
            //_actionsAsync.Add("CustomAction", CustomAction);
        }

        #region IServerActionsProvider implementation

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
            return new List<string>();
        }

        public bool IsTriggerAsync(string name)
        {
            return false;
        }

        public bool ContainsTrigger(string name)
        {
            return false;
        }

        public TriggerResult ExecuteTrigger(string name, EntityModel model, List<dynamic> entities, TriggerExecutionContext context, dynamic options)
        {
            throw new System.NotImplementedException();
        }

        public Task<TriggerResult> ExecuteTriggerAsync(string name, EntityModel model, List<dynamic> entities, TriggerExecutionContext context, dynamic options)
        {
            throw new System.NotImplementedException();
        }

        private Dictionary<string, Func<dynamic, Task<object>>> _actionsAsync
            = new Dictionary<string, Func<dynamic, Task<object>>>();

        public List<string> GetActionNames()
        {
            return _actionsAsync.Keys.ToList();
        }

        public bool IsActionAsync(string name)
        {
            return _actionsAsync.ContainsKey(name);
        }

        public bool ContainsAction(string name)
        {
            return _actionsAsync.ContainsKey(name);
        }

        public object ExecuteAction(string name, dynamic request)
        {
            throw new NotImplementedException();
        }

        public Task<object> ExecuteActionAsync(string name, dynamic request)
        {
            if (_actionsAsync.ContainsKey(name))
                return _actionsAsync[name](request);
            throw new NotImplementedException();
        }

        #endregion
    }
}
