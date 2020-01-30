using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.Core.Utils;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;
using OptimaJet.Workflow.Core.Runtime.CodeAutocomplete;

namespace OptimaJet.DWKit.Application
{
    public class WorkflowInit
    {
        private static readonly Lazy<WorkflowRuntime> LazyRuntime = new Lazy<WorkflowRuntime>(InitWorkflowRuntime);

        public static WorkflowRuntime Runtime => LazyRuntime.Value;

        public static IWorkflowRuleProvider RuleProvider { get; set; }
        public static IWorkflowActionProvider ActionProvider { get; set; }
        public static ITimerManager TimerManager { get; set; }
        public static ICodeAutocompleteProvider CodeAutocompleteProvider { get; set; }

        private static WorkflowRuntime InitWorkflowRuntime()
        {
            var runtime = DWKitRuntime.CreateWorkflowRuntime()
                .WithActionProvider(ActionProvider  ?? new ActionProvider())
                .WithRuleProvider(RuleProvider ?? new RuleProvider())
                .WithTimerManager(TimerManager ?? new TimerManager());

            if (CodeAutocompleteProvider != null)
            {
                runtime.CodeAutocompleteProvider = CodeAutocompleteProvider;
            }

            //events subscription
            //runtime.ProcessActivityChanged +=  (sender, args) => { };
            //runtime.ProcessStatusChanged += (sender, args) => { };
            runtime.OnWorkflowError += (sender, args) =>
            {
                var isTimerTriggeredTransitionChain =
                    !string.IsNullOrEmpty(args.ProcessInstance.ExecutedTimer) //for timers executed from main branch
                    || (args.ProcessInstance.MergedSubprocessParameters != null //for timers executed from subprocess
                        && !string.IsNullOrEmpty(args.ProcessInstance.MergedSubprocessParameters.GetParameter(DefaultDefinitions.ParameterExecutedTimer.Name)?.Value?.ToString()));

                if (isTimerTriggeredTransitionChain)
                {
                    args.SuppressThrow = true; //prevent unhandled exception in a thread
                }

                var info = ExceptionUtils.GetExceptionInfo(args.Exception);
                var errorBuilder = new StringBuilder();
                errorBuilder.AppendLine("Workflow engine. An exception occurred while the process was running.");
                errorBuilder.AppendLine($"ProcessId: {args.ProcessInstance.ProcessId}");
                errorBuilder.AppendLine($"ExecutedTransition: {args.ExecutedTransition?.Name}");
                errorBuilder.AppendLine($"Message: {info.Message}");
                errorBuilder.AppendLine($"Exceptions: {info.Exeptions}");
                errorBuilder.Append($"StackTrace: {info.StackTrace}");
                
                
                if (Debugger.IsAttached)
                {
                    Debug.WriteLine(errorBuilder);
                }
                else
                {
                    //TODO Add exceptions logging here
                    Console.WriteLine(errorBuilder);
                }
            };
            
            //It is necessery to have this assembly for compile code with dynamic
            runtime.RegisterAssemblyForCodeActions(typeof(Microsoft.CSharp.RuntimeBinder.Binder).Assembly,true); 
            
            //TODO If you have planned to use Code Actions functionality that required references to external assemblies you have to register them here
            //runtime.RegisterAssemblyForCodeActions(Assembly.GetAssembly(typeof(SomeTypeFromMyAssembly)));
            runtime.RegisterAssemblyForCodeActions(Assembly.GetAssembly(typeof(DynamicEntity)));
            //starts the WorkflowRuntime
            //TODO If you have planned use Timers the best way to start WorkflowRuntime is somewhere outside of this function in Global.asax for example
            runtime.Start();

            return runtime;
        }
        
        public static void ForceInit()
        {
            var r = Runtime;
        }

    }
}
