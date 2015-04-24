using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Meta.Objects;
using OptimaJet.Security;
using OptimaJet.Security.Providers;
using OptimaJet.Workspace;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Web.Security;
using Workspaces.Helpers;
using Workspaces.Models;

namespace Workspaces.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        [AllowAnonymous]
        public ActionResult LogOn()
        {           
            return ContextDependentView();
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult JsonLogOn(LogOnModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                if (Membership.ValidateUser(model.UserName, model.Password))
                {
                    FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);
                    return Json(new {success = true, redirect = returnUrl});
                }
                ModelState.AddModelError("", "The user name or password provided is incorrect.");
            }

            return Json(new {errors = GetErrorsFromModelState()});
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult LogOn(LogOnModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                if (Membership.ValidateUser(model.UserName, model.Password))
                {
                    FormsAuthentication.SetAuthCookie(model.UserName, model.RememberMe);
                    if (Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return RedirectToAction("Index", "Home");
                    }
                }
                else
                {
                    ModelState.AddModelError("", OptimaJet.Localization.LocalizationProvider.Provider.Get("Authentication failed. Try again."));
                }
            }
            return View(model);
        }

        public ActionResult LogOff()
        {
            EventsLogHelper.UserSignOut(Request);
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }

        //[AllowAnonymous]
        //public ActionResult Lockscreen()
        //{
        //    EventsLogHelper.UserSignOut(Request);
        //    FormsAuthentication.SignOut();
  
        //    var c = Request.Cookies["lockscreen_userid"];
        //    Guid userId;
        //    if(c != null && !string.IsNullOrWhiteSpace(c.Value) && Guid.TryParse(c.Value, out userId))
        //    {
        //        LockScreenModel m = new LockScreenModel();
        //        var user = OptimaJet.IIGAdapters.IIGSecurityProvider.GetUserById(userId);
        //        if(user == null)
        //            return RedirectToAction("LogOn");

        //        m.UserName = user.Name;
        //        return View(m);
        //    }
        //    else
        //    {
        //        return RedirectToAction("LogOn");
        //    }
        //}

        //[AllowAnonymous]
        //[HttpPost]
        //public ActionResult Lockscreen(string password, string returnUrl)
        //{
        //    var c = Request.Cookies["lockscreen_userid"];
        //    Guid userId;
        //    if (c != null && !string.IsNullOrWhiteSpace(c.Value) && Guid.TryParse(c.Value, out userId))
        //    {
                
        //        string login = string.Empty;
        //        if (OptimaJet.IIGAdapters.IIGSecurityProvider.ValidateUser(userId, password, ref login))
        //        {
        //            return LogOn(new LogOnModel()
        //            {
        //                UserName = login,
        //                Password = password,
        //                RememberMe = true
        //            }, returnUrl);
        //        }
        //        else
        //        {
        //            ModelState.AddModelError("", "Ошибка аутентификации. Попробуйте ещё раз.");
        //        }

        //        LockScreenModel m = new LockScreenModel();
        //        var user = OptimaJet.IIGAdapters.IIGSecurityProvider.GetUserById(userId);
        //        if(user == null)
        //            return RedirectToAction("LogOn");

        //        m.UserId = userId;
        //        m.UserName = user.Name;
        //        return View(m);
        //    }
        //    else
        //    {
        //        return RedirectToAction("LogOff");
        //    }
        //}

        [AllowAnonymous]
        public ActionResult Register()
        {
            return ContextDependentView();
        }

        //
        // POST: /Account/JsonRegister

        [AllowAnonymous]
        [HttpPost]
        public ActionResult JsonRegister(RegisterModel model)
        {
            if (ModelState.IsValid)
            {
                // Attempt to register the user
                MembershipCreateStatus createStatus;
                Membership.CreateUser(model.UserName, model.Password, model.Email, null, null, true, null,
                                      out createStatus);

                if (createStatus == MembershipCreateStatus.Success)
                {
                    FormsAuthentication.SetAuthCookie(model.UserName, createPersistentCookie: false);
                    return Json(new {success = true});
                }
                else
                {
                    ModelState.AddModelError("", ErrorCodeToString(createStatus));
                }
            }

            // If we got this far, something failed
            return Json(new {errors = GetErrorsFromModelState()});
        }

        //
        // POST: /Account/Register

        [AllowAnonymous]
        [HttpPost]
        public ActionResult Register(RegisterModel model)
        {
            if (ModelState.IsValid)
            {
                // Attempt to register the user
                MembershipCreateStatus createStatus;
                Membership.CreateUser(model.UserName, model.Password, model.Email, null, null, true, null,
                                      out createStatus);

                if (createStatus == MembershipCreateStatus.Success)
                {
                    FormsAuthentication.SetAuthCookie(model.UserName, createPersistentCookie: false);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    ModelState.AddModelError("", ErrorCodeToString(createStatus));
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ChangePassword

        public ActionResult ChangePassword()
        {
            return View();
        }

        //
        // POST: /Account/ChangePassword

        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordModel model)
        {
            if (ModelState.IsValid)
            {
                // ChangePassword will throw an exception rather
                // than return false in certain failure scenarios.
                bool changePasswordSucceeded;
                try
                {
                    MembershipUser currentUser = Membership.GetUser(User.Identity.Name, userIsOnline: true);
                    changePasswordSucceeded = currentUser.ChangePassword(model.OldPassword, model.NewPassword);
                }
                catch (Exception)
                {
                    changePasswordSucceeded = false;
                }

                if (changePasswordSucceeded)
                {
                    return RedirectToAction("ChangePasswordSuccess");
                }
                else
                {
                    ModelState.AddModelError("", "The current password is incorrect or the new password is invalid.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ChangePasswordSuccess

        public ActionResult ChangePasswordSuccess()
        {
            return View();
        }

        private ActionResult ContextDependentView()
        {
            string actionName = ControllerContext.RouteData.GetRequiredString("action");
            if (Request.QueryString["content"] != null)
            {
                ViewBag.FormAction = "Json" + actionName;
                return PartialView();
            }
            else
            {
                ViewBag.RememberMe = true;
                ViewBag.FormAction = actionName;
                return View();
            }
        }

        private IEnumerable<string> GetErrorsFromModelState()
        {
            return ModelState.SelectMany(x => x.Value.Errors
                                                  .Select(error => error.ErrorMessage));
        }

        #region Status Codes

        private static string ErrorCodeToString(MembershipCreateStatus createStatus)
        {
            // See http://go.microsoft.com/fwlink/?LinkID=177550 for
            // a full list of status codes.
            switch (createStatus)
            {
                case MembershipCreateStatus.DuplicateUserName:
                    return "User name already exists. Please enter a different user name.";

                case MembershipCreateStatus.DuplicateEmail:
                    return
                        "A user name for that e-mail address already exists. Please enter a different e-mail address.";

                case MembershipCreateStatus.InvalidPassword:
                    return "The password provided is invalid. Please enter a valid password value.";

                case MembershipCreateStatus.InvalidEmail:
                    return "The e-mail address provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidAnswer:
                    return "The password retrieval answer provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidQuestion:
                    return "The password retrieval question provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidUserName:
                    return "The user name provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.ProviderError:
                    return
                        "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                case MembershipCreateStatus.UserRejected:
                    return
                        "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                default:
                    return
                        "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
            }
        }

        #endregion

        public ActionResult GetSettings()
        {
            var menuList = WsFactory.GetMenu((byte)0);
            var objectList = MetaViewHelper.GetAll();

            dynamic data = new
            {
                general = new
                {
                    id = SecurityCache.CurrentUser.Id,
                    name = SecurityCache.CurrentUser.Name,
                    email = SecurityCache.CurrentUser.Email
                },
                menu = menuList,
                objects = objectList.Select(c => new { c.Id, c.Name, c.Caption }),
                security = new { },
                subscribe = new { }
            };

            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(data)
            };
        }

        [HttpGet]
        public ActionResult GetControlsState(string urlkey)
        {

            var state = DynamicRepository.GetByEntity("SecurityUserState",
                FilterCriteriaSet.And.Equal(SecurityCache.CurrentUser.Id, "SecurityUserId").Equal(urlkey, "Key")).FirstOrDefault();

            if (state == null)
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = JsonSerializer.SerializeToString(new { success = true })
                };

            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(new { success = true, state = state.Value })
            };
        }

        [HttpPost]
        public ActionResult SetControlsState(string urlkey,  string state)
        {
            if (state == null)
                state = "{}";

            var existState = DynamicRepository.GetByEntity("SecurityUserState",
                FilterCriteriaSet.And.Equal(SecurityCache.CurrentUser.Id, "SecurityUserId").Equal(urlkey, "Key"))
                .FirstOrDefault();

            if (existState == null)
            {
                existState = DynamicRepository.NewByEntity("SecurityUserState");
                existState.Id = Guid.NewGuid();
                existState.SecurityUserId = SecurityCache.CurrentUser.Id;
                existState.Key = urlkey;
                existState.Value = state;
                DynamicRepository.InsertByEntity("SecurityUserState",new List<dynamic>(){existState});
            }
            else
            {
                existState.Value = state;
                DynamicRepository.UpdateByEntity("SecurityUserState", new List<dynamic>() { existState });
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(new { success = true })
            };
        }
    }
}