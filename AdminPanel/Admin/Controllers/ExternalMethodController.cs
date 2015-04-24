using System;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Meta.Objects;
using OptimaJet.DynamicEntities.ExternalMethods;
using System.Web;

namespace Admin.Controllers
{
    public class ExternalMethodController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                                       typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/ExternalMethod");
        }

        #region GridCommand
        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            ExternalMethodHelper.Delete(checkedRecords);
        }
        #endregion

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                ExternalMethod obj = ExternalMethodHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                Mapper.CreateMap<ExternalMethod, ExternalMethodModel>();
                ExternalMethodModel model = Mapper.Map<ExternalMethod, ExternalMethodModel>(obj);
                return View(model);
            }
            else
            {
                return View(new ExternalMethodModel()
                {
                    ClassName = "Project",
                    MethodName = "Method1"
                });
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, ExternalMethodModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                ExternalMethod target = null;
                if (model.Id != Guid.Empty)
                {
                    target = ExternalMethodHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    ModelState.AddModelError("", "Запись не найдена!");
                    target = new ExternalMethod();
                    target.Id = Guid.NewGuid();
                    context.AddToExternalMethod(target);
                }

                target.Name = model.Name;
                target.MethodName = model.MethodName;
                target.ClassName = model.ClassName;
                target.UsingText = model.UsingText;
                target.CodeText = model.CodeText;
                
                try
                {
                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    var sb = new StringBuilder(Resources.Resource.SaveError + ": " + ex.Message);
                    if (ex.InnerException != null)
                        sb.AppendLine(ex.InnerException.Message);
                    ModelState.AddModelError("", sb.ToString());
                    return View(model);
                }

                if (button == "SaveAndExit")
                    return RedirectToAction("Index");
                else
                    return RedirectToAction("Edit", new {target.Id});
            }
        }

        private void Validate(DBEntities context, ExternalMethodModel model)
        {
            //string res = ExternalMethodValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        public ActionResult CreateExternalMethod(Guid[] ids)
        {
            string res = string.Empty;

            try
            {
                res = ExternalMethodHelper.CreateExternalMethod(ids);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(res), "");
        }

        public ActionResult ParamsGridPartial(Guid objectId)
        {
            return PartialView("ParamsGrid", objectId);
        }

        public virtual ActionResult ScanPopupPartial()
        {
            return PartialView("Scan/Popup");
        }

        public virtual ActionResult ScanGridPartial()
        {
            return PartialView("Scan/ScanGrid", true);
        }

        public ActionResult GetEmParam(Guid id)
        {
            return Json(ExternalMethodHelper.GetParams(id));
        }

        [HttpPost]
        public ActionResult CompileText()
        {
            if (!ExternalMethodCompiller.CompillationEnable)
                return Json(new { Success = false, Message = "External methods compillation disabled." });

            string className = HttpUtility.UrlDecode(Request.Params["class"]);
            string methodName = HttpUtility.UrlDecode(Request.Params["method"]);
            string usingText = HttpUtility.UrlDecode(Request.Params["using"]); ;
            string codeText = HttpUtility.UrlDecode(Request.Params["code"]); ;

            try
            {
                ExternalMethodCompiller.Compile(className, methodName, usingText, codeText,
                    string.Format("TestCompile_{0}", Guid.NewGuid().ToString("N")));
            }
            catch (Exception ex)
            {
                return Json(new { Success = false, Message = ex.Message.Replace("\n", "<br/>") });
            }

            return Json(new { Success = true });
        }
    }
}