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

        public (string Message, bool IsCancelled) ExecuteTrigger(string name, EntityModel model, List<dynamic> entities, dynamic options)
        {
            throw new System.NotImplementedException();
        }

        public async Task<(string Message, bool IsCancelled)> ExecuteTriggerAsync(string name, EntityModel model, List<dynamic> entities, dynamic options)
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

        public async Task<dynamic> ExecuteActionAsync(string name, dynamic request)
        {
            throw new System.NotImplementedException();
        }

        #endregion

        public Filters()
        {
            _filtersAsync.Add("inbox", Inbox);
            _filtersAsync.Add("outbox", Outbox);
        }

        public async Task<Filter> Inbox(EntityModel model, List<dynamic> entities, dynamic options)
        {
            var userId = DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.HasValue ? DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.Value :
                DWKitRuntime.Security.CurrentUser.Id;
            var inboxModel = await MetadataToModelConverter.GetEntityModelByModelAsync("WorkflowInbox");
            var currentUserInbox = (await inboxModel.GetAsync(Filter.And.Equal(userId, "IdentityId"))).Select(e => (Guid) (e as dynamic).ProcessId).ToList();
            return Filter.And.In(currentUserInbox, "Id");
        }

        public async Task<Filter> Outbox(EntityModel model, List<dynamic> entities, dynamic options)
        {
            var userId = DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.HasValue ? DWKitRuntime.Security.CurrentUser.ImpersonatedUserId.Value :
                DWKitRuntime.Security.CurrentUser.Id;
            var historyModel = await MetadataToModelConverter.GetEntityModelByModelAsync("WorkflowProcessTransitionHistory");
            var currentUserOutbox = (await historyModel.GetAsync(Filter.And.Equal(userId.ToString(), "ExecutorIdentityId"))).Select(e => (Guid) (e as dynamic).ProcessId).ToList();
            return Filter.And.In(currentUserOutbox, "Id");
        }
    }
}