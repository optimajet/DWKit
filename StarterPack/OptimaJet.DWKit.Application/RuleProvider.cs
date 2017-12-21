using System;
using System.Collections.Generic;
using System.Linq;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Metadata.DbObjects;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    public class RuleProvider : IWorkflowRuleProvider
    {
        private class RuleFunction
        {
            public Func<ProcessInstance, WorkflowRuntime, string, IEnumerable<string>> GetFunction { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, string, bool> CheckFunction { get; set; }
        }

        private readonly Dictionary<string, RuleFunction> _rules = new Dictionary<string, RuleFunction>();

        public RuleProvider()
        {
            //Register your rules in the _rules Dictionary
            _rules.Add("CheckRole", new RuleFunction {CheckFunction = RoleCheck, GetFunction = RoleGet});
        }

        public IEnumerable<string> RoleGet(ProcessInstance processInstance, WorkflowRuntime runtime, string parameter)
        {
            var role = SecurityRole.SelectByCode(parameter).Result;
            if (role == null)
                return new List<string>();
            var roleUserModel = SecurityUserToSecurityRole.SelectByRole(role.Id).Result;
            return roleUserModel.Select(r => r.SecurityUserId.ToString()).Distinct();
        }

        public bool RoleCheck(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string parameter)
        {
            var role = SecurityRole.SelectByCode(parameter).Result;
            if (role == null)
                return false;
            var roleUserModel = SecurityUserToSecurityRole.Model;
            return roleUserModel.GetCountAsync(Filter.And.Equal(role.Id, "RoleId").Equal(Guid.Parse(identityId), "UserId")).Result > 0;
        }

        #region Implementation of IWorkflowRuleProvider

        public List<string> GetRules()
        {
            return _rules.Keys.ToList();
        }

        public bool Check(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string ruleName,
            string parameter)
        {
            if (_rules.ContainsKey(ruleName))
                return _rules[ruleName].CheckFunction(processInstance, runtime, identityId, parameter);
            throw new NotImplementedException();
        }

        public IEnumerable<string> GetIdentities(ProcessInstance processInstance, WorkflowRuntime runtime,
            string ruleName, string parameter)
        {
            if (_rules.ContainsKey(ruleName))
                return _rules[ruleName].GetFunction(processInstance, runtime, parameter);
            throw new NotImplementedException();
        }

        #endregion
    }
}