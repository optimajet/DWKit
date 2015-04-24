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
using OptimaJet.Security.Objects;

namespace Admin.Controllers
{
    public class SecurityRoleController : DictionaryController
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
                SecurityRole obj = SecurityRoleHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                SecurityRoleModel.CreateMap();
                SecurityRoleModel model = Mapper.Map<SecurityRole, SecurityRoleModel>(obj);
                return View(model);
            }
            else
            {
                return View(new SecurityRoleModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, SecurityRoleModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                SecurityRole target = null;
                if (model.Id != Guid.Empty)
                {
                    target = SecurityRoleHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new SecurityRole();
                    target.Id = Guid.NewGuid();
                    context.AddToSecurityRole(target);
                }

                SecurityRoleModel.CreateMap();
                Mapper.Map(model, target);
                UpdateArray(context, model, target);

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

        private void UpdateArray(DBEntities context, SecurityRoleModel model, SecurityRole target)
        {
            model.Groups = model.Groups ?? new List<Guid>();
            foreach (SecurityGroup item in target.SecurityGroup.ToList())
            {
                if (!model.Groups.Contains(item.Id))
                    target.SecurityGroup.Remove(item);
            }

            foreach (SecurityGroup item in context.SecurityGroup.Where(
                s => model.Groups.Contains(s.Id)).ToList())
            {
                if (!target.SecurityGroup.Any(any => item.Id == any.Id))
                    target.SecurityGroup.Add(item);
            }
        }

        private void Validate(DBEntities context, SecurityRoleModel model)
        {
            //string res = SecurityRoleValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            SecurityRoleHelper.Delete(checkedRecords);
        }

        #endregion

        #region Permission

        public virtual ActionResult PermissionPartial(Guid objectId)
        {
            return PartialView("Permissions/PermissionsGrid", objectId);
        }

        public virtual ActionResult PermissionChangeStatus(Guid objectId, Guid[] checkedRecords, byte status)
        {
            checkedRecords = checkedRecords ?? new Guid[] { };

            try
            {
                SecurityRoleHelper.PermissionChangeStatus(objectId, checkedRecords, status);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.StateChanged), "");
        }

        #endregion

        #region Users

        public virtual ActionResult UsersInRoleGridPartion(Guid objectId)
        {
            return PartialView("Users/UsersInRoleGrid", objectId);
        }

        public virtual ActionResult UserPopupGridPartial()
        {
            return PartialView("Users/PopupGrid");
        }

        public virtual ActionResult UserPopupPartial()
        {
            return PartialView("Users/Popup");
        }

        public virtual ActionResult ExcludeUserRows(Guid objectId, Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] { };

            try
            {
                SecurityRoleHelper.ExcludeUsers(objectId, checkedRecords);
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

        public virtual ActionResult IncludeUserRows(Guid objectId, Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] { };

            try
            {
                SecurityRoleHelper.IncludeUsers(objectId, checkedRecords);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess("Записи добавлены!"), "");
        }

        #endregion
    }
}