using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.Core.Utils;
using OptimaJet.DWKit.Core.View;
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

        private static WorkflowRuntime InitWorkflowRuntime()
        {
            var runtime = DWKitRuntime.CreateWorkflowRuntime()
                .WithActionProvider(new ActionProvider())
                .WithRuleProvider(new RuleProvider())
                .WithTimerManager(new TimerManager());
            
            //events subscription
            runtime.ProcessActivityChanged +=  (sender, args) => {  ActivityChanged(args, runtime).Wait(); };
            runtime.ProcessStatusChanged += (sender, args) => { };
            runtime.OnWorkflowError += (sender, args) =>
            {
                if (Debugger.IsAttached)
                {
                    var info = ExceptionUtils.GetExceptionInfo(args.Exception);
                    var errorBuilder = new StringBuilder();
                    errorBuilder.AppendLine("Workflow engine. An exception occurred while the process was running.");
                    errorBuilder.AppendLine($"ProcessId: {args.ProcessInstance.ProcessId}");
                    errorBuilder.AppendLine($"ExecutedTransition: {args.ExecutedTransition?.Name}");
                    errorBuilder.AppendLine($"Message: {info.Message}");
                    errorBuilder.AppendLine($"Exceptions: {info.Exeptions}");
                    errorBuilder.Append($"StackTrace: {info.StackTrace}");
                    Debug.WriteLine(errorBuilder);
                }
              
                //TODO Add exceptions logging here
            };
            
            //It is necessery to have this assembly for compile code with dynamic
            runtime.RegisterAssemblyForCodeActions(typeof(Microsoft.CSharp.RuntimeBinder.Binder).Assembly,true); 
           
            
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
            var emptyHistory = (await historyModel.GetAsync(Filter.And.Equal(Null.Value, "EmployeeId").Equal(args.ProcessId, "DocumentId")
                .Equal(Null.Value, "TransitionTime"))).Select(h => h.GetId()).ToList();
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
                newInboxItem.IdentityId = newActor;
                newInboxItem.ProcessId = args.ProcessId;
                newInboxes.Add(newInboxItem);
            }

            var userIdsForNotification = new List<string>();

            userIdsForNotification.AddRange(newInboxes.Select(a => (string) (a as dynamic).IdentityId));

            using (var shared = new SharedTransaction())
            {
                var inboxModel = await MetadataToModelConverter.GetEntityModelByModelAsync("WorkflowInbox");
                var existingInboxes = (await inboxModel.GetAsync(Filter.And.Equal(args.ProcessId, "ProcessId")));
                userIdsForNotification.AddRange(existingInboxes.Select(a => (string) (a as dynamic).IdentityId));
                var existingInboxesIds = existingInboxes.Select(i => i.GetId()).ToList();
                await inboxModel.DeleteAsync(existingInboxesIds);
                await inboxModel.InsertAsync(newInboxes);
                await shared.CommitAsync();
            }

            userIdsForNotification = userIdsForNotification.Distinct().ToList();
            Func<Task> task = async () => { await ClientNotifiers.NotifyClientsAboutInboxStatus(userIdsForNotification); };
            task.FireAndForgetWithDefaultExceptionLogger();
        }

        public static void ForceInit()
        {
            var r = Runtime;
        }
    }
}