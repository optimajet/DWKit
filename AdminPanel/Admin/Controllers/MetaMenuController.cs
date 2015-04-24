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
    public class MetaMenuController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                           typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/MetaMenu");
        }

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaMenuHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetaMenuHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetaMenuHelper.Restore(checkedRecords);
        }

        #endregion

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaMenu obj = MetaMenuHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaMenuModel.CreateMap();
                MetaMenuModel model = Mapper.Map<MetaMenu, MetaMenuModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetaMenuModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetaMenuModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaMenu target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaMenuHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaMenu();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaMenu(target);
                }

                MetaMenuModel.CreateMap();
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

        private void Validate(DBEntities context, MetaMenuModel model)
        {
            //string res = MetaMenuValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        public ActionResult GetMenuTypeParam(Guid id)
        {
            var item = MetaMenuHelper.Get(id);
            if (item != null)
            {
                return Json(item.TypeId);
            }
            return new EmptyResult();
        }
    }
}