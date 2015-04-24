using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using OptimaJet.Common;
using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Workflow.Core.Builder;
using OptimaJet.Workflow.Core.Bus;
using OptimaJet.Workflow.Core.Fault;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Parser;
using OptimaJet.Workflow.Core.Persistence;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.BJet.VTB
{
    public static class Workflow
    {
        private static volatile WorkflowRuntime _runtime;
        private static readonly object Sync = new object();
        
        public static WorkflowRuntime Runtime
        {
            get
            {
                if (_runtime == null)
                {
                    lock (Sync)
                    {
                        if (_runtime == null)
                        { 
                            var generator = new WorkflowSchemeGenerator();

                            var builder = new WorkflowBuilder<XElement>(generator,
                                                                        new XmlWorkflowParser(),
                                                                        new OptimaJet.Workflow.DbPersistence.DbSchemePersistenceProvider(DynamicEntitiesSettings.ConnectionStringData)).WithDefaultCache();

                            var dbPersistenceProvider = new OptimaJet.Workflow.DbPersistence.DbPersistenceProvider(DynamicEntitiesSettings.ConnectionStringData);
                            _runtime = new WorkflowRuntime(new Guid("{A97F48C7-F468-4176-82BF-C7A28B13EE5F}"))
                                .WithBuilder(builder).WithBus(new NullBus())
                                .WithPersistenceProvider(dbPersistenceProvider)
                                .AttachDeterminingParametersGetter(_runtime_OnNeedDeterminingParameters)
                                .SwitchAutoUpdateSchemeBeforeGetAvailableCommandsOn()
                                .Start();
                            _runtime.ProcessStatusChanged += _processStatusChanged;
                            _runtime.OnSchemaWasChanged += _onSchemaWasChanged;
                        }
                    }
                }
                return _runtime;
            }
        }

        private static void _runtime_OnNeedDeterminingParameters(object sender, NeedDeterminingParametersEventArgs e)
        {
            var budgetItem =
                DynamicRepository.GetByEntity("BudgetItem", FilterCriteriaSet.And.Equal(e.ProcessId, "Id"))
                    .FirstOrDefault();
            if (budgetItem != null)
            {
                e.DeterminingParameters = new Dictionary<string, object> {{"EntityRouteId", budgetItem.EntityRouteId}};
            }
        }

        private static void _onSchemaWasChanged(object sender, SchemaWasChangedEventArgs schemaWasChangedEventArgs)
        {
            var processId = schemaWasChangedEventArgs.ProcessId;
            var currentActivity = Runtime.GetCurrentActivityName(processId);
            var currentState = Runtime.GetCurrentStateName(processId);
            var newScheme = Runtime.GetProcessScheme(processId);


            ActivityDefinition oldActivity = null;
            try
            {
                oldActivity = newScheme.FindActivity(currentActivity);
            }
            catch (ActivityNotFoundException)
            {
            }

            //Если в новой схеме есть активити в которой находился наш процесс то ничего не делаем
            if (oldActivity != null)
                return;

            //Если в новой схеме есть состояние в котором мы находились то производим установку в него
            if (
                newScheme.Activities.Any(
                    a =>
                        !string.IsNullOrEmpty(a.State) &&
                        a.State.Equals(currentState, StringComparison.InvariantCultureIgnoreCase)))
            {
                var param = new Dictionary<string, object>
                {
                    {"Comment", "Automatic synchronization of the status, due to changing in the route of the document."}
                };
                _runtime.SetState(processId, null, null, currentState, param);
                return;
            }

            //Ставим в начальный статус
            if (!string.IsNullOrEmpty(newScheme.InitialActivity.State))
            {
                var param = new Dictionary<string, object>
                {
                    {"Comment", string.Format("Process was set in initial state, due to state with name {0} was not found in new route.",currentState)}
                };
                Runtime.SetState(processId, null, null, newScheme.InitialActivity.State, param);
                return;
            }
        }

        private static void _processStatusChanged(object sender, ProcessStatusChangedEventArgs e)
        {
            if (e.NewStatus != ProcessStatus.Idled && e.NewStatus != ProcessStatus.Finalized)
                return;

            try
            {
                //Это проверка на то. что состояние в котором стоит воркфлоу - существует в ее схеме
                var currentActivityName = Runtime.GetCurrentActivityName(e.ProcessId);
                var scheme = Runtime.GetProcessScheme(e.ProcessId);
                if (!scheme.Activities.Any(a => a.Name.Equals(currentActivityName, StringComparison.InvariantCultureIgnoreCase)))
                    return;
            }
            catch (Exception)
            {
                return;
            }

            // Уничтожаем инбокс
            var oldInbox = DeleteInbox(e.ProcessId);

            if (e.NewStatus != ProcessStatus.Finalized)
            {
                PreExecuteAndFillInbox(e, oldInbox);
            }
            else
            {
                DeleteNotUsedHistory(e);
            }
        }
        private static void Callback(IAsyncResult ar)
        {
            ;
        }

        #region Inbox
        private static List<dynamic> DeleteInbox(Guid processId)
        {
            var inboxItems = DynamicRepository.GetByEntity("WorkflowInbox",
                FilterCriteriaSet.And.Equal(processId, "ProcessId"));
            DynamicRepository.DeleteByEntity("WorkflowInbox", inboxItems.Select(i => i.Id).ToList());

            return inboxItems;
        }

        private static void PreExecuteAndFillInbox(ProcessStatusChangedEventArgs e, List<dynamic> oldInbox)
        {
            //Удаляем незаполненную историю согласования
            DeleteNotUsedHistory(e);

            Runtime.PreExecuteFromCurrentActivity(e.ProcessId);

            var newInbox = FillInbox(e.ProcessId);

            var realNewInbox = newInbox.Where(c =>
                !oldInbox.Any(oldItem => 
                    oldItem.ProcessId == c.ProcessId && oldItem.IdentityId == c.IdentityId))
                .Select(c=>(Guid)c.IdentityId).ToList();

            Notification.DocumentAddToInbox(e, realNewInbox);
        }

        private static List<dynamic> FillInbox(Guid processId)
        {
            var newActors = Runtime.GetAllActorsForDirectCommandTransitions(processId).ToList();

            var newInbox = new List<dynamic>();
            
            foreach (var newActor in newActors)
            {
                var newInboxItem = DynamicRepository.NewByEntity("WorkflowInbox");
                newInboxItem.Id = Guid.NewGuid();
                newInboxItem.ProcessId = processId;
                newInboxItem.IdentityId = Guid.Parse(newActor);
                
                newInbox.Add(newInboxItem);
            }

            DynamicRepository.InsertByEntity("WorkflowInbox", newInbox);
            return newInbox;
        }

        public static void UpdateInboxAndFillApprovalList(Guid processId)
        {
            var oldInbox = DeleteInbox(processId);
            PreExecuteAndFillInbox(new ProcessStatusChangedEventArgs(processId, new ProcessStatus(), new ProcessStatus()), oldInbox);
        }
        #endregion

        private static void DeleteNotUsedHistory(ProcessStatusChangedEventArgs e)
        {
            var historyItems = DynamicRepository.GetByEntity("WorkflowHistory", FilterCriteriaSet.And.Equal(e.ProcessId, "ProcessId").Equal(Null.Value, "SecurityUserId"));
            DynamicRepository.DeleteByEntity("WorkflowHistory", historyItems.Select(i => i.Id).ToList());
        }
    }
}
