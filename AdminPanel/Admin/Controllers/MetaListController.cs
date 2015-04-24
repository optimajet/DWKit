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
    public class MetaListController : DictionaryController
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
                MetaList obj = MetaListHelper.Get(id.Value);
                if (obj == null)
                {
                    return MessageHelper.FormedContentObjectNotFound();
                }

                MetaListModel.CreateMap();
                MetaListModel model = Mapper.Map<MetaList, MetaListModel>(obj);
                return View(model);
            }
            else
            {
                return View(new MetaListModel());
            }
        }

        

        [HttpPost]
        public ActionResult Edit(Guid id, MetaListModel model, string button)
        {
            using (DBEntities context = Settings.CreateDataContext())
            {
                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                MetaList target = null;
                if (model.Id != Guid.Empty)
                {
                    target = MetaListHelper.Get(model.Id, context);
                    if (target == null)
                    {
                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
                        return View(model);
                    }
                }
                else
                {
                    target = new MetaList();
                    target.Id = Guid.NewGuid();
                    context.AddToMetaList(target);
                }

                MetaListModel.CreateMap();
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

        

        #endregion

        #region GridCommand

        protected override void OnDeleteRows(Guid[] checkedRecords)
        {
            MetaListHelper.Delete(checkedRecords);
        }

        #endregion

      

       
    }
}