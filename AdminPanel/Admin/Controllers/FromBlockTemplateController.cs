using System;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Meta.Objects;

namespace Admin.Controllers
{
    public class FormBlockTemplateController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                                       typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/FormBlockTemplate");
        }

        public ActionResult GetTemplateParam(Guid id)
        {
            string result = string.Empty;
            MetaFormBlockTemplate item = MetaFormBlockTemplateHelper.Get(id);
            if (item != null)
            {
                result = item.Params;
            }
            return Json(result);
        }

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaFormBlockTemplateHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetaFormBlockTemplateHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetaFormBlockTemplateHelper.Restore(checkedRecords);
        }

        #endregion

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaFormBlockTemplate obj = MetaFormBlockTemplateHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                Mapper.CreateMap<MetaFormBlockTemplate, FormBlockTemplateModel>();
                FormBlockTemplateModel model = Mapper.Map<MetaFormBlockTemplate, FormBlockTemplateModel>(obj);
                return View(model);
            }
            else
            {
                return View(new FormBlockTemplateModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, FormBlockTemplateModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaFormBlockTemplate target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaFormBlockTemplateHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaFormBlockTemplate();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaFormBlockTemplate(target);
                }

                Mapper.CreateMap<FormBlockTemplateModel, MetaFormBlockTemplate>().ForMember("Id", f => f.Ignore());
                Mapper.Map(model, target);

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

        private void Validate(DBEntities context, FormBlockTemplateModel model)
        {
            //string res = MetaFormBlockTemplateValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion
    }
}