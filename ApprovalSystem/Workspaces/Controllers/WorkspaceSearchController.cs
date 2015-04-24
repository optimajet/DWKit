using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Meta.Objects;
using OptimaJet.Security.Providers;
using OptimaJet.Workspace;
using ServiceStack.Text;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Workspaces.Controllers
{
    public class WorkspaceSearchController : Controller
    {
        [AllowAnonymous]
        public ActionResult GetDocumentTypes()
        {
            if (!CheckCurrentPermission())
                return Content(WsFactory.GetАccessDeniedHtmlFrom());

            var forms = MetaFormHelper.GetAvailableForSearch();
            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(forms.OrderBy(c => c.SearchWeight).OrderBy(c => c.Caption).Select(c => new { c.Id, Name = c.Caption, Weight = c.SearchWeight }).ToArray())
            };
        }

        [AllowAnonymous]
        public ActionResult GetDocumentCount(Guid docTypeId)
        {
            if (!CheckCurrentPermission())
                return Content(WsFactory.GetАccessDeniedHtmlFrom());


            string metaViewName = WsFactory.GetMetaViewByDocTypeForSearch(docTypeId);
            long count = 0;

            if (!string.IsNullOrWhiteSpace(metaViewName))
            {
                var dataSource = new DynamicEntityJSONDataSource();
                count = dataSource.GetDataCount(metaViewName, null);
            }
            return Content(JsonSerializer.SerializeToString(count));
        }

        [AllowAnonymous]
        public ActionResult GetDocumentIds(Guid docTypeId, long startIndex = 0, long count = 0)
        {
            if (!CheckCurrentPermission())
                return Content(WsFactory.GetАccessDeniedHtmlFrom());

            string metaViewName = WsFactory.GetMetaViewByDocTypeForSearch(docTypeId);
            ArrayList ids = new ArrayList();
            if (!string.IsNullOrWhiteSpace(metaViewName))
            {
                var dataSource = new DynamicEntityJSONDataSource();
                var data = dataSource.GetDataKey(metaViewName, null, startIndex, count);
                data.ToDataTable();
                
                var att = data.Metadata.Attributes.FirstOrDefault();
                foreach (DynamicEntity item in data.Entities)
                {
                    ids.Add(item.GetProperty(att.PropertyName));
                }
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(ids)
            };
        }

        [AllowAnonymous]
        public ActionResult GetDocument(Guid docTypeId, Guid id)
        {
            if (!CheckCurrentPermission())
                return Content(WsFactory.GetАccessDeniedHtmlFrom());

            WsDocumentInfo di = WsFactory.GetWsDocumentInfo(docTypeId, id);
            di.Url = string.Format("#WS/{0}/GetWindowContent/{1}", di.FormName, di.Id);
            
            return new ContentResult
            {
                ContentType = "text/html",
                Content = JsonSerializer.SerializeToString(di)
            };
        }
                
        public ActionResult GetDocumentPrintForm(Guid docTypeId, Guid id)
        {
            if (!CheckCurrentPermission())
                return Content(WsFactory.GetАccessDeniedHtmlFrom());

            WsDocumentInfo di = WsFactory.GetWsDocumentInfo(docTypeId, id);

            di.Url = string.Format("/WS/{0}/{1}", di.DocTypeName, di.Id);

            return new ContentResult
            {
                ContentType = "text/html",
                Content = di.HTMLContent
            };
        }

        [AllowAnonymous]
        public FileStreamResult GetDocumentFile(Guid docTypeId, object id, string fileId)
        {
            if (!CheckCurrentPermission())
                return null;

            var data = Workspaces.Helpers.FileHelper.GetFile(fileId);

            return new FileStreamResult(new MemoryStream(data), "application/octet-stream");
        }

        [AllowAnonymous]
        public ActionResult CheckPermission(Guid docTypeId, object id, string userId, string userLogin)
        {
            if (!CheckCurrentPermission())
                return null;

            string metaViewName = WsFactory.GetMetaViewByDocTypeForSearch(docTypeId);
            if (string.IsNullOrWhiteSpace(metaViewName))
                return Content("Представление для типа не найдено!");

            return null;
        }

        private bool CheckCurrentPermission()
        {
            //return SecurityCache.CheckPermission("Search", "Search");
            return true;
        }

        public ActionResult Search(string query, int page = 0)
        {
            string searchUrl = Settings.Current["AppSearch.ServerUrl"];
            searchUrl += string.Format("?query={0}&page={1}", query, page);
            try
            {
                var request = WebRequest.Create(searchUrl) as HttpWebRequest;
                request.Method = "POST";


                string data = string.Format("{0}", Settings.Current["AppSearch.ServerKey"]);
                byte[] dataStream = Encoding.UTF8.GetBytes(data);
                request.ContentType = "text/plain";
                request.ContentLength = dataStream.Length;
                Stream rStream = request.GetRequestStream();
                rStream.Write(dataStream, 0, dataStream.Length);
                rStream.Close();
            
                var response = request.GetResponse() as HttpWebResponse;
                StreamReader reader = new StreamReader(response.GetResponseStream());

                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = reader.ReadToEnd()
                };
            }
            catch (Exception ex)
            {
                Logger.Log.Error(ex);
                return Content(string.Format("Ошибка при поиске: {0}", ex.Message));
            }
        }
    }
}
