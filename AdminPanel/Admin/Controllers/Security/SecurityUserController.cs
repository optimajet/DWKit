using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using DevExpress.Web.Mvc;
using OptimaJet.Common;
using OptimaJet.Security;
using OptimaJet.Security.Objects;
using OptimaJet.Security.Providers;
using System.Threading;



namespace Admin.Controllers
{
    public class SecurityUserController : DictionaryController
    {
        public ActionResult Index()
        {
            Logger.Log.Debug(Thread.CurrentPrincipal.Identity.Name);
            CheckReadOnly();

            return View();
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            CheckReadOnly();

            if (id.HasValue)
            {
                SecurityUser obj = SecurityUserHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                SecurityUserModel.CreateMap();
                SecurityUserModel model = Mapper.Map<SecurityUser, SecurityUserModel>(obj);
                return View(model);
            }
            else
            {
                return View(new SecurityUserModel());
            }
        }



        [HttpPost]
        public ActionResult Edit(Guid id, SecurityUserModel model, string button)
        {
            CheckReadOnly();

            using (DBEntities context = Settings.CreateDataContext())
            {
                ValidateGroup(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                SecurityUser target = null;
                if (model.Id != Guid.Empty)
                {
                    target = SecurityUserHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new SecurityUser();
                    target.Id = Guid.NewGuid();
                    context.AddToSecurityUser(target);
                }

                SecurityUserModel.CreateMap();
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

        private void UpdateArray(DBEntities context, SecurityUserModel model, SecurityUser target)
        {
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

        private void ValidateGroup(DBEntities context, SecurityUserModel model)
        {
            //string res = SecurityUserValidator.CheckTableName(context, model.Id, model.TableName);
            //if (res.Length > 0)
            //    ModelState.AddModelError("TableName", res);
        }

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            SecurityUserHelper.Delete(checkedRecords);
        }

        #endregion

        #region Credential

        public ActionResult CredentialPartial(Guid objectId)
        {
            return PartialView("Credentials", objectId);
        }

        public static IList<SecurityCredentialModel> GetCredentialForUser(Guid objectId)
        {
            SecurityCredentialModel.CreateMap();
            IList<SecurityCredential> att = SecurityUserHelper.GetCredentialByUserId(objectId);
            IList<SecurityCredentialModel> data =
                Mapper.Map<IList<SecurityCredential>, IList<SecurityCredentialModel>>(att);
            return data;
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CredentialAddNewPartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] SecurityCredentialModel item, Guid objectId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    SecurityCredentialModel.CreateMap();
                    using (DBEntities context = Settings.CreateDataContext())
                    {
                        SecurityCredential obj = Mapper.Map<SecurityCredentialModel, SecurityCredential>(item);
                        obj.Id = Guid.NewGuid();
                        obj.SecurityUserId = objectId;
                        obj.PasswordSalt = HashHelper.GenerateSalt();

                        if (obj.AuthenticationType == (byte)AuthenticationType.Generic &&
                            !string.IsNullOrEmpty(item.Password))
                        {
                            obj.PasswordHash = HashHelper.GenerateStringHash(item.Password, obj.PasswordSalt);
                        }

                        context.AddToSecurityCredential(obj);
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
            return CredentialPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CredentialUpdatePartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] SecurityCredentialModel item, Guid objectId)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    SecurityCredentialModel.CreateMap();
                    using (DBEntities context = Settings.CreateDataContext())
                    {
                        SecurityCredential obj =
                            (from p in context.SecurityCredential where p.Id == item.Id select p).FirstOrDefault();
                        if (obj != null)
                        {
                            Mapper.Map(item, obj);
                            obj.SecurityUserId = objectId;
                            if (obj.AuthenticationType == (byte)AuthenticationType.Domain)
                            {
                                obj.PasswordHash = null;
                            }
                            else if (!string.IsNullOrEmpty(item.Password))
                                obj.PasswordHash = HashHelper.GenerateStringHash(item.Password, obj.PasswordSalt);
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

            return CredentialPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult CredentialDeletePartial(Guid Id, Guid objectId)
        {
            try
            {
                SecurityUserHelper.DeleteCredential(new[] { Id });
            }
            catch (Exception e)
            {
                ViewData["EditError"] = e.Message;
            }

            return CredentialPartial(objectId);
        }





        #endregion

        private void CheckReadOnly()
        {
            Readonly = false;//!SecurityCache.CheckPermission("Common", "CustomAdminSettings");
            ViewData["ReadOnly"] = Readonly;
        }
    }
}