using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.MSSQL;
using OptimaJet.Workflow.Core.Builder;
using OptimaJet.Workflow.Core.Bus;
using OptimaJet.Workflow.Core.Generator;
using OptimaJet.Workflow.Core.Persistence;
using OptimaJet.Workflow.Core.Runtime;
using OptimaJet.Workflow.DbPersistence;
using OptimaJet.Workflow.PostgreSQL;

namespace OptimaJet.DWKit.Application
{
    public class WorkflowInit
    {
        private static readonly Lazy<WorkflowRuntime> LazyRuntime = new Lazy<WorkflowRuntime>(InitWorkflowRuntime);

        public static WorkflowRuntime Runtime => LazyRuntime.Value;

        public static string ConnectionString { get; set;}

        private static WorkflowRuntime InitWorkflowRuntime()
        {
            var runtime = DWKitRuntime.CreateWorkflowRuntime()
                .WithActionProvider(new ActionProvider())
                .WithRuleProvider(new RuleProvider())
                .WithTimerManager(new TimerManager());
            
            //events subscription
            runtime.ProcessActivityChanged +=  (sender, args) => {  ActivityChanged(args, runtime).Wait(); };
            runtime.ProcessStatusChanged += (sender, args) => { };
            
            //TODO If you have planned to use Code Actions functionality that required references to external assemblies you have to register them here
            //runtime.RegisterAssemblyForCodeActions(Assembly.GetAssembly(typeof(SomeTypeFromMyAssembly)));
            //starts the WorkflowRuntime
            //TODO If you have planned use Timers the best way to start WorkflowRuntime is somwhere outside of this function in Global.asax for example
            runtime.Start();

            return runtime;
        }

        private static async Task ActivityChanged(ProcessActivityChangedEventArgs args, WorkflowRuntime runtime)
        {
            if (!args.TransitionalProcessWasCompleted)
                return;

            var historyModel = await MetadataToModelConverter.GetEntityModelByModelAsync("DocumentTransitionHistory");
            var emptyHistory = (await historyModel.GetAsync(Filter.And.Equal(Null.Value, "EmployeeId").Equal(args.ProcessId, "DocumentId"))).Select(h => h.GetId()).ToList();
            await historyModel.DeleteAsync(emptyHistory);

            await runtime.PreExecuteFromCurrentActivityAsync(args.ProcessId);

            var nextState = WorkflowInit.Runtime.GetLocalizedStateName(args.ProcessId, args.ProcessInstance.CurrentState);
            var documentModel = await MetadataToModelConverter.GetEntityModelByModelAsync("Document");
            var document = (await documentModel.GetAsync(Filter.And.Equal(args.ProcessId, "Id"))).FirstOrDefault() as dynamic;

            if (document == null)
                return;

            document.StateName = nextState;
            document.State = args.ProcessInstance.CurrentState;
            await documentModel.UpdateSingleAsync(document as DynamicEntity);

            var newActors = await Runtime.GetAllActorsForDirectCommandTransitionsAsync(args.ProcessId);
            var newInboxes = new List<dynamic>();
            foreach (var newActor in newActors)
            {
                var newInboxItem = new DynamicEntity() as dynamic;
                newInboxItem.Id = Guid.NewGuid();
                newInboxItem.IdentityId = new Guid(newActor);
                newInboxItem.ProcessId = args.ProcessId;
                newInboxes.Add(newInboxItem);
            }

            using (var shared = new SharedTransaction())
            {
                var inboxModel = await MetadataToModelConverter.GetEntityModelByModelAsync("WorkflowInbox");

                var existingInboxes = (await inboxModel.GetAsync(Filter.And.Equal(args.ProcessId, "ProcessId"))).Select(i => i.GetId()).ToList();
                await inboxModel.DeleteAsync(existingInboxes);
                await inboxModel.InsertAsync(newInboxes);
                shared.Commit();
            }
        }
    }
}