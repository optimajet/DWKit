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
    public class ContentFileSystemProvider : IContentProvider
    {
        string folder;
   
        public ContentFileSystemProvider(string folderName)
        {
            folder = folderName;
        }

        private string GetDataFileName(string token)
        {
            return Path.Combine(folder, token);
        }

        private string GetPropFileName(string token)
        {
            return Path.Combine(folder, token + ".json");
        }

        public async Task<string> AddAsync(Stream stream, Dictionary<string, object> parameters, bool used = true)
        {
            var token = Guid.NewGuid().ToString("N");
            await InsertAsync(token, stream, parameters, used);
            return token;
        }

        public async Task<(Stream Stream, Dictionary<string, string> Properties)> GetAsync(string token)
        {
            var datafile = GetDataFileName(token);
            var pfile = GetPropFileName(token);

            Stream stream = null;
            if (File.Exists(datafile))
            {
                stream = File.OpenRead(pfile);
            }

            Dictionary<string, string> properties = null;
            if (File.Exists(pfile))
            {
                using (var file = File.OpenText(pfile))
                {
                    JsonSerializer serializer = new JsonSerializer();
                    properties = (Dictionary<string, string>)serializer.Deserialize(file, typeof(Dictionary<string, string>));
                }
            }

            return (Stream: stream, Properties: properties);
        }
        
        public async Task ReplaceAsync(string token, Stream stream, Dictionary<string, string> parameters)
        {
            var user = await DWKitRuntime.Security.GetCurrentUserAsync();

            var properties = await GetPropertiesAsync(token);

            foreach (var parameter in parameters)
                properties.Add(parameter.Key, parameter.Value);

            properties[FileProperties.UpdatedDate] = DateTime.Now;
            properties[FileProperties.UpdatedBy] = user?.Name;

            await RemoveAsync(token);
            await InsertAsync(token, stream, properties, true);
        }

        public Task<bool> RemoveAsync(string token)
        {
            var datafile = GetDataFileName(token);
            var pfile = GetPropFileName(token);

            if (File.Exists(datafile))
                File.Delete(datafile);

            if (File.Exists(pfile))
                File.Delete(pfile);

            return Task.FromResult(true);
        }

        public async Task<bool> ExistAsync(string token)
        {
            var datafile = GetDataFileName(token);
            var pfile = GetPropFileName(token);
            return File.Exists(datafile) && File.Exists(pfile);
        }

        public async Task SetUsed(string token, bool used)
        {
            var pfile = GetPropFileName(token);

            if (File.Exists(pfile))
            {
                Dictionary<string, object> properties = null;

                using (var file = File.OpenText(pfile))
                {
                    JsonSerializer serializer = new JsonSerializer();
                    properties = (Dictionary<string, object>)serializer.Deserialize(file, typeof(Dictionary<string, object>));
                }

                properties["Used"] = used;

                File.Delete(pfile);

                using (StreamWriter file = File.CreateText(pfile))
                {
                    JsonSerializer serializer = new JsonSerializer();
                    serializer.Serialize(file, properties);
                }
            }else
            {
                throw new Exception($"Properties file {pfile} does not exists");
            }
        }

        private async Task<string> InsertAsync(string token, Stream stream, Dictionary<string, object> parameters, bool used = true)
        {
            var user = await DWKitRuntime.Security.GetCurrentUserAsync();
            var datafile = GetDataFileName(token);
            var pfile = GetPropFileName(token);

            using (var dataStream = File.Create(datafile))
            {
                dataStream.Seek(0, SeekOrigin.Begin);
                await stream.CopyToAsync(dataStream);
            }

            var p = new Dictionary<string, object>();
            foreach (var parameter in parameters)
                p.Add(parameter.Key, parameter.Value);

            if (!p.ContainsKey(FileProperties.CreatedBy))
            {
                p.Add(FileProperties.CreatedBy, user?.Name);
            }

            if (!p.ContainsKey(FileProperties.CreatedDate))
            {
                p.Add(FileProperties.CreatedDate, DateTime.Now);
            }
            
            p.Add("Used", used);
            p.Add(FileProperties.Length, stream.Length);

            using (StreamWriter file = File.CreateText(pfile))
            {
                JsonSerializer serializer = new JsonSerializer();
                serializer.Serialize(file, p);
            }

            return token;
        }

        public async Task<Dictionary<string, object>> GetPropertiesAsync(string token)
        {
            var pfile = GetPropFileName(token);

            Dictionary<string, object> properties = null;
            if (File.Exists(pfile))
            {
                using (var file = File.OpenText(pfile))
                {
                    JsonSerializer serializer = new JsonSerializer();
                    properties = (Dictionary<string, object>)serializer.Deserialize(file, typeof(Dictionary<string, object>));
                }
                properties.Add(FileProperties.Token, token);
            }

            return properties;
        }
    }
}
