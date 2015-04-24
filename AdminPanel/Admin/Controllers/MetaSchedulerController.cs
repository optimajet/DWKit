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
    public class MetaSchedulerController : DictionaryController
    {
        public ActionResult Index()
        {
            return View();
        }

        public virtual ActionResult EditorCombox(string PropertyName, string IsNullableValueType)
        {
            ViewData.ModelMetadata = new ModelMetadata(new EmptyModelMetadataProvider(), typeof(object), null,
                                           typeof(Guid), PropertyName);
            return PartialView("EditorTemplates/MetaScheduler");
        }

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaSchedulerHelper.Delete(checkedRecords);
        }

        #endregion

        #region Edit

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaScheduler obj = MetaSchedulerHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaSchedulerModel.CreateMap();
                MetaSchedulerModel model = Mapper.Map<MetaScheduler, MetaSchedulerModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetaSchedulerModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetaSchedulerModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                Validate(context, model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaScheduler target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaSchedulerHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", "Запиcь не найдена!");
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaScheduler();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaScheduler(target);
                }

                MetaSchedulerModel.CreateMap();
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

        private void Validate(DBEntities context, MetaSchedulerModel model)
        {
            if (model.TypeId == 0 && model.PeriodId.HasValue)
            {
                if (model.PeriodId.Value > 0 && !model.StartTime2.HasValue)
                {
                    ModelState.AddModelError("StartTime2", "Поле обязательно для заполения!");
                }

                if (model.PeriodId.Value > 1 && !model.NumberInPeriod.HasValue)
                {
                    ModelState.AddModelError("NumberInPeriod", "Поле обязательно для заполения!");
                }
            }

            if (model.TypeId == 1 && !model.IntervalSecond.HasValue)
            {
                ModelState.AddModelError("IntervalSecond", "Поле обязательно для заполения!");
            }            
        }

        #endregion
    }
}