using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using Admin.DAL;
using OptimaJet.Common;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Security.Providers;
using ServiceStack.Text;
using Workspaces.Helpers;

namespace Workspaces.Controllers
{
    public class FileUploadController : Controller
    {
        [HttpPost]
        public ActionResult Upload(string tablename)
        {
            var rep = new MetadataRepositoty();
            var metadata = rep.GetEntityMetadataByTableName("UploadedFiles", "dbo", 1);

            var result = new List<object>();

            for (int i = 0; i < Request.Files.Count; i++)
            {
                var file = Request.Files[i] as HttpPostedFileWrapper;

                var newAttachment = metadata.New();
                newAttachment.Id = Guid.NewGuid();
                newAttachment.ObjectId = Guid.Empty;
                newAttachment.Name = file.FileName;
                newAttachment.CreatedBy = SecurityCache.CurrentUser.Name;
                newAttachment.CreatedDate = DateTime.Now;
                newAttachment.Data = ReadFile(file.InputStream);
                newAttachment.AttachmentLength = (int)Math.Round((decimal)file.ContentLength / 1024, 0);
                newAttachment.TableName = tablename;
                metadata.Insert(newAttachment as DynamicEntity, ExternalMethodsCallMode.None);

                var res = new
                {
                    id = newAttachment.Id,
                    name = newAttachment.Name,
                    createdby = newAttachment.CreatedBy,
                    createddate = newAttachment.CreatedDate,
                    attachmentlength = newAttachment.AttachmentLength
                };
               
                result.Add(res);
            }

            StringBuilder sb = new StringBuilder("[");
            bool isFirst = true;

            foreach (var c in result)
            {
                if (!isFirst)
                    sb.Append(",");
                isFirst = false;
                sb.Append(ServiceStack.Text.JsonSerializer.SerializeToString(c));
            }

            sb.Append("]");

            return new ContentResult
            {
                ContentType = "text/html",
                Content =
                    string.Format("{{\"success\":\"true\",\"result\":{0}}}"
                        , sb.ToString())
            };

        }

        [HttpGet]
        public ActionResult Download(string token, string filename)
        {
            var data = new byte[0];

            if (string.IsNullOrEmpty(filename))
                filename = "download";

            var rep = new MetadataRepositoty();
            var metadata = rep.GetEntityMetadataByTableName("UploadedFiles", "dbo", 1);

            var attachment = metadata.Get(FilterCriteriaSet.And.Equal(token, "Id")).FirstOrDefault();

            if (attachment == null)
                return new EmptyResult();

            return File(attachment.Data, "application/file", filename);

        }


        [HttpPost]
        public ActionResult Delete(string token)
        {
            var id = new Guid(token);

            using (var context = new DBEntities(Settings.ConnectionString))
            {
                var file = context.UploadedFiles.FirstOrDefault(f => f.Id == id);
                if (file != null)
                {
                    context.UploadedFiles.DeleteObject(file);
                    context.SaveChanges();
                }
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = "{success:true}"
            };

        }

        public static byte[] ReadFile(Stream input)
        {
            var buffer = new byte[16 * 1024];


            using (var ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

    }
}
