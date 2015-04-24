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
    public class SecurityGroupController : DictionaryController
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
                SecurityGroup obj = SecurityGroupHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                SecurityGroupModel.CreateMap();
                SecurityGroupModel model = Mapper.Map<SecurityGroup, SecurityGroupModel>(obj);
                return View(model);
            }
            else
            {
                return View(new SecurityGroupModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, SecurityGroupModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                ValidateGroup(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                SecurityGroup target = null;
                if (model.Id != Guid.Empty)
                {
                    target = SecurityGroupHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new SecurityGroup();
                    target.Id = Guid.NewGuid();
                    context.AddToSecurityGroup(target);
                }

                SecurityGroupModel.CreateMap();
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

        private void UpdateArray(DBEntities context, SecurityGroupModel model, SecurityGroup target)
        {
            if (System.Configuration.ConfigurationManager.AppSettings["BlockChangeSecurity"] == "true")
                return;

            model.Roles = model.Roles ?? new List<Guid>();
            foreach (SecurityRole item in target.SecurityRole.ToList())
            {
                if (!model.Roles.Contains(item.Id))
                    target.SecurityRole.Remove(item);
            }

            foreach (SecurityRole item in context.SecurityRole.Where(
                s => model.Roles.Contains(s.Id)).ToList())
            {
                if (!target.SecurityRole.Any(any => item.Id == any.Id))
                    target.SecurityRole.Add(item);
            }
        }

        private void ValidateGroup(DBEntities context, SecurityGroupModel model)
        {
            //string res = SecurityGroupValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            SecurityGroupHelper.Delete(checkedRecords);
        }

        #endregion

        #region Users

        public virtual ActionResult UsersInGroupGridPartion(Guid objectId)
        {
            return PartialView("Users/UsersInGroupGrid", objectId);
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
                SecurityGroupHelper.ExcludeUsers(objectId, checkedRecords);
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
                SecurityGroupHelper.IncludeUsers(objectId, checkedRecords);
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