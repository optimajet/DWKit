using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;

namespace OptimaJet.DWKit.Application
{
    public class Filters : IServerActionsProvider
    {
        public Filters()
        {
            //TODO Register your filters in the _filtersAsync Dictionary
            //_filtersAsync.Add("CustomFilter", CustomFilter);
        }

        #region IServerActionsProvider implementation

        private Dictionary<string, Func<EntityModel, List<dynamic>, dynamic, Filter>> _filters
            = new Dictionary<string, Func<EntityModel, List<dynamic>, dynamic, Filter>>();

        private Dictionary<string, Func<EntityModel, List<dynamic>, dynamic, Task<Filter>>> _filtersAsync
            = new Dictionary<string, Func<EntityModel, List<dynamic>, dynamic, Task<Filter>>>();

        public List<string> GetFilterNames()
        {
            return _filters.Keys.Concat(_filtersAsync.Keys).ToList();
        }

        public bool IsFilterAsync(string name)
        {
            return _filtersAsync.ContainsKey(name);
        }

        public bool ContainsFilter(string name)
        {
            return _filtersAsync.ContainsKey(name) || _filters.ContainsKey(name);
        }

        public Filter GetFilter(string name, EntityModel model, List<dynamic> entities, dynamic options)
        {
            if (_filters.ContainsKey(name))
                return _filters[name](model, entities, options);
            throw new System.NotImplementedException();
        }

        public Task<Filter> GetFilterAsync(string name, EntityModel model, List<dynamic> entities, dynamic options)
        {
            if (_filtersAsync.ContainsKey(name))
                return _filtersAsync[name](model, entities, options);
            throw new System.NotImplementedException();
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

#pragma warning disable 1998
        public async Task<TriggerResult> ExecuteTriggerAsync(string name, EntityModel model, List<dynamic> entities, TriggerExecutionContext context, dynamic options)
#pragma warning restore 1998
        {
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
    }
}
