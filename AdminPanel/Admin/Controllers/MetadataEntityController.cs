using System;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Common;
using OptimaJet.Meta.Objects;
using OptimaJet.Meta.Validators;

namespace Admin.Controllers
{
    public class MetadataEntityController : DictionaryController
    {
        public ViewResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof (object), null,
                                                       typeof (Guid), PropertyName);
            return PartialView("EditorTemplates/MetadataEntity");
        }

        public virtual ActionResult EditorAttributeCombox(Guid? objectId, string PropertyName, string IsNullableValueType)
        {
            ViewData["EntityId"] = objectId;
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                                       typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/MetadataEntityAttribute", null);
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetadataEntity obj = MetadataEntityHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                Mapper.CreateMap<MetadataEntity, MetadataEntityModel>();
                MetadataEntityModel model = Mapper.Map<MetadataEntity, MetadataEntityModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetadataEntityModel
                                {
                                    SchemaName = "dbo"
                                });
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetadataEntityModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetadataEntity target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetadataEntityHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetadataEntity();
                    target.Id = Guid.NewGuid();
                    context.AddToMetadataEntity(target);
                }

                Mapper.CreateMap<MetadataEntityModel, MetadataEntity>().ForMember("Id", f => f.Ignore());
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

        private void Validate(DBEntities context, MetadataEntityModel model)
        {
            //string res = MetadataEntityValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion
                
        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetadataEntityHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetadataEntityHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetadataEntityHelper.Restore(checkedRecords);
        }

        public ActionResult UpdateDataModel(string[] checkedRecords)
        {
            string res = string.Empty;

            try
            {
                res = MetadataEntityHelper.UpdateDataModel(checkedRecords, "MsSQLProvider");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(res), "");
        }

        public ActionResult GenerateViewFormMenu(Guid[] checkedRecords,
                bool IsCreateForm,
                Guid[] BlockTemplates,
                bool IsIncludeInMenu,
                Guid? IncludeInMenu)
        {
            string res = string.Empty;

            try
            {
                res = MetadataEntityHelper.GenerateViewFormMenu(checkedRecords, IsCreateForm, BlockTemplates, IsIncludeInMenu, IncludeInMenu);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(res), "");
        }

        #endregion

        #region Attribute

        #region Edit

        public ActionResult EditAttribute(Guid? id, Guid? EntityId, byte? TypeId)
        {
            MetadataEntityAttributeModel model = null;

            if (id.HasValue)
            {
                MetadataEntityAttribute att = MetadataEntityHelper.GetAttribute(id.Value);
                if (att == null)
                    return MessageHelper.FormedContentObjectNotFound();

                MetadataEntityAttributeModel.CreateMap();
                model = Mapper.Map<MetadataEntityAttribute, MetadataEntityAttributeModel>(att);
                return View(model);
            }
            else if (EntityId.HasValue)
            {
                MetadataEntity item = MetadataEntityHelper.Get(EntityId.Value);
                if (item != null)
                {
                    if (!TypeId.HasValue)
                        TypeId = 0;

                    MetadataEntityAttributeType type =
                        MetadataEntityHelper.CurrentTypeList.FirstOrDefault(c => c.Id == TypeId.Value) ??
                        new MetadataEntityAttributeType
                            {
                                Id = 255,
                                Name = "Не определена"
                            };
                    return View(new MetadataEntityAttributeModel
                                    {
                                        EntityId = item.Id,
                                        EntityCaption = item.Caption,
                                        TypeId = type.Id,
                                        //AttributeTypeName = type.Name
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
        public ActionResult EditAttribute(Guid? id, Guid? EntityId, MetadataEntityAttributeModel model, string button)
        {
            if (string.IsNullOrEmpty(button))
                return View(model);


            Validate(model);

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            using (DBEntities context = Settings.CreateDataContext())
            {
                MetadataEntityAttribute target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetadataEntityHelper.GetAttribute(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetadataEntityAttribute();
                    target.Id = model.Id = Guid.NewGuid();
                    context.AddToMetadataEntityAttribute(target);
                }

                MetadataEntityAttributeModel.CreateMap();
                target = Mapper.Map(model, target);
               // UpdateExtention(model, target, context);

                try
                {
                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    string errorMsg;
                    if (ex.InnerException != null)
                        errorMsg = string.Format("{0} {1}", ex.Message, ex.InnerException.Message);
                    else
                        errorMsg = ex.Message;

                    ModelState.AddModelError("", Resources.Resource.SaveError + ": " + errorMsg);
                    return View(model);
                }
            }

            if (button == "SaveAndExit")
                return RedirectToAction("Edit", new {id = model.EntityId});
            else
            {
                return RedirectToAction("EditAttribute", new {id = model.Id});
            }
        }


        private void Validate(MetadataEntityAttributeModel model)
        {
            if (model.TypeId == (byte) AttributeType.Value)
            {
                if (string.IsNullOrEmpty(model.Type))
                    ModelState.AddModelError("Type", "Требуется поле Тип колонки.");
            }
            else
            {
                if (!model.ReferencedEntityId.HasValue)
                    ModelState.AddModelError("ReferencedEntityId", "Требуется поле Объект.");
            }
        }

        private void Validate(DBEntities context, MetadataEntityAttributeModel model)
        {
            if (model.TypeId == 0)
            {
                string res = MetadataEntityAttributeValidator.CheckColumnName(context,
                                                                              model.EntityId,
                                                                              model.Id,
                                                                              model.ColumnName);
                if (res.Length > 0)
                    ModelState.AddModelError("TableName", res);
            }
            else if (model.TypeId == 1)
            {
                string res = MetadataEntityAttributeValidator.CheckColumnName(context,
                                                                              model.EntityId,
                                                                              model.Id,
                                                                              model.ColumnName);
                if (res.Length > 0)
                    ModelState.AddModelError("TableName", res);
            }
        }

        //private void UpdateExtention(MetadataEntityAttributeModel model,
        //                             MetadataEntityAttribute target,
        //                             DBEntities context)
        //{
        //    if (target.TypeId == 0)
        //    {
        //        #region Val

        //        UpdateModel(model);

        //        MetadataAttributeVal val = null;
        //        if (model.AttributeVal.AttributeId != Guid.Empty)
        //        {
        //            val = (from item in context.MetadataAttributeVal
        //                   where item.AttributeId == model.Id
        //                   select item).FirstOrDefault();
        //        }

        //        if (val == null)
        //        {
        //            val = new MetadataAttributeVal();
        //            val.AttributeId = target.Id;
        //            context.AddToMetadataAttributeVal(val);
        //        }

        //        val = Mapper.Map(model.AttributeVal, val);
        //        val.AttributeId = target.Id;

        //        #endregion
        //    }
        //    else if (target.TypeId == 1)
        //    {
        //        #region Ref

        //        UpdateModel(model.AttributeRef);

        //        MetadataAttributeRef Ref = null;
        //        if (model.AttributeRef.AttributeId != Guid.Empty)
        //        {
        //            Ref = (from item in context.MetadataAttributeRef
        //                   where item.AttributeId == model.Id
        //                   select item).FirstOrDefault();
        //        }

        //        if (Ref == null)
        //        {
        //            Ref = new MetadataAttributeRef();
        //            Ref.AttributeId = target.Id;
        //            context.AddToMetadataAttributeRef(Ref);
        //        }

        //        Ref = Mapper.Map(model.AttributeRef, Ref);
        //        Ref.AttributeId = target.Id;

        //        #endregion
        //    }
        //}

        #endregion

        #region Grid Command

        public ActionResult AttributeDeleteRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] {};

            try
            {
                MetadataEntityHelper.DeleteAttributes(checkedRecords);
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

        public virtual ActionResult AttributeGridPartial(Guid objectId)
        {
            return PartialView("AttributeGrid", objectId);
        }

        public virtual ActionResult UpdateModelPopupPartial()
        {
            return PartialView("UpdateModel/Popup");
        }

        public virtual ActionResult CreateViewPopupPartial()
        {
            return PartialView("CreateView/Popup");
        }

        public virtual ActionResult UpdateModelTreeViewPartial()
        {
            return PartialView("UpdateModel/DataModel", true);
        }
        

        #endregion

        #region // RemoteValidate

        //public JsonResult ValidateEntityCheckTableName(Guid Id, string TableName)
        //{
        //    bool valid = false;
        //    using (var context = Settings.CreateDataContext())
        //    {
        //        var res = MetadataEntityValidator.CheckTableName(context, Id, TableName);
        //        valid = res.Length == 0;
        //    }

        //    return Json(valid);
        //}

        //public JsonResult ValidateAttributeCheckColumnName(Guid AttributeId, Guid EntityId, string ColumnName)
        //{
        //    bool valid = false;
        //    using (var context = Settings.CreateDataContext())
        //    {
        //        var res = MetadataEntityAttributeValidator.CheckColumnName(context, EntityId, AttributeId, ColumnName);
        //        valid = res.Length == 0;
        //    }

        //    return Json(valid);
        //}

        //public JsonResult ValidateAttributeCheckLinkTableName(Guid AttributeId, string LinkTableName)
        //{
        //    bool valid = false;
        //    using (var context = Settings.CreateDataContext())
        //    {
        //        var res = MetadataEntityAttributeValidator.CheckColumnLinkTableName(context, AttributeId, LinkTableName);
        //        valid = res.Length == 0;
        //    }

        //    return Json(valid);
        //}

        #endregion

        public ActionResult CreateUpdateVersionEntity(Guid id)
        {
            try
            {
                MetadataEntityHelper.CreateUpdateVersionEntity(id);
                return Content(MessageHelper.FormedMessageSuccess("Таблицы версионирования успешно обновлены."), "");
            }
            catch(Exception ex)
            {
                Logger.Log.Error(ex);
                return Content(MessageHelper.FormedMessageWarning(string.Format("Произошла ошибка: {0}.",ex.Message)), "");
            }            
        }

        public ActionResult UpdateDatabase(Guid[] checkedRecords)
        {

            try
            {
                MetadataEntityHelper.UpdateDatabase(checkedRecords, "MsSQLProvider");
                return Content(MessageHelper.FormedMessageSuccess("Таблицы в базе данных успешно обновлены."), "");
            }
            catch (Exception ex)
            {
                Logger.Log.Error(ex);
                return Content(MessageHelper.FormedMessageWarning(string.Format("Произошла ошибка: {0}.", ex.Message)), "");
            } 
        }

        public ActionResult Copy(Guid id)
        {
            Guid newId;
            try
            {
                newId = MetadataEntityHelper.Copy(id);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex));
            }

            string res = string.Format("Запись скопирована. <a href='{0}/{1}'>Перейти к новой записи</a>", Url.Action("Edit"), newId);
            return Content(MessageHelper.FormedMessageSuccess(res),"");
            
        }
    }
}