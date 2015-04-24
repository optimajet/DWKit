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
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System.Collections.Generic;
using OptimaJet.Localization;

namespace Admin.Controllers
{
    public class LocalizationController : DictionaryController
    {       
        public ActionResult Index()
        {
            LocalizationProvider.Provider.Refresh();
            return View();
        }

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                var obj = DynamicRepository.GetByEntity(
                   LocalizationProvider.Provider.GetMetaEntiryName(),
                   FilterCriteriaSet.And.Equal(id, "Id")).FirstOrDefault();

                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                return View(new LocalizationModel() { Id = obj.Id, Key = obj.Key, Value = obj.Value });
            }
            else
            {
                return View(new LocalizationModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, LocalizationModel model, string button)
        {
            string entityName =  LocalizationProvider.Provider.GetMetaEntiryName();
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            dynamic target = null;

            try
            {
                if (model.Id != Guid.Empty)
                {
                    target = DynamicRepository.GetByEntity(
                       entityName, FilterCriteriaSet.And.Equal(model.Id, "Id")).FirstOrDefault();

                    string oldKey = target.Key;
                    target.Key = model.Key;
                    target.Value = model.Value;

                    if (target == null)
                    {
                        throw new Exception("Запись не найдена.");
                    }

                    var depens = DynamicRepository.GetByEntity(
                       entityName, FilterCriteriaSet.And.Equal(oldKey, "Key").
                       Merge(FilterCriteriaSet.And.Custom("Lang is not null")));

                    foreach (dynamic d in depens)
                    {
                        d.Key = target.Key;
                    }

                    depens.Add(target);
                    DynamicRepository.UpdateByEntity(entityName, depens);
                }
                else
                {
                    target = DynamicRepository.NewByEntity(entityName);
                    target.Id = Guid.NewGuid();
                    target.Key = model.Key;
                    target.Value = model.Value;
                    DynamicRepository.InsertByEntity(entityName, new List<dynamic>() { target });
                }
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

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            string entityName =  LocalizationProvider.Provider.GetMetaEntiryName();

            var objs = DynamicRepository.GetByEntity(entityName, FilterCriteriaSet.And.In(checkedRecords.ToList(), "Id"));

            List<string> keys = new List<string>();
            foreach(var obj in objs)
            {
                if(!keys.Contains(obj.Key))
                    keys.Add(obj.Key);
            }

            DynamicRepository.DeleteByEntity(entityName,
                DynamicRepository.GetByEntity(entityName, FilterCriteriaSet.And.In(keys, "Key")).Select(c=> c.Id).ToList());
        }

        #endregion

        #region Lang

        public virtual ActionResult LangPartial(string objectId)
        {
            return PartialView("Langs", objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult LangAddNewPartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] LocalizationItemModel item, string objectId)
        {
            if (ModelState.IsValid)
            {
                string entityName = LocalizationProvider.Provider.GetMetaEntiryName();
                try
                {
                    var obj = DynamicRepository.NewByEntity(entityName);
                    obj.Id = Guid.NewGuid();
                    obj.Key = objectId;
                    obj.Lang = item.Lang;
                    obj.Value = item.Value;
                    DynamicRepository.InsertByEntity(entityName, new List<dynamic>() { obj });
                }
                catch (Exception e)
                {
                    ViewData["EditError"] = e.Message;
                }
            }
            else
                ViewData["EditError"] = "Пожалуйста, исправте все ошибки.";
            return LangPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult LangUpdatePartial(
            [ModelBinder(typeof(DevExpressEditorsBinder))] LocalizationItemModel item, string objectId)
        {
            if (ModelState.IsValid)
            {
                string entityName = LocalizationProvider.Provider.GetMetaEntiryName();
                try
                {
                    var obj = DynamicRepository.GetByEntity(
                            entityName, FilterCriteriaSet.And.Equal(item.Id, "Id")).FirstOrDefault();
                    obj.Lang = item.Lang;
                    obj.Value = item.Value;
                    DynamicRepository.UpdateByEntity(entityName, new List<dynamic>() { obj });
                }
                catch (Exception e)
                {
                    ViewData["EditError"] = e.Message;
                }
            }
            else
                ViewData["EditError"] = "Пожалуйста, исправте все ошибки.";

            return LangPartial(objectId);
        }

        [HttpPost, ValidateInput(false)]
        public ActionResult LangDeletePartial(Guid id, string objectId)
        {
            string entityName = LocalizationProvider.Provider.GetMetaEntiryName();
            try
            {
                DynamicRepository.DeleteByEntity(entityName, new List<object>() { id });
            }
            catch (Exception e)
            {
                ViewData["EditError"] = e.Message;
            }

            return LangPartial(objectId);
        }

        #endregion
    }
}