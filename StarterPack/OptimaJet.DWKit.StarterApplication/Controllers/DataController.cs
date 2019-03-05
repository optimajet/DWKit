using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using OptimaJet.DWKit.Core;
using OptimaJet.DWKit.Core.Model;
using OptimaJet.DWKit.Core.View;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    [Authorize]
    public class DataController : Controller
    {
        [Route("data/get")]
        public async Task<ActionResult> GetData(string name, string control, string urlFilter, string options,
            string filter, string paging, string sort)
        {
            try
            {
                if (!await DWKitRuntime.Security.CheckFormPermissionAsync(name, "View"))
                {
                    throw new Exception("Access denied!");
                }

                string filterActionName = null;
                string idValue = null;
                var filterItems = new List<ClientFilterItem>();

                if (NotNullOrEmpty(urlFilter))
                {
                    try
                    {
                        filterItems.AddRange(JsonConvert.DeserializeObject<List<ClientFilterItem>>(urlFilter));
                    }
                    catch
                    {
                        var filterActions = DWKitRuntime.ServerActions.GetFilterNames().Where(n => n.Equals(urlFilter, StringComparison.OrdinalIgnoreCase)).ToList();
                        string filterAction = null;
                        filterAction = filterActions.Count == 1 ? filterActions.First() 
                            : filterActions.FirstOrDefault(n => n.Equals(urlFilter, StringComparison.Ordinal));
                        
                        if (!string.IsNullOrEmpty(filterAction))
                            filterActionName = filterAction;
                        else
                        {
                            idValue = urlFilter;
                        }
                    }
                }

                if (NotNullOrEmpty(filter))
                {
                    filterItems.AddRange(JsonConvert.DeserializeObject<List<ClientFilterItem>>(filter));
                }


                var getRequest = new GetDataRequest(name)
                {
                    RequestingControlName = control,
                    FilterActionName = filterActionName,
                    IdValue = idValue,
                    Filter = filterItems,
                    BaseUrl = $"{Request.Scheme}://{Request.Host.Value}",
                    GetHeadersForLocalRequest = () =>
                    {
                        var dataUrlParameters = new Dictionary<string, string>();
                        dataUrlParameters.Add("Cookie",
                            string.Join(";",
                                Request.Cookies.Select(c => $"{c.Key}={c.Value}")));
                        return dataUrlParameters;
                    }
                };

                if (NotNullOrEmpty(options))
                {
                    getRequest.OptionsDictionary = JsonConvert.DeserializeObject<Dictionary<string, object>>(options);
                }

                if (NotNullOrEmpty(paging))
                {
                    getRequest.Paging = JsonConvert.DeserializeObject<ClientPaging>(paging);
                }

                if (NotNullOrEmpty(sort))
                {
                    getRequest.Sort = JsonConvert.DeserializeObject<List<ClienSortItem>>(sort);
                }

                var data = await DataSource.GetDataForFormAsync(getRequest).ConfigureAwait(false);
                
                if (data.IsFromUrl && FailResponse.IsFailResponse(data.Entity, out FailResponse fail))
                {
                    return Json(fail);
                }
                
                return Json(new ItemSuccessResponse<object>(data.Entity.ToDictionary(true)));
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("data/change")]
        [HttpPost]
        public async Task<ActionResult> ChangeData(string name, string data)
        {
            try
            {
                if (!await DWKitRuntime.Security.CheckFormPermissionAsync(name, "Edit"))
                {
                    throw new Exception("Access denied!");
                }

                var postRequest = new ChangeDataRequest(name, data)
                {
                    BaseUrl = $"{Request.Scheme}://{Request.Host.Value}",
                    GetHeadersForLocalRequest = () =>
                    {
                        var dataUrlParameters = new Dictionary<string, string>();
                        dataUrlParameters.Add("Cookie",
                            string.Join(";",
                                Request.Cookies.Select(c => $"{c.Key}={c.Value}")));
                        return dataUrlParameters;
                    }
                };

                var res = await DataSource.ChangeData(postRequest);
                if (res.success != null)
                    return Json(res.success);
                return Json(res.fail);
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("data/delete")]
        [HttpPost]
        public async Task<ActionResult> DeleteData(string name, string requestingControl, string data)
        {
            try
            {
                if (!await DWKitRuntime.Security.CheckFormPermissionAsync(name, "Edit"))
                {
                    throw new Exception("Access denied!");
                }

                var deleteRequest = new ChangeDataRequest(name, data, requestingControl)
                {
                    BaseUrl = $"{Request.Scheme}://{Request.Host.Value}",
                    GetHeadersForLocalRequest = () =>
                    {
                        var dataUrlParameters = new Dictionary<string, string>();
                        dataUrlParameters.Add("Cookie",
                            string.Join(";",
                                Request.Cookies.Select(c => $"{c.Key}={c.Value}")));
                        return dataUrlParameters;
                    }
                };

                var res = await DataSource.DeleteData(deleteRequest);
                if (res.success != null)
                    return Json(res.success);
                return Json(res.fail);
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [Route("data/dictionary")]
        public async Task<ActionResult> GetDictionary(string name, string sort, string columns, string paging, string filter, string parent)
        {
            try
            {
                if (!await DWKitRuntime.Security.CheckFormPermissionAsync(name, "View"))
                {
                    throw new Exception("Access denied!");
                }

                var data = await DataSource.GetDictionaryAsync(name, sort, columns, paging, filter, parent).ConfigureAwait(false);

                ItemSuccessResponse<IEnumerable<object>> result = null;

                if(NotNullOrEmpty(parent))
                {
                    result = new ItemSuccessResponse<IEnumerable<object>>(data.Item1.Select(x => new { Id = x.Item1, Name = x.Item2, Parent = x.Item3, HasChild = x.Item4 }));
                }else
                {
                    result = new ItemSuccessResponse<IEnumerable<object>>(data.Item1.Select(x => new { Key = x.Item1, Value = x.Item2 }));
                }

                result.Count = data.Item2;
                
                return Json(result);
            }
            catch (Exception e)
            {
                return Json(new FailResponse(e));
            }
        }

        [HttpPost]
        [Route("data/upload")]
        public async Task<ActionResult> UploadFile()
        {
            try
            {
                if (Request.Form.Files.Count > 0)
                {
                    var file = Request.Form.Files[0];
                    Dictionary<string, string> properties = new Dictionary<string, string>();
                    properties.Add("Name", file.FileName);
                    properties.Add("ContentType", file.ContentType);
                    var stream = file.OpenReadStream();
                    var token = await DWKitRuntime.ContentProvider.AddAsync(stream, properties);
                    return Json(new SuccessResponse(token));
                }
            }
            catch (Exception ex)
            {
                return Json(new FailResponse(ex));
            }

            return Json(new FailResponse("No any files in the request!"));
        }

        [Route("data/download/{token}")]
        public async Task<ActionResult> DownloadFile(string token)
        {
            var data = await DWKitRuntime.ContentProvider.GetAsync(token);
            var properties = data.Properties;
            var stream = data.Stream;

            var filename = "unknown";
            var contentType = "application/unknown";

            if (properties != null)
            {
                if (properties.ContainsKey("Name") && properties["Name"] != null)
                {
                    filename = properties["Name"];
                }

                if (properties.ContainsKey("ContentType") && properties["ContentType"] == null)
                {
                    contentType = properties["ContentType"];
                }
            }
            return File(stream, contentType, filename);
        }

        private static bool NotNullOrEmpty(string urlFilter)
        {
            return !string.IsNullOrEmpty(urlFilter) && !urlFilter.Equals("null", StringComparison.OrdinalIgnoreCase);
        }
    }
}