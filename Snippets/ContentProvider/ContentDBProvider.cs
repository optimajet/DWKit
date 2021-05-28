using Newtonsoft.Json;
using OptimaJet.DWKit.Core.Metadata.DbObjects;
using OptimaJet.DWKit.Core.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.DWKit.Core.DataProvider
{
    public class ContentDBProvider : IContentProvider
    {
        string cs;
        string table;
        string scheme;

        public ContentDBProvider(string connectionString, string tableName, string schemeName)
        {
            cs = connectionString;
            table = tableName;
            scheme = schemeName;
        }

        public async Task<string> AddAsync(Stream stream, Dictionary<string, object> parameters, bool used = true)
        {
            var user = await DWKitRuntime.Security.GetCurrentUserAsync();
            string name = string.Empty;
            if (parameters.ContainsKey(FileProperties.Name))
            {
                name = parameters[FileProperties.Name] as string;
            }

            string contentType = string.Empty;
            if (parameters.ContainsKey(FileProperties.ContentType))
            {
                contentType = parameters[FileProperties.ContentType] as string;
            }

            var file = new UploadedFiles()
            {
                Id = DWKitRuntime.DbProvider.GenerateGuid(),
                Name = name,
                AttachmentLength = stream.Length,
                ContentType = contentType,
                CreatedBy = user?.Name,
                CreatedDate = DateTime.Now,
                Used = used,
                Properties = JsonConvert.SerializeObject(parameters)
            };

            file.Data = new byte[stream.Length];
            await stream.ReadAsync(file.Data, 0, (int)stream.Length);
            await file.ApplyAsync();
            return file.Id.ToString("N");
        }

        public async Task<(Stream Stream, Dictionary<string, string> Properties)> GetAsync(string token)
        { 
            Guid id;
            if (Guid.TryParse(token, out id))
            {
                var item = await UploadedFiles.SelectByKey(id);
                var stream = new MemoryStream(item.Data);

                var dic = new Dictionary<string, string>
                {
                    { FileProperties.Name, item.Name },
                    { FileProperties.Length, item.AttachmentLength.ToString() },
                    { FileProperties.ContentType, item.ContentType },
                    { FileProperties.CreatedBy, item.CreatedBy },
                    { FileProperties.CreatedDate, item.CreatedDate.ToString() },
                    { FileProperties.UpdatedBy, item.UpdatedBy },
                    { FileProperties.UpdatedDate, item.UpdatedDate.ToString() }
                };
                return (Stream: stream, Properties: dic);
            }
            return (Stream: null, Properties: null);
        }
        
        public async Task ReplaceAsync(string token, Stream stream, Dictionary<string, string> parameters)
        {
            var user = await DWKitRuntime.Security.GetCurrentUserAsync();

            string name = null;
            if (parameters.ContainsKey(FileProperties.Name))
            {
                name = parameters[FileProperties.Name];
            }

            string contentType = null;
            if (parameters.ContainsKey(FileProperties.ContentType))
            {
                contentType = parameters[FileProperties.ContentType];
            }

            UploadedFiles file;
            if (Guid.TryParse(token, out Guid id))
            {
                file = await UploadedFiles.SelectByKey(id);
            }
            else
            {
                file = new UploadedFiles(){
                    Id = id,
                    CreatedBy = user?.Name,
                    CreatedDate = DateTime.Now
                };
            }

            if(name != null)
                file.Name = name;
            if (file.ContentType != null)
                file.ContentType = contentType;
            file.UpdatedBy = user?.Name;
            file.UpdatedDate = DateTime.Now;
            file.Used = true;
            file.Data = new byte[stream.Length];

            if (stream != null) {
                await stream.WriteAsync(file.Data, 0, (int)stream.Length);
                file.AttachmentLength = stream.Length;
            }

            await file.ApplyAsync();
        }

        public async Task<bool> RemoveAsync(string token)
        {
            Guid id;
            if (Guid.TryParse(token, out id))
            {
                await UploadedFiles.Remove<Guid>(id);
                return true;
            }
            return false;
        }

        public async Task<bool> ExistAsync(string token)
        {
            if (Guid.TryParse(token, out Guid id))
            {
                var item = await UploadedFilesPoor.SelectByKey(id);
                return item != null;
            }
            return false;
        }

        public async Task SetUsed(string token, bool used)
        {
            if (Guid.TryParse(token, out Guid id))
            {
                var item = await UploadedFilesPoor.SelectByKey(id);
                item.Used = used;
                await item.ApplyAsync();
            }
        }

        public async Task<Dictionary<string, object>> GetPropertiesAsync(string token)
        {
            if (Guid.TryParse(token, out Guid id))
            {
                var item = await UploadedFilesPoor.SelectByKey(id);

                var dic = new Dictionary<string, object>
                {
                    { FileProperties.Name, item.Name },
                    { FileProperties.Length, item.AttachmentLength },
                    { FileProperties.ContentType, item.ContentType },
                    { FileProperties.CreatedBy, item.CreatedBy },
                    { FileProperties.CreatedDate, item.CreatedDate },
                    { FileProperties.UpdatedBy, item.UpdatedBy },
                    { FileProperties.UpdatedDate, item.UpdatedDate },
                    { FileProperties.Token, token }
                };
                return dic;
            }
            return null;
        }
    }
}
