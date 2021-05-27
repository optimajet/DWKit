using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Newtonsoft.Json;
using OptimaJet.DWKit.Core;
using OptimaJet.Workflow.Core.Model;
using OptimaJet.Workflow.Core.Runtime;

namespace OptimaJet.DWKit.Application
{
    /// <summary>
    /// Provides access to Form data via Workflow
    /// </summary>
    public class WorkflowParameters : IWorkflowExternalParametersProvider
    {
        /// <summary>
        /// Checks if parameter's getter if async
        /// and gets it's value
        /// </summary>
        /// <param name="parameterName">Name of parameter to get</param>
        /// <param name="processInstance">Instance of the process</param>
        /// <returns>Value of given parameter</returns>
        public async Task<object> GetExternalParameterAsync(string parameterName, ProcessInstance processInstance)
        {
            if (parameterName == "Data")
            {
                var entity = await processInstance.GetEntityAsync();

                if (entity == null)
                    throw new Exception("Can not find entity within current process instance.");

                return entity;
            }

            return null;
        }

        /// <summary>
        /// Calls parameter's setter if it's setter is asynchronous
        /// </summary>
        /// <param name="parameterName">Name of parameter to set value</param>
        /// <param name="parameterValue">Value of parameter to set</param>
        /// <param name="processInstance">Instance of the process</param>
        public async Task SetExternalParameterAsync(string parameterName, object parameterValue, ProcessInstance processInstance)
        {
            if (parameterName == "Data")
            {
                var model = await processInstance.GetEntityModelAsync();

                if (parameterValue is DynamicEntity)
                {
                    var data = (DynamicEntity) parameterValue;

                    //TODO: Evgeny Betin. Hot fix data types of collections WFE and DWKit integration
                    foreach (var element in model.Attributes)
                    {
                        var value = data[element.Name];

                        try
                        {
                            if (value != null && element.Type.CLRType != value.GetType())
                            {
                                data[element.Name] = element.Type.ParseToCLRType(value);
                            }
                        }
                        catch (Exception ex)
                        {
                            throw new Exception($"Can not convert type {value.GetType()} of attribute {element.Name} to type {element.Type.CLRType}: {ex.Message}.");
                        }
                    }

                    //TODO: Evgeny Betin. Hot fix names of attributes entities in DWKit and WFE parameters
                    var entity = await processInstance.GetEntityAsync();
                    foreach (var collection in model.Collections)
                    {
                        data[collection.Name] = entity[collection.Name];
                    }

                    await model.UpdateSingleAsync(data);
                }
                else
                    throw new Exception("WorkflowParameters.SetExternalParameters expect DynamicEntity type in parameterValue.");
            }
        }

        /// <summary>
        /// Get external parameter value
        /// </summary>
        /// <param name="parameterName">Name of parameter</param>
        /// <param name="processInstance">Instance of a specific process</param>
        /// <returns>Value of given parameter</returns>
        public object GetExternalParameter(string parameterName, ProcessInstance processInstance)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Set external parameter with given value
        /// </summary>
        /// <param name="parameterName">Name of parameter to set value</param>
        /// <param name="parameterValue">Value of parameter to set</param>
        /// <param name="processInstance">Instance of the process</param>
        public void SetExternalParameter(string parameterName, object parameterValue, ProcessInstance processInstance)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Checks if parameter's getter is as synchronous
        /// </summary>
        /// <param name="parameterName">Name of the parameter</param>
        /// <param name="schemeCode">Code of the workflow scheme</param>
        /// <returns>True if parameter's getter is asynchronous, otherwise, false</returns>
        public bool IsGetExternalParameterAsync(string parameterName, string schemeCode, ProcessInstance processInstance)
        {
            return true;
        }

        /// <summary>
        /// Checks if parameter's setter is asynchronous
        /// </summary>
        /// <param name="parameterName">Name of the parameter</param>
        /// <param name="schemeCode">Code of the workflow scheme</param>
        /// <returns>True if parameter's setter is asynchronous, otherwise, false</returns>
        public bool IsSetExternalParameterAsync(string parameterName, string schemeCode, ProcessInstance processInstance)
        {
            return true;
        }

        /// <summary>
        /// Checks if the provider supports this parameter
        /// </summary>
        /// <param name="parameterName">Name of the parameter</param>
        /// <param name="schemeCode">Code of the workflow scheme</param>
        /// <returns>True if the provider supports this parameter, otherwise, false</returns>
        public bool HasExternalParameter(string parameterName, string schemeCode, ProcessInstance processInstance)
        {
            if (parameterName == "Data")
            {
                return true;
            }

            return false;
        }
    }
}
