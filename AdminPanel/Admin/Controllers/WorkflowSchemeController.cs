using System;
using System.Text;
using System.Web.Mvc;
using System.Linq;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Meta.Objects;
using System.Collections.Generic;
using OptimaJet.Common;
using System.Web;
using System.IO;
using System.Collections.Specialized;
using OptimaJet.Workflow.Core.Runtime;
using OptimaJet.Workflow.Core.Builder;
using System.Xml.Linq;
using OptimaJet.Workflow.Core.Parser;
using OptimaJet.DynamicEntities;
using OptimaJet.Workflow.Core.Bus;
using OptimaJet.Workflow;
using OptimaJet.Workflow.Core.Model;

namespace Admin.Controllers
{
    public class WorkflowSchemeController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }      

        #region GridCommand

        protected override void OnDeleteRows2(string[] checkedRecords)
        {
            WorkflowSchemeHelper.Delete(checkedRecords);
        }

        public ActionResult SetObloslete(string[] checkedRecords)
        {
            string res = string.Empty;

            try
            {
                WorkflowSchemeHelper.SetObloslete(checkedRecords);
                res = "Процессам установлен флаг Устаревший. Обновление процесса произойдет при первом обращении к нему.";
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(res), "");
        }

         

        #endregion

        #region Edit

        public ActionResult Edit(string id)
        {
            return View(new WorkflowSchemeModel() { Code = id, IsNew = !RuntimeSchemeExists(id) });
        }

        [HttpPost]
        public ActionResult Edit(string id, WorkflowSchemeModel model)
        {            
            using (DBEntities context = Settings.CreateDataContext())
            {
                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                if (context.WorkflowScheme.Any(c => c.Code == model.Code))
                {
                    ModelState.AddModelError("", "Запись с таким кодом уже существует!");
                    model.IsNew = true;
                    return View(model);
                }
                else
                {
                    var activity = ActivityDefinition.Create("Activity1", "", true, false, true, true);
                    activity.DesignerSettings.X = "100";
                    activity.DesignerSettings.Y = "100";
                    Runtime.Builder.SaveProcessScheme(model.Code, new OptimaJet.Workflow.Core.Model.ProcessDefinition()
                    {
                        Activities = new List<ActivityDefinition>()
                        {
                           activity
                        }
                    });
                }

                return RedirectToAction("Edit", new { id = model.Code });
            }
        }
        #endregion

        public ActionResult API()
        {
            Stream filestream = null;
            if (Request.Files.Count > 0)
                filestream = Request.Files[0].InputStream;

            var pars = new NameValueCollection();
            pars.Add(Request.Params);

            if (Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase))
            {
                var parsKeys = pars.AllKeys;
                foreach (var key in Request.Form.AllKeys)
                {
                    if (!parsKeys.Contains(key))
                    {
                        pars.Add(Request.Form);
                    }
                }
            }

            var res = Runtime.DesignerAPI(pars, filestream, true);
            if (pars["operation"].ToLower() == "downloadscheme")
                return File(UTF8Encoding.UTF8.GetBytes(res), "text/xml", "scheme.xml");
            return Content(res);
        }

        private static volatile WorkflowRuntime _runtime;
        private static readonly object Sync = new object();

        private static WorkflowRuntime Runtime
        {
            get
            {
                if (_runtime == null)
                {
                    lock (Sync)
                    {
                        if (_runtime == null)
                        {
                            var builder = new WorkflowBuilder<XElement>(
                                new OptimaJet.Workflow.DbPersistence.DbXmlWorkflowGenerator(DynamicEntitiesSettings.ConnectionStringData),
                                new OptimaJet.Workflow.Core.Parser.XmlWorkflowParser(),
                                new OptimaJet.Workflow.DbPersistence.DbSchemePersistenceProvider(DynamicEntitiesSettings.ConnectionStringData)
                            ).WithDefaultCache();

                            _runtime = new WorkflowRuntime(new Guid("{8D38DB8F-F3D5-4F26-A989-4FDD40F32D9D}"))
                                .WithBuilder(builder)
                                .WithPersistenceProvider(new OptimaJet.Workflow.DbPersistence.DbPersistenceProvider(DynamicEntitiesSettings.ConnectionStringData))
                                .WithTimerManager(new TimerManager())
                                .WithBus(new NullBus())
                                .SwitchAutoUpdateSchemeBeforeGetAvailableCommandsOn();
                               // .Start();
                        }
                    }
                }
                return _runtime;
            }
        }
        
        private bool RuntimeSchemeExists(string id)
        {
            try
            {
                Runtime.Builder.GetProcessSchemeForDesigner(id);
                return true;
            }
            catch (OptimaJet.Workflow.Core.Fault.ProcessNotFoundException)
            {
            }
            catch (OptimaJet.Workflow.Core.Fault.SchemeNotFoundException)
            {
            }

            return false;
        }
    }
}