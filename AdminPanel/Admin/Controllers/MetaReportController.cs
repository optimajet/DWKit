using Admin.DAL;
using Admin.Helpers;
using Admin.Models;
using AutoMapper;
using OptimaJet.Meta.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Admin.Controllers
{
    public class MetaReportController : DictionaryController
    {
        //
        // GET: /MetaReport/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Edit(Guid? id)
        {
            if (id.HasValue)
            {
                MetaReport obj = MetaReportHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaReportModel.CreateMap();
                MetaReportModel model = Mapper.Map<MetaReport, MetaReportModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetaReportModel());
            }
        }

        [HttpPost]
        public ActionResult Edit(Guid id, MetaReportModel model, List<MetaReportItemModel> items, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaReport target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaReportHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", "Запись не найдена!");
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaReport();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaReport(target);
                }

                MetaReportModel.CreateMap();
                Mapper.Map(model, target);

                if (items != null)
                    SyncReportItems(target, items, context);

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

        #region Grid commands
        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaReportHelper.Delete(checkedRecords);
        }

        protected override void OnRemoveRows(Guid[] checkedRecords)
        {
            MetaReportHelper.Delete(checkedRecords, true);
        }

        protected override void OnRestoreRows(Guid[] checkedRecords)
        {
            MetaReportHelper.Restore(checkedRecords);
        }
        #endregion

        private void SyncReportItems(MetaReport target, List<MetaReportItemModel> itemModel, DBEntities context)
        {
            MetaReportItemModel.CreateMap();
            var reportItems = context.MetaReportItem.Where(c => c.MetaReportId == target.Id).ToList();

            foreach (var item in itemModel)
            {
                var reportItem = reportItems.FirstOrDefault(c => c.Id == item.Id);
                if (reportItem == null)
                {
                    reportItem = new MetaReportItem()
                    {
                        Id = item.Id
                    };
                    Mapper.Map(item, reportItem);
                    reportItem.MetaReportId = target.Id;
                    context.MetaReportItem.AddObject(reportItem);

                }
                else
                {
                    Mapper.Map(item, reportItem);
                    reportItem.MetaReportId = target.Id;
                }
            }

            for (int i = 0; i < reportItems.Count; i++)
            {
                var reportItem = reportItems[i];
                var item = itemModel.FirstOrDefault(c => c.Id == reportItem.Id);
                if (item == null)
                {
                    context.MetaReportItem.DeleteObject(reportItems[i]);
                    reportItems.RemoveAt(i);
                    i--;
                }
            }


        }

        #region Items
        public static List<MetaReportItemModel> GetItemsForReport(MetaReportModel model)
        {
            return GetItemsForReport(model.Id);
        }

        public static List<MetaReportItemModel> GetItemsForReport(Guid reportId)
        {
            MetaReportItemModel.CreateMap();
            List<MetaReportItem> items = MetaReportHelper.GetItemsByEntityId(reportId).ToList();

            List<MetaReportItemModel> res = Mapper.Map<IList<MetaReportItem>, List<MetaReportItemModel>>(items);

            return res;
        }
        #endregion
    }
}
