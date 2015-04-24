using System;
using System.Web.Mvc;
using Admin.Helpers;
using OptimaJet.Common;

namespace Admin.Controllers
{
    public class DictionaryController : BaseController
    {
        public virtual ActionResult MainGridPartial()
        {
            if (string.IsNullOrEmpty(Request.Params["MainGridIsShowDeleted"]))
            {
                return PartialView("MainGrid");
            }
            else
            {
                bool isShowDeleted = bool.Parse(Request.Params["MainGridIsShowDeleted"]);
                return PartialView("MainGrid", isShowDeleted);
            }
        }

        public virtual ActionResult DeleteRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] {};

            try
            {
                OnDeleteRows(checkedRecords);
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

        protected virtual void OnDeleteRows(Guid[] checkedRecords)
        {
        }

        public virtual ActionResult DeleteRows2(string[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new string[] { };

            try
            {
                OnDeleteRows2(checkedRecords);
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

        protected virtual void OnDeleteRows2(string[] checkedRecords)
        {
        }

        public virtual ActionResult RemoveRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] {};

            try
            {
                OnRemoveRows(checkedRecords);
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

        protected virtual void OnRemoveRows(Guid[] checkedRecords)
        {
        }

        public virtual ActionResult RestoreRows(Guid[] checkedRecords)
        {
            checkedRecords = checkedRecords ?? new Guid[] {};

            try
            {
                OnRestoreRows(checkedRecords);
            }
            catch (NotValidationException ex)
            {
                return Content(MessageHelper.FormedMessageNote(ex.Message), "");
            }
            catch (Exception ex)
            {
                return Content(MessageHelper.FormedMessageWarning(ex), "");
            }

            return Content(MessageHelper.FormedMessageSuccess(Resources.Resource.RowsRestored + "!"), "");
        }

        protected virtual void OnRestoreRows(Guid[] checkedRecords)
        {
        }
    }
}