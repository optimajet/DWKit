using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.EasyWorkflow.Core;
using OptimaJet.Workflow.Core.Generator;
using OptimaJet.Common.Collections;
using OptimaJet.Workflow.Core.Model;

namespace OptimaJet.BJet.VTB
{
    public class WorkflowSchemeGenerator : IWorkflowGenerator<XElement>
    {
        public XElement Generate(string processName, Guid schemeId, IDictionary<string, object> parameters)
        {
            if (!parameters.ContainsKey("EntityRouteId"))
                throw new NotSupportedException("You must specify EntityRouteId in parameters");

            var extityRouteId = (Guid)parameters["EntityRouteId"];

            var entityRoute = DynamicRepository.GetByEntity("EntityRoute",
                FilterCriteriaSet.And.Equal(extityRouteId, "Id")).FirstOrDefault();

            if (entityRoute == null)
                return null;

            XElement scheme = null;
            if (entityRoute.IsUseDesigner)
            {
                scheme = GenerateByDesigner(entityRoute, parameters);
            }
            else
            {
                scheme = GenerateByStages(entityRoute, parameters);
            }

            return scheme;
        }

        private XElement GenerateByStages(dynamic entityRoute, IDictionary<string, object> parameters)
        {
            var routeItems = DynamicRepository.GetByEntity("EntityRouteItem",
                FilterCriteriaSet.And.Equal((Guid)entityRoute.Id, "EntityRouteId"), 
                OrderByCriteriaSet.Asc("Number")).ToList();

            var routeItemUsers = DynamicRepository.GetByView("EntityRouteItemSighters",
                FilterCriteriaSet.And.Equal((Guid)entityRoute.Id, "EntityRouteItemId_EntityRouteId")).ToList();

            var blocks = new List<WorkflowBlock>();

            //create SimpleBlocks
            SimpleBlock draftBlock = new SimpleBlock("Draft");
            draftBlock["Initial"] = true;
            draftBlock["AllowEdit"] = true;
            draftBlock["Actor"] = true;
            blocks.Add(draftBlock);

            for (int i = 0; i < routeItems.Count; i++)
            {
                var routeItem = routeItems[i];
                var block = new SimpleBlock(routeItem.Name);
                block["AllowEdit"] = routeItem.AllowEdit;
                block["Users"] = routeItemUsers.Where(c=>c.EntityRouteItemId == routeItem.Id)
                    .Select(s => ((Guid)s.SecurityUserId).ToString("N")).ToList().ToFormattedString(";", false);
                blocks.Add(block);
            }

            if (entityRoute.AddStageForLegalEntity)
            {
                var block = new StageForLegalEntityBlock("Final regional approval");
                block["Initial"] = false;
                block["AllowEdit"] = true;
                blocks.Add(block);
            }

            blocks.Add(new SimpleBlock("Approved"));

            //set Commands property
            for (int i = 0; i < blocks.Count - 1; i++)
            {
                var block = blocks[i];
                if (block["Initial"] is bool && (bool)block["Initial"])
                {
                    block["Commands"] = new List<SimpleCommand>() { 
                        new SimpleCommand(){ Name = "StartToRoute", ToBlock = blocks[i+1], Classifier = TransitionClassifier.Direct}
                    };
                }
                else if (i < blocks.Count - 3)
                {
                    block["Commands"] = new List<SimpleCommand>() { 
                        new SimpleCommand(){ Name = "WfCommandAgree", ToBlock = blocks[i+1], Classifier = TransitionClassifier.Direct},
                        new SimpleCommand(){ Name = "WfCommandBacktoDraft", ToBlock = draftBlock, Classifier = TransitionClassifier.Reverse}
                    };
                }
                else
                {
                    block["Commands"] = new List<SimpleCommand>() { 
                        new SimpleCommand(){ Name = "WfCommandApproved", ToBlock = blocks[i+1], Classifier = TransitionClassifier.Direct},
                        new SimpleCommand(){ Name = "WfCommandBacktoDraft", ToBlock = draftBlock, Classifier = TransitionClassifier.Reverse}
                    };
                }
            }

            return Converter.ToXElement(string.Empty, blocks);
        }

        private XElement GenerateByDesigner(dynamic entityRoute, IDictionary<string, object> parameters)
        {
            ProcessDefinition pd = Workflow.Runtime.Builder.GetProcessSchemeForDesigner(string.Format("Route_{0}", entityRoute.Id.ToString("N")));
            
            if (pd == null)
            {
                throw new Exception("Scheme not found for the Route. Please, check the Route");
            }

            //CheckDocument
            var initial = pd.Activities.Where(c => c.IsInitial).FirstOrDefault();
            if (!initial.Implementation.Any(c => c.ActionName == "CheckDocumentType"))
            {
                initial.AddAction(ActionDefinitionReference.Create("CheckDocumentType", "0", string.Empty));
            }

            //SetDocumentState
            foreach (var a in pd.Activities.Where(c => !string.IsNullOrWhiteSpace(c.State)))
            {
                if (!a.Implementation.Any(c => c.ActionName == "SetDocumentState"))
                {
                    a.AddAction(ActionDefinitionReference.Create("SetDocumentState", "0", string.Empty));
                }
            }

            //History
            foreach (var a in pd.Activities.Where(c=> !string.IsNullOrWhiteSpace(c.State) && c.IsForSetState))
            {
                if(!a.Implementation.Any(c=> c.ActionName == "UpdateHistory"))
                {
                    a.AddAction(ActionDefinitionReference.Create("UpdateHistory", "99", string.Empty));
                }
                if (!a.PreExecutionImplementation.Any(c => c.ActionName == "WriteHistory"))
                {
                    a.AddPreExecutionAction(ActionDefinitionReference.Create("WriteHistory", "99", string.Empty));
                }
            }

            return XElement.Parse(pd.Serialize());
        }

        private object GetFinalActivity(ProcessDefinition pd)
        {
            var finalActivities = pd.Activities.Where(c => c.IsFinal).ToList();
            if (finalActivities.Count > 0)
                return finalActivities;
            
            foreach(var activity in pd.Activities)
            {
                if (pd.Transitions.Where(t => t.Classifier == TransitionClassifier.Direct && t.From == activity).Any())
                    continue;
                finalActivities.Add(activity);
            }

            return finalActivities;
        }
    }
}
