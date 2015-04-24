//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using System.Web.Mvc;
//using Admin.DAL;
//using Admin.Helpers;
//using AutoMapper;
//using OptimaJet.Meta.Objects;
//using Admin.Models;
//using System.Text;
//using OptimaJet.Search.Interface;
//using System.IO;
//using ServiceStack.Text;

//namespace Admin.Controllers
//{
//    public class MetaAppSearchController : DictionaryController
//    {
//        public ActionResult Index()
//        {
//            return View(Settings.Current.AppSettings.Where(c => c.Name.Contains("AppSearch")).ToList());
//        }

//        public ActionResult Save()
//        {
//            foreach (var setting in Settings.Current.AppSettings)
//            {
//                if (Request.Form.AllKeys.Contains(setting.Name))
//                {
//                    Settings.Current[setting.Name] = Request.Form[setting.Name];
//                }
//            }
//            SearchInit.Restart();
//            return View("Index", Settings.Current.AppSettings.Where(c => c.Name.Contains("AppSearch")).ToList());
//        }

//        #region Edit

//        public ActionResult Edit(Guid? id)
//        {
//            if (id.HasValue)
//            {
//                MetaAppSearch obj = MetaAppSearchHelper.Get(id.Value);
//                if (obj == null)
//                {
//                    return MessageHelper.FormedContentObjectNotFound();
//                }

//                MetaAppSearchModel.CreateMap();
//                MetaAppSearchModel model = Mapper.Map<MetaAppSearch, MetaAppSearchModel>(obj);
//                return View(model);
//            }
//            else
//            {
//                return View(new MetaAppSearchModel());
//            }
//        }

//        [HttpPost]
//        public ActionResult Edit(Guid id, MetaAppSearchModel model, string button)
//        {
//            using (DBEntities context = Settings.CreateDataContext())
//            {
//                Validate(context, model);

//                if (!ModelState.IsValid)
//                {
//                    return View(model);
//                }

//                MetaAppSearch target = null;
//                if (model.Id != Guid.Empty)
//                {
//                    target = MetaAppSearchHelper.Get(model.Id, context);
//                    if (target == null)
//                    {
//                        ModelState.AddModelError("", Resources.Resource.RowNotFound);
//                        return View(model);
//                    }
//                }
//                else
//                {
//                    target = new MetaAppSearch { Id = Guid.NewGuid() };
//                    context.AddToMetaAppSearch(target);
//                }

//                MetaAppSearchModel.CreateMap();
//                Mapper.Map(model, target);              

//                try
//                {
//                    context.SaveChanges();
//                }
//                catch (Exception ex)
//                {
//                    var sb = new StringBuilder(Resources.Resource.SaveError + ": " + ex.Message);
//                    if (ex.InnerException != null)
//                        sb.AppendLine(ex.InnerException.Message);
//                    ModelState.AddModelError("", sb.ToString());
//                    return View(model);
//                }

//                SearchInit.Restart();

//                if (button == "SaveAndExit")
//                    return RedirectToAction("Index");
//                else
//                    return RedirectToAction("Edit", new { target.Id });
//            }
//        }

     
//        private void Validate(DBEntities context, MetaAppSearchModel model)
//        {
          
//        }

//        #endregion

//        #region GridCommand

//        protected override void OnDeleteRows(Guid[] checkedRecords)
//        {
//            MetaAppSearchHelper.Delete(checkedRecords);
//        }

//        #endregion

//        public ActionResult GetParams(string assemblyName, string typeName)
//        {
//            string result = SearchInit.GetProviderParams(assemblyName, typeName);
//            return Json(result);
//        }

//        [AllowAnonymous]
//        public ActionResult ExternalSearch(string query, int page = 0)
//        {            
//            StreamReader reader = new StreamReader(Request.InputStream);
//            string key = reader.ReadToEnd();

//            if(key != Settings.Current["AppSearch.ServerKey"])
//                return Content(string.Format("Key is not valid.", query)); 
//            return Search(query, page);
//        }

//        [AllowAnonymous]
//        public ActionResult Notify(string docTypeIds, string ids, string providerId, string key, string action)
//        {
//            if (!key.Equals(Settings.Current["AppSearch.ServerKey"]))
//                return Content("Key is not valid.");

