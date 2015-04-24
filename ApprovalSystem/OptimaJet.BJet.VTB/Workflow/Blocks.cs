using OptimaJet.EasyWorkflow.Core;
using OptimaJet.Workflow.Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet.VTB
{
    public class SimpleCommand
    {
        public string Name { get; set; }
        public TransitionClassifier Classifier { get; set; }
        public WorkflowBlock ToBlock { get; set; }
    }

    public class SimpleBlock : WorkflowBlock
    {
        public SimpleBlock(string name, string type = "SimpleBlock")
            : base(name, type, new Dictionary<string, object>())
        {
        }

        public SimpleCommand GetCommandByName(string commandName)
        {
            return this["Commands"] == null ? null :
                (this["Commands"] as List<SimpleCommand>).Where(c => c.Name == commandName).FirstOrDefault();
        }

        public override void Register(ProcessDefinition pd, List<WorkflowBlock> blocks)
        {
            base.Register(pd, blocks);

            bool isFinal = this["Commands"] == null
                ? true :
                (this["Commands"] as List<SimpleCommand>).Count == 0;

            //activity
            var c = ActivityDefinition.Create(Name, Name, TryCast<bool>("Initial", false), isFinal, true, true);
            if (c.IsInitial)
            {
                c.AddAction(ActionDefinitionReference.Create("CheckDocumentType", "0", string.Empty));
            }
           
            //actions
            if (this["AllowEdit"] is bool)
            {
                c.AddAction(ActionDefinitionReference.Create("SetDocumentEditable", "1", this["AllowEdit"].ToString()));
            }

            c.AddAction(ActionDefinitionReference.Create("SetDocumentState", "2", string.Empty));
            c.AddAction(ActionDefinitionReference.Create("UpdateHistory", "3", string.Empty));
            c.AddPreExecutionAction(ActionDefinitionReference.Create("WriteHistory", "0", string.Empty));

            pd.Activities.Add(c);
            this["_currentActivity"] = c;

            //actor
            var users = this["Users"] as string;
            if (!string.IsNullOrWhiteSpace(users))
            {
                var actor = ActorDefinition.Create(string.Format("Actor{0}", Name), "CheckUsers", users);
                pd.Actors.Add(actor);
                this["_actorRestrictions"] = actor;
            }
            else if(c.IsInitial)
            {
                var actor = pd.Actors.FirstOrDefault(a => a.Name == "Author");
                if(actor == null)
                {
                    actor = ActorDefinition.Create("Author", "Author", null);
                    pd.Actors.Add(actor);
                }
                this["_actorRestrictions"] = actor;
            }
        }

        public override void RegisterFinal(ProcessDefinition pd, List<WorkflowBlock> blocks)
        {
            base.RegisterFinal(pd, blocks);

            //transitions
            var commands = this["Commands"] as List<SimpleCommand>;
            if (commands != null)
            {
                var restrictions = new List<RestrictionDefinition>();
                if (this["_actorRestrictions"] is ActorDefinition)
                {
                    restrictions.Add(RestrictionDefinition.Create(RestrictionType.Allow, (ActorDefinition)this["_actorRestrictions"]));
                }
                              
                foreach (var c in commands)
                {
                    var pdCommand = pd.Commands.Where(pdc => pdc.Name == c.Name).FirstOrDefault();
                    if (pdCommand == null)
                    {
                        pdCommand = CommandDefinition.Create(c.Name);

                        ParameterDefinition pdParameterComment = pd.Parameters.Where(p=> p.Name == "Comment").FirstOrDefault();
                        if(pdParameterComment == null)
                        {
                            pdParameterComment = ParameterDefinition.Create("Comment", typeof(string), ParameterPurpose.Temporary, null);
                            pd.Parameters.Add(pdParameterComment);
                        }

                        pdCommand.InputParameters.Add(new ParameterDefinitionReference()
                        {
                            Name = "Comment",
                            Parameter = pdParameterComment
                        });
                        pd.Commands.Add(pdCommand);
                    }

                    pd.Transitions.Add(new TransitionDefinition()
                    {
                        Name = string.Format("{0}_{1}_{2}", Name, c.ToBlock.Name, c.Name),
                        Classifier = c.Classifier,
                        From = (ActivityDefinition)this["_currentActivity"],
                        To = (ActivityDefinition)c.ToBlock["_currentActivity"],
                        Trigger = new TriggerDefinition(TriggerType.Command)
                        {
                            Command = pdCommand
                        },
                        Conditions = new List<ConditionDefinition>(){
                            ConditionDefinition.Always
                        },
                        Restrictions = restrictions
                    });
                }
            }
        }
    }

    public class StageForLegalEntityBlock : SimpleBlock
    {
        public StageForLegalEntityBlock(string name)
            : base(name, "StageForLegalEntityBlock")
        {
        }

        public override void Register(ProcessDefinition pd, List<WorkflowBlock> blocks)
        {
            base.Register(pd, blocks);

            var actor = ActorDefinition.Create(string.Format("LegalEntitySigns_{0}", Name), "BudgetItemIsLegalEntityNeedSigns", Name);
            pd.Actors.Add(actor);
            this["_actorRestrictions"] = actor;
        }

        public override void RegisterFinal(ProcessDefinition pd, List<WorkflowBlock> blocks)
        {
            //transitions
            var commands = this["Commands"] as List<SimpleCommand>;
            if (commands != null)
            {
                var restrictions = new List<RestrictionDefinition>();
                if (this["_actorRestrictions"] is ActorDefinition)
                {
                    restrictions.Add(RestrictionDefinition.Create(RestrictionType.Allow, (ActorDefinition)this["_actorRestrictions"]));
                }

                foreach (var c in commands)
                {
                    var pdCommand = pd.Commands.Where(pdc => pdc.Name == c.Name).FirstOrDefault();
                    if (pdCommand == null)
                    {
                        pdCommand = CommandDefinition.Create(c.Name);
                        pd.Commands.Add(pdCommand);
                    }

                    if (c.Classifier == TransitionClassifier.Direct)
                    {
                        //CA
                        pd.Transitions.Add(new TransitionDefinition()
                        {
                            Name = string.Format("{0}_{1}_{2}", Name, c.ToBlock.Name, c.Name),
                            Classifier = c.Classifier,
                            From = (ActivityDefinition)this["_currentActivity"],
                            To = (ActivityDefinition)this["_currentActivity"],
                            Trigger = new TriggerDefinition(TriggerType.Command)
                            {
                                Command = pdCommand
                            },
                            Conditions = new List<ConditionDefinition>(){
                                ConditionDefinition.Always
                            },
                            Restrictions = restrictions
                        });

                        //AC
                        pd.Transitions.Add(new TransitionDefinition()
                        {
                            Name = string.Format("{0}_{1}_{2}", Name, c.ToBlock.Name, "Auto"),
                            Classifier = c.Classifier,
                            From = (ActivityDefinition)this["_currentActivity"],
                            To = (ActivityDefinition)c.ToBlock["_currentActivity"],
                            Trigger = new TriggerDefinition(TriggerType.Auto),
                            Conditions = new List<ConditionDefinition>(){
                                ConditionDefinition.Create("Action", ActionDefinitionReference.Create("BudgetItemIsLegalEntitySignsComplete", "0", Name), "false", "true")
                            }
                        });
                    }
                    else
                    {
                        pd.Transitions.Add(new TransitionDefinition()
                        {
                            Name = string.Format("{0}_{1}_{2}", Name, c.ToBlock.Name, c.Name),
                            Classifier = c.Classifier,
                            From = (ActivityDefinition)this["_currentActivity"],
                            To = (ActivityDefinition)c.ToBlock["_currentActivity"],
                            Trigger = new TriggerDefinition(TriggerType.Command)
                            {
                                Command = pdCommand
                            },
                            Conditions = new List<ConditionDefinition>(){
                                ConditionDefinition.Always
                            },
                            Restrictions = restrictions
                        });
                    }
                }
            }
        }
    }
}
