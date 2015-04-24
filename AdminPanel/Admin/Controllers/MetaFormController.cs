using System;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.Meta.Objects;
using System.Linq;


namespace Admin.Controllers
{
    public class MetaFormController : DictionaryController
    {
        public ActionResult DownloadImportTemplate(string name)
        {
            string fileName;

            var fileStream = ImportExportHelper.GetTemplate(name, "Xlsx", out  fileName);

            if (fileStream != null)
                return File(fileStream,
                            "application/excel",
                             fileName);
            return new EmptyResult();
        }

        public ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                           typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/MetaForm");
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaForm obj = MetaFormHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaFormModel.CreateMap();
                MetaFormModel model = Mapper.Map<MetaForm, MetaFormModel>(obj);


                //SetShowImportExportOptions(model);
                model.ShowImportExportOptions = true;
                return View(model);
            }
            else
            {
                return View(new MetaFormModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetaFormModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaForm target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaFormHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaForm();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaForm(target);
                }

                MetaFormModel.CreateMap();
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

        private void Validate(DBEntities context, MetaFormModel model)
        {
            //string res = MetaFormValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaFormHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetaFormHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetaFormHelper.Restore(checkedRecords);
        }

        #endregion

        #region Block

        public ActionResult BlockGridPartial(Guid objectId)
        {
            return PartialView("BlockGrid", objectId);
        }

        #region Edit

        public ActionResult EditBlock(Guid? id, Guid? FormId)
        {
            MetaFormBlockModel model = null;

            if (id.HasValue)
            {
                MetaFormBlock att = MetaFormHelper.GetBlock(id.Value);
                if (att == null)
                    return MessageHelper.FormedContentObjectNotFound();

                MetaFormBlockModel.CreateMap();
                model = Mapper.Map<MetaFormBlock, MetaFormBlockModel>(att);
                return View(model);
            }
            else if (FormId.HasValue)
            {
                MetaForm item = MetaFormHelper.Get(FormId.Value);
                if (item != null)
                {
                    return View(new MetaFormBlockModel
                                    {
                                        MetaFormId = item.Id,
                                        MetaFormCaption = item.Caption,
                                    });
                }
                else
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }
            }
            else
            {
                return MessageHelper.FormedContentObjectNotFound();
            }
        }

        #endregion

        #region Save

        [HttpPost]
        public ActionResult EditBlock(Guid? id, Guid? FormId, MetaFormBlockModel model, string button)
        {
            if (string.IsNullOrEmpty(button))
                return View(model);

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            using (DBEntities context = Settings.CreateDataContext())
            {
                MetaFormBlock target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaFormHelper.GetBlock(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaFormBlock();
                    target.Id = model.Id = Guid.NewGuid();
                    context.AddToMetaFormBlock(target);
                }

                MetaFormBlockModel.CreateMap();
                target = Mapper.Map(model, target);

                try
                {
                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", Resources.Resource.SaveError + ": " + ex.Message);
                }
            }

            if (button == "SaveAndExit")
                return RedirectToAction("Edit", new {id = model.MetaFormId});
            else
            {
                return RedirectToAction("EditBlock", new {id = model.Id});
            }
        }

        private void Validate(DBEntities context, MetaFormBlockModel model)
        {
        }

        #endregion

        #region Grid Command

        public ActionResult BlockDeleteRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] {};

            try
            {
                MetaFormHelper.DeleteBlocks(checkedRecords);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.RowsDeleted + "!"), "");
        }

        #endregion

        #endregion

        #region CreateSecurityPermissions

        public ActionResult CreateSecurityPermissions(Guid[] checkedRecords)
        {
            string res = string.Empty;

            try
            {
                res = MetaFormHelper.CreateSecurityPermissions(checkedRecords);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(res), "");
        }

        #endregion

        #region ExternalMethods

        public ActionResult EditExternalMethod(Guid? id, Guid? FormId)
        {
            MetaFormExternalMethodModel model = null;

            if (id.HasValue)
            {
                var att = MetaFormHelper.GetExternalMethod(id.Value);
                if (att == null)
                    return MessageHelper.FormedContentObjectNotFound();

                MetaFormExternalMethodModel.CreateMap();
                model = Mapper.Map<MetaFormExternalMethod, MetaFormExternalMethodModel>(att);
                return View(model);
            }
            else if (FormId.HasValue)
            {
                MetaForm item = MetaFormHelper.Get(FormId.Value);
                if (item != null)
                {
                    return View(new MetaFormExternalMethodModel
                    {
                        MetaFormId = item.Id,
                        MetaFormCaption = item.Caption,
                    });
                }
                else
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }
            }
            else
            {
                return MessageHelper.FormedContentObjectNotFound();
            }
        }

        [HttpPost]
        public ActionResult EditExternalMethod(Guid? id, Guid? FormId, MetaFormExternalMethodModel model, string button)
        {
            if (string.IsNullOrEmpty(button))
                return View(model);

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            using (DBEntities context = Settings.CreateDataContext())
            {
                MetaFormExternalMethod target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaFormHelper.GetExternalMethod(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaFormExternalMethod();
                    target.Id = model.Id = Guid.NewGuid();
                    context.AddToMetaFormExternalMethod(target);
                }

                MetaFormExternalMethodModel.CreateMap();
                target = Mapper.Map(model, target);

                try
                {
                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", Resources.Resource.SaveError + ": " + ex.Message);
                }
            }

            if (button == "SaveAndExit")
                return RedirectToAction("Edit", new { id = model.MetaFormId });
            else
            {
                return RedirectToAction("EditExternalMethod", new { id = model.Id });
            }
        }

        public ActionResult ExternalMethodDeleteRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] { };

            try
            {
                MetaFormHelper.EMDelete(checkedRecords);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.RowsDeleted + "!"), "");
        }

        public ActionResult ExternalMethodGridPartial(Guid objectId)
        {
            return PartialView("ExternalMethodGrid", objectId);
        }

        #endregion

        private void SetShowImportExportOptions(MetaFormModel form)
        {
           var model = FormModelRepository.GetFormModel(form.Id, FormModelType.All);

            if (model.IsEmpty || string.IsNullOrEmpty(model.MainViewName))
                return;

            var viewNames = model.Blocks.Select(b => b.ViewName).Distinct().ToList();

            using (var context = Settings.CreateDataContext())
            {
                var containsForbidden = context.MetaView.Any(mv => !mv.MasterEntity.IsAvailableForImportExport && viewNames.Contains(mv.Name));

                form.ShowImportExportOptions = !containsForbidden;
            }
        }

        public ActionResult Copy(Guid id)
        {
            Guid newId;
            try
            {
                newId = MetaFormHelper.Copy(id);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex));
            }

            string res = string.Format("Запись скопирована. <a href='{0}/{1}'>Перейти к новой записи</a>", Url.Action("Edit"), newId);
            return Content(MessageHelper.FormedMessageSuccess(res), "");

        }

        public ActionResult GetFormParam(Guid id)
        {
            var item = MetaFormHelper.Get(id);
            if (item != null)
            {
                return Json(new { item.Name, item.Caption });
            }
            return new EmptyResult();
        }
    }
}