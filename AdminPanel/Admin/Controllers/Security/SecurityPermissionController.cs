using System;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using DevExpress.Web.Mvc;
using OptimaJet.Security.Objects;

namespace Admin.Controllers
{
    public class SecurityPermissionController : DictionaryController
    {
        #region Group

        public ActionResult Index()
        {
            return View();
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                SecurityPermissionGroup obj = SecurityPermissionHelper.GetGroup(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                SecurityPermissionGroupModel.CreateMap();
                SecurityPermissionGroupModel model =
                    Mapper.Map<SecurityPermissionGroup, SecurityPermissionGroupModel>(obj);
                return View(model);
            }
            else
            {
                return View(new SecurityPermissionGroupModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, SecurityPermissionGroupModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                ValidateGroup(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                SecurityPermissionGroup target = null;
                if (model.Id != Guid.Empty)
                {
                    target = SecurityPermissionHelper.GetGroup(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new SecurityPermissionGroup();
                    target.Id = Guid.NewGuid();
                    context.AddToSecurityPermissionGroup(target);
                }

                SecurityPermissionGroupModel.CreateMap();
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
                    return RedirectToAction("Edit", new { target.Id });
            }
        }

        private void ValidateGroup(DBEntities context, SecurityPermissionGroupModel model)
        {
            //string res = SecurityPermissionGroupValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            SecurityPermissionHelper.DeleteGroup(checkedRecords);
        }

        #endregion

        #endregion

        #region Permission

        public virtual ActionResult PermissionPartial(Guid objectId)
        {
            return PartialView("Permissions", objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult PermissionAddNewPartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] SecurityPermissionModel item, Guid objectId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    SecurityPermissionModel.CreateMap();
                    using (DBEntities context = Settings.CreateDataContext())
                    {
                        SecurityPermission obj = Mapper.Map<SecurityPermissionModel, SecurityPermission>(item);
                        obj.Id = Guid.NewGuid();
                        obj.GroupId = objectId;
                        context.AddToSecurityPermission(obj);
                        context.SaveChanges();
                    }
                }
                catch (Exception e)
                {
                    ViewData["EditError"] = e.Message;
                }
            }
            else
                ViewData["EditError"] = "Пожалуйста, исправте все ошибки.";
            return PermissionPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult PermissionUpdatePartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] SecurityPermissionModel item, Guid objectId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    SecurityPermissionModel.CreateMap();
                    using (DBEntities context = Settings.CreateDataContext())
                    {
                        SecurityPermission obj =
                            (from p in context.SecurityPermission where p.Id == item.Id select p).FirstOrDefault();
                        if (obj != null)
                        {
                            Mapper.Map(item, obj);
                            obj.GroupId = objectId;
                            context.SaveChanges();
                        }
                    }
                }
                catch (Exception e)
                {
                    ViewData["EditError"] = e.Message;
                }
            }
            else
                ViewData["EditError"] = "Пожалуйста, исправте все ошибки.";

            return PermissionPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult PermissionDeletePartial(Guid id, Guid objectId)
        {
            try
            {
                SecurityPermissionHelper.Delete(new[] { id });
            }
            catch (Exception e)
            {
                ViewData["EditError"] = e.Message;
            }

            return PermissionPartial(objectId);
        }

        #endregion
    }
}