//            var lDocTypeIds = JsonSerializer.DeserializeFromString<List<string>>(docTypeIds);
//            var lIds = JsonSerializer.DeserializeFromString<List<string>>(ids);


//            if (action.Equals("reindex", StringComparison.CurrentCultureIgnoreCase))
//            {
//                SearchInit.Runtime.Reindex(lDocTypeIds, lIds, providerId);
//            }
//            else if (action.Equals("delete", StringComparison.CurrentCultureIgnoreCase))
//            {
//                SearchInit.Runtime.Delete(lDocTypeIds, lIds, providerId);
//            }

//            return new EmptyResult();
//        }

//        public ActionResult Search(string query, int page = 0)
//        {
//            query = query.Trim();
//            if (string.IsNullOrWhiteSpace(query))
//            {
//                return Content("Задан пустой поисковый запрос.");
//            }

//            int allCount = 0;
//            var items = SearchInit.Runtime.Search(query, page * 10, 10, out allCount);
//            if (allCount == 0)
//            {
//                return Content(string.Format("Поиск по запросу <b>{0}</b> не дал результатов.", query));
//            }
//            return Content(ConvertToResults(items, page, 10, allCount));
//        }

//        private string ConvertToResults(DocumentInfo[] items, int page, int pageSize, int allCount)
//        {
//            StringBuilder sb = new StringBuilder();

//            sb.AppendFormat("<div class='SearchInfo'>Нашлось записей: <b>{0}</b></div>", allCount);
            
//            int i = page * pageSize + 1;
//            foreach(var di in items)
//            {
//                sb.AppendFormat("<div class='SearchItem'>");
//                sb.AppendFormat(@"<div class='ItemCaption'>{1}. <a target='_blank' href='{0}'>{2}</a></div>", di.Url, i, di.Caption);
//                sb.AppendFormat(@"<div class='ItemInfo'>
//Тип документа: {0}
//</div>", di.DocTypeName);
//                sb.AppendFormat(@"<div class='ItemBody'>{0}</div>", di.HighlitedFragment);
//                //sb.AppendFormat(@"<div style='display:none' id='Item{0}'>{1}</div>", di.Id, HttpUtility.HtmlEncode(di.HTMLContent));
//                sb.AppendFormat("</div>");
//                i++;
//            }

//            #region Paging
//            sb.AppendFormat("Страницы: <div class='SearchPager'>");
//            int pageCount = (allCount - 1)/pageSize;
//            int constStep = 5;
//            for (i = 0; i <= pageCount; i++)
//            {
//                if (i > 0)
//                    sb.AppendFormat(" | ");

//                if (i > constStep && i + constStep < page)
//                {
//                    sb.AppendFormat("...");
//                    i = page - constStep;
//                    continue;
//                }

//                if (i > page + constStep && i + constStep < pageCount)
//                {
//                    sb.AppendFormat("...");
//                    i = pageCount - constStep;
//                    continue;
//                }
                
//                if(i == page)
//                    sb.AppendFormat("<b>{0}</b>", i + 1);
//                else
//                    sb.AppendFormat("<a onclick='OnSearch({0});'>{1}</a>", i, i+1);
//            }
//            sb.AppendFormat("</div>");
//            #endregion

//            return sb.ToString();
//        }

//        public ActionResult RefreshAllIndex()
//        {
//            string res = string.Empty;

//            try
//            {
//                res = SearchInit.AsycRefreshIndex(); 
//            }
//            catch (Exception ex)
//            {
//                return Content(MessageHelper.FormedMessageWarning(ex), "");
//            }

//            return Content(MessageHelper.FormedMessageInfo(res), "");            
//        }

//        public ActionResult RefreshIndex(object[] checkedRecords)
//        {
//            string res = string.Empty;

//            try
//            {
//                res = SearchInit.AsycRefreshIndex(checkedRecords); 
//            }
//            catch (Exception ex)
//            {
//                return Content(MessageHelper.FormedMessageWarning(ex), "");
//            }

//            return Content(MessageHelper.FormedMessageInfo(res), "");     
//        }
//    }
//}
