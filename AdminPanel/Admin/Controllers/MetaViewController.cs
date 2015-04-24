using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Common;
using OptimaJet.Meta.Objects;

namespace Admin.Controllers
{
    public class MetaViewController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaView obj = MetaViewHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaViewModel.CreateMap();
                MetaViewModel model = Mapper.Map<MetaView, MetaViewModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetaViewModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetaViewModel model, List<MetaViewColumnModel> columns, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaView target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaViewHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaView {Id = Guid.NewGuid()};
                    context.AddToMetaView(target);
                }

                MetaViewModel.CreateMap();

                Mapper.Map(model, target);
                if(columns != null)
                    SyncViewColumns(target, columns, context);

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

        private bool NeedSaveSpecial(MetaViewColumnModel item, List<MetaViewColumnModel> columnModel)
        {
            if (item.NeedSave)
                return true;

          
            if (item.AttributePurpose > 0)
            {
                var siblings = columnModel.Where(c => item.ParentId == c.ParentId && item.Id != c.Id).ToList();

                if (siblings.Any(sibling => sibling.NeedSave))
                    return true;

            }

            return false;
        }

        private bool NeedSave(MetaViewColumnModel item, List<MetaViewColumnModel> columnModel, bool recursive = false )
        {
            if (item.ParentId == null)
            {
                if (
                    columnModel.Any(
                        c =>
                        c.AttributeId == item.AttributeId && !c.Id.ToString("N").Equals(item.Id.ToString("N"), StringComparison.InvariantCultureIgnoreCase)  &&
                        c.ParentId == null))
                {
                    var childrensecond = columnModel.Where(c => item.Id == c.ParentId).ToList();
                    if (childrensecond.Any())
                    {
                        if (childrensecond.Any(s => NeedSave(s, columnModel)))
                            return true;
                    }
                    else
                    {
                        return item.AllowEdit || item.AllowShow || item.AlowImportExport;
                    }
                    return false;
                }
                return true;
            }

            if (item.AllowEdit || item.AllowShow || item.AlowImportExport)
                return true;

            var children = columnModel.Where(c => item.Id == c.ParentId).ToList();

            if (!children.Any())
                return false;

            if (children.Any(c => c.AllowEdit || c.AllowShow || item.AlowImportExport))
                return true;

            if (children.Select(metaViewColumnModel => NeedSave(metaViewColumnModel, columnModel)).Any(needSave => needSave))
            {
                return true;
            }

            
            return false;
        }

        private void SyncViewColumns(MetaView target, List<MetaViewColumnModel> columnModel, DBEntities context)
        {
            MetaViewColumnModel.CreateMap();
            var viewColumns = context.MetaViewColumn.Include("Attribute").Where(c => c.MetaViewId == target.Id).ToList();

            foreach (var item in columnModel)
            {
                item.NeedSave = NeedSave(item, columnModel);
            }

            foreach (var item in columnModel)
            {
                item.NeedSave = NeedSaveSpecial(item, columnModel);
            }
           
            foreach (var item in columnModel)
            {
                MetaViewColumnModel item1 = item;
                var viewColumn = viewColumns.FirstOrDefault(c => c.Id == item1.Id);
                if (viewColumn == null)
                {
                    if (!item.NeedSave)
                        continue;

                    viewColumn = new MetaViewColumn()
                                     {
                                         Id = item.Id
                                     };
                    Mapper.Map(item, viewColumn);
                    viewColumn.MetaViewId = target.Id;
                    context.MetaViewColumn.AddObject(viewColumn);
                    
                }
                else
                {
                    if (item.NeedSave)
                    {
                        Mapper.Map(item, viewColumn);
                        viewColumn.MetaViewId = target.Id;
                    }
                    else
                    {
                        context.MetaViewColumn.DeleteObject(viewColumn);
                    }
                }
            }

            for (int i = 0; i < viewColumns.Count; i++)
            {
                var viewColumn = viewColumns[i];
                var item = columnModel.FirstOrDefault(c => c.Id == viewColumn.Id);
                if (item == null)
                {
                    context.MetaViewColumn.DeleteObject(viewColumns[i]);
                    viewColumns.RemoveAt(i);
                    i--;
                }
                else if (viewColumn.ParentId == null && viewColumn.Attribute.EntityId != target.MasterEntityId)
                {
                    DeleteViewColoumnAndChilds(context, viewColumns, viewColumn);
                    i = -1;
                }
                else if  (viewColumn.ParentId != null && viewColumn.Attribute != null)
                {
                    var parent = viewColumns.FirstOrDefault(c => c.Id == viewColumn.ParentId);
                    if (parent != null && parent.Attribute.TypeId == (byte)AttributeType.Reference)
                    {
                        if (parent.Attribute.ReferencedEntityId != viewColumn.Attribute.EntityId)
                        {
                            DeleteViewColoumnAndChilds(context, viewColumns, viewColumn);
                            i = -1;
                        }
                    }
                }
            }


        }

        private static void DeleteViewColoumnAndChilds(DBEntities context, List<MetaViewColumn> viewColumns, MetaViewColumn viewColumn)
        {
            for (int index = 0; index < viewColumns.Count; index++)
            {
                if (viewColumns[index].ParentId == viewColumn.Id)
                {
                    DeleteViewColoumnAndChilds(context, viewColumns, viewColumns[index]);
                }
            }
         
            context.MetaViewColumn.DeleteObject(viewColumn);
            viewColumns.Remove(viewColumn);
        }

        private void Validate(DBEntities context, MetaViewModel model)
        {
            if (model.MasterEntityId == Guid.Empty)
                ModelState.AddModelError("MasterEntityId", "Поле Модель обязательно для заполнения");
            //string res = MetaViewValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaViewHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetaViewHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetaViewHelper.Restore(checkedRecords);
        }

        #endregion

        #region Column
        public static List<MetaViewColumnModel> GetColumnsForView(MetaViewModel model)
        {
            return GetColumnsForView(model.Id, model.MasterEntityId, null);
        }

        public static List<MetaViewColumnModel> GetColumnsForView(Guid viewId, Guid masterEntityId, Guid? parentId)
        {
            MetaViewColumnModel.CreateMap();
            List<MetaViewColumn> col;
            List<MetadataEntityAttribute> metadataEntityAttribute;
            using (DBEntities context = Settings.CreateDataContext())
            {
                col = MetaViewHelper.GetColumnsByViewId(viewId, context);
                metadataEntityAttribute = MetadataEntityHelper.GetAttributes(context);
            }
            
            List<MetaViewColumnModel> res = Mapper.Map<IList<MetaViewColumn>, List<MetaViewColumnModel>>(col);
            AddEntities(viewId, res, metadataEntityAttribute, masterEntityId, null);

            return res;
        }

        private static void AddEntities(Guid metaViewId, List<MetaViewColumnModel> items, List<MetadataEntityAttribute> metadataEntityAttribute, Guid entityId, Guid? parentId)
        {
            var atts = metadataEntityAttribute.Where(c => c.EntityId == entityId);

            foreach (var att in atts)
            {
                var item = items.FirstOrDefault(c => c.ParentId == parentId && c.AttributeId == att.Id);
                if(item == null)
                {
                    //var parentItem = items.FirstOrDefault(c => c.Id == parentId);
                    item = new MetaViewColumnModel()
                               {
                                   Id = Guid.NewGuid(),
                                   ParentId = parentId,
                                   AttributeId = att.Id,
                                   AttributeCaption = att.Caption,
                                   AttributeEntityId = att.EntityId,
                                   AttributeTypeId = att.TypeId,
                                   MetaViewId = metaViewId,
                                   AttributePurpose = att.Purpose,
                                   CustomEditor = string.Empty,
                                   CustomFormat = string.Empty
                               };
                    items.Add(item);

                   if(item.IsGroup && item.ParentId == null && att.ReferencedEntityId.HasValue)
                    {
                        AddEntities(metaViewId, items, metadataEntityAttribute, att.ReferencedEntityId.Value, item.Id);
                    }
                }
                else if(item.IsGroup && att.ReferencedEntityId.HasValue)
                {
                    AddEntities(metaViewId, items, metadataEntityAttribute, att.ReferencedEntityId.Value, item.Id);
                }
            }
        }

        public static string GenerateColumnHtml(string name, MetaViewColumnModel m, List<MetaViewColumnModel> Model, ref int index, string refId)
        {
            string valuePrefix = string.Format("{0}[{1}]", name, index);
            
            var sb = new StringBuilder();
            string trName = string.Format("tr_{0}{1}", name, index);

            sb.AppendFormat("<tr Id='{0}' {1}>", trName,
                            string.IsNullOrEmpty(refId) ? string.Empty : string.Format("class='child-of-{0}'", refId));
            sb.AppendFormat("<input type='hidden' name='{0}.Id' value='{1}'></input>", valuePrefix, m.Id);
            sb.AppendFormat("<input type='hidden' name='{0}.AttributeId' value='{1}'></input>", valuePrefix, m.AttributeId);
            sb.AppendFormat("<input type='hidden' name='{0}.AttributePurpose' value='{1}'></input>", valuePrefix, m.AttributePurpose);
            sb.AppendFormat("<input type='hidden' name='{0}.ParentId' value='{1}'></input>", valuePrefix, m.ParentId);
            //sb.AppendFormat("<input type='hidden' name='{0}.MetaViewId' value='{1}'></input>", valuePrefix, m.MetaViewId);
            sb.AppendFormat("<td class='columnTree'>");
            sb.AppendFormat("{0}", m.AttributeCaption);
            sb.AppendFormat("</td>");
            sb.AppendFormat("<td><input name=\"{0}.SortOrder\" value='{1}' ></input></td>", valuePrefix, m.SortOrder);
            sb.AppendFormat("<td><input name=\"{0}.Width\" value='{1}' ></input></td>", valuePrefix, m.Width);
            //sb.AppendFormat("<td><input name=\"{0}.Width\" value='{1}' ></input></td>", valuePrefix, m.Width);
            sb.AppendFormat("<td class=\"ColumnChecked\"><input name=\"{0}.AllowShow\" type=\"checkbox\" {1} class=\"AllowShow\" value='true' ></input></td>", valuePrefix, m.AllowShow ? "checked=\"checked\"" : string.Empty);
            sb.AppendFormat("<td class=\"ColumnChecked\"><input name=\"{0}.AllowEdit\" type=\"checkbox\" {1} class=\"AllowEdit\" value='true' ></input></td>", valuePrefix, m.AllowEdit ? "checked=\"checked\"" : string.Empty);
            sb.AppendFormat("<td class=\"ColumnChecked\"><input name=\"{0}.AlowImportExport\" type=\"checkbox\" {1} class=\"AlowImportExport\" value='true' ></input></td>", valuePrefix, m.AlowImportExport ? "checked=\"checked\"" : string.Empty);
            sb.AppendFormat("<td class=\"ColumnChecked\"><input name=\"{0}.AllowCompare\" type=\"checkbox\" {1} class=\"AllowCompare\" value='true' ></input></td>", valuePrefix, m.AllowCompare ? "checked=\"checked\"" : string.Empty);
            if (m.IsGroup)
            {
                var availiableViews = MetadataAttributeHelper.GetAvailableViewsForEdit(m.AttributeId);
                if (availiableViews.Count() > 0)
                {
                    sb.AppendFormat("<td><select name='{0}.MetaViewForSelectId'>", valuePrefix);
                    foreach (var availiableView in availiableViews)
                    {
                        if (m.MetaViewForSelectId.HasValue && availiableView.Id == m.MetaViewForSelectId.Value)
                            sb.AppendFormat("<option selected value='{0}'>{1}</option>", availiableView.Id, availiableView.Name);
                        else
                            sb.AppendFormat("<option value='{0}'>{1}</option>", availiableView.Id, availiableView.Name);
                        
                    }
                    sb.Append("</select></td>");
                }
                else
                {
                    sb.Append("<td></td>");
                }
            }
            else
            {
                sb.Append("<td></td>");
            }
            sb.AppendFormat("<td><input name=\"{0}.CustomCaption\" value=\"{1}\"></input></td>", valuePrefix, m.CustomCaption);
            sb.AppendFormat("<td><input name=\"{0}.CustomFormat\" value='{1}' ></input></td>", valuePrefix, m.CustomFormat);
            sb.AppendFormat("<td><input name=\"{0}.CustomEditor\" value='{1}' ></input></td>", valuePrefix, m.CustomEditor);
            sb.Append("</tr>");
            
           
            if(m.IsGroup)
            {
                foreach(var item in Model.Where(c=> c.ParentId == m.Id))
                {
                    index++;
                    sb.Append(GenerateColumnHtml(name, item, Model, ref index, trName));
                }
            }

            return sb.ToString();
        }
        #endregion

        #region Partials

        public ActionResult EMPopupPartial()
        {
            return PartialView("ExternalMethod/Popup");
        }

       
        public ActionResult ExternalMethodGrid(Guid objectId)
        {
            return PartialView("ExternalMethod/PartialGrid", objectId);
        }

        public virtual ActionResult EMDeleteRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] { };

            try
            {
                MetaViewHelper.EMDelete(checkedRecords);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.RowsDeleted + "!"), "");
        }

        public virtual ActionResult EMUpdateRow(Guid metaviewId, byte type, Guid emId, string param)
        {
            try
            {
                MetaViewHelper.EMUpdateRow(null, metaviewId, type, emId, param);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess("Запись добавлена!"), "");
        }
        
        #endregion

        public ActionResult EditExternalMethod(Guid? id, Guid? ViewId)
        {
            MetaViewExternalMethodModel model = null;

            if (id.HasValue)
            {
                var att = MetaViewHelper.GetExternalMethod(id.Value);
                if (att == null)
                    return MessageHelper.FormedContentObjectNotFound();

                MetaViewExternalMethodModel.CreateMap();
                model = Mapper.Map<MetaViewExternalMethod, MetaViewExternalMethodModel>(att);
                return View(model);
            }
            else if (ViewId.HasValue)
            {
                MetaView item = MetaViewHelper.Get(ViewId.Value);
                if (item != null)
                {
                    return View(new MetaViewExternalMethodModel
                    {
                        MetaViewId = item.Id,
                        MetaViewCaption = item.Caption,
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
        public ActionResult EditExternalMethod(Guid? id, Guid? ViewId, MetaViewExternalMethodModel model, string button)
        {
            if (string.IsNullOrEmpty(button))
                return View(model);

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            using (DBEntities context = Settings.CreateDataContext())
            {
                MetaViewExternalMethod target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaViewHelper.GetExternalMethod(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaViewExternalMethod();
                    target.Id = model.Id = Guid.NewGuid();
                    context.AddToMetaViewExternalMethod(target);
                }

                MetaViewExternalMethodModel.CreateMap();
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
                return RedirectToAction("Edit", new { id = model.MetaViewId });
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
                MetaViewHelper.EMDelete(checkedRecords);
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

        public ActionResult Copy(Guid id)
        {
            Guid newId;
            try
            {
                newId = MetaViewHelper.Copy(id);
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex));
            }

            string res = string.Format("Запись скопирована. <a href='{0}/{1}'>Перейти к новой записи</a>", Url.Action("Edit"), newId);
            return Content(MessageHelper.FormedMessageSuccess(res), "");

        }
    }
}