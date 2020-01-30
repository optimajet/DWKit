using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    public class RuleProvider : IWorkflowRuleProvider
    {
        public RuleProvider()
        {
            //TODO Register your rules in the _rules Dictionary
            //_rules.Add("CheckRole", new RuleFunction {CheckFunction = RoleCheck, GetFunction = RoleGet});
        }

        #region Implementation of IWorkflowRuleProvider
        private class RuleFunction
        {
            public Func<ProcessInstance, WorkflowRuntime, string, IEnumerable<string>> GetFunction { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, CancellationToken, Task<IEnumerable<string>>> GetFunctionAsync { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, string, bool> CheckFunction { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, string, CancellationToken, Task<bool>> CheckFunctionAsync { get; set; }

        }

        private class RuleFunctionAsync
        {
            public Func<ProcessInstance, WorkflowRuntime, string, Task<IEnumerable<string>>> GetFunction { get; set; }

            public Func<ProcessInstance, WorkflowRuntime, string, string, Task<bool>> CheckFunction { get; set; }
        }

        private readonly Dictionary<string, RuleFunction> _rules = new Dictionary<string, RuleFunction>();
        private readonly Dictionary<string, RuleFunctionAsync> _rulesAsync = new Dictionary<string, RuleFunctionAsync>();

        public List<string> GetRules(string schemeCode)
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

        public async Task<bool> CheckAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string identityId, string ruleName, string parameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_rulesAsync.ContainsKey(ruleName))
                return await _rulesAsync[ruleName].CheckFunction(processInstance, runtime, identityId, parameter);
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<string>> GetIdentitiesAsync(ProcessInstance processInstance, WorkflowRuntime runtime, string ruleName, string parameter, CancellationToken token)
        {
            //token.ThrowIfCancellationRequested(); // You can use the transferred token at your discretion
            if (_rulesAsync.ContainsKey(ruleName))
                return await _rulesAsync[ruleName].GetFunction(processInstance, runtime, parameter);
            throw new NotImplementedException();
        }

        public bool IsCheckAsync(string ruleName, string schemeCode)
        {
            return _rulesAsync.ContainsKey(ruleName);
        }

        public bool IsGetIdentitiesAsync(string ruleName, string schemeCode)
        {
            return _rulesAsync.ContainsKey(ruleName);
        }

        #endregion
    }
}
