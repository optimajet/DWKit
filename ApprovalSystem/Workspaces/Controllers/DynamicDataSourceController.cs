using System;
using System.Web.Mvc;
using DevExpress.Web.Mvc;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Common;
using System.Data;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.Security.Providers;
using OptimaJet.Workspace;
using OptimaJet.Security;
using DevExpress.Web.ASPxGridView;
using System.Collections.Generic;
using Workspaces.Helpers;

namespace Workspaces.Controllers
{
    public class DynamicDataSourceController : Controller
    {
        public ActionResult Index()
        {
            return new EmptyResult();
        }

        public ActionResult Get(string metaViewName)
        {
            ActionResult res = new EmptyResult();

            var dataSource = new DynamicEntityJSONDataSource();

            if (Request.HttpMethod.Equals("GET", StringComparison.InvariantCultureIgnoreCase))
            {

                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                    };
                }
                
                var extra = DynamicEntityJSONDataSource.GetExtra(Request.QueryString).ToLower();
                res = Get(metaViewName, dataSource, extra);
            }
            else if (Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase))
            {
                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.Add))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                    };
                }

                var updatedJson = Request.Body();
                res = new ContentResult
                    {
                        ContentType = "text/html",
                        Content = dataSource.Insert(metaViewName,
                                                    DynamicEntityJSONDataSource.GetEntityOperationType(Request.QueryString),
                                                    updatedJson,
                                                    DynamicEntityJSONDataSource.GetExtra(Request.Params),
                                                    DynamicEntityJSONDataSource.GetVisibility(Request.QueryString),
                                                    DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.Params),
                                                    DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.Params))
                    };
            }
            else if (Request.HttpMethod.Equals("PUT", StringComparison.InvariantCultureIgnoreCase))
            {
                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.Edit))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                    };
                }

                var updatedJson = Request.Body();

                res = new ContentResult
                    {
                        ContentType = "text/html",
                        Content =
                            dataSource.Update(metaViewName,
                                              updatedJson,
                                              DynamicEntityJSONDataSource.GetExtra(Request.Params),
                                              DynamicEntityJSONDataSource.GetVisibility(Request.QueryString),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString))
                                                    
                    };
            }
            else if (Request.HttpMethod.Equals("DELETE", StringComparison.InvariantCultureIgnoreCase))
            {
                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.Delete))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                    };
                }

                var updatedJson = Request.Body();
                string validateRes = string.Empty;

                if (metaViewName != "Budget")
                {
                    if (!MetadataRepositoty.ValidadateDelete(metaViewName, updatedJson, out validateRes))
                    {
                        return new ContentResult
                        {
                            ContentType = "text/html",
                            Content = DynamicEntityJSONDataSource.GetNotSuccess(validateRes)
                        };
                    }
                }

                res = new ContentResult
                    {
                        ContentType = "text/html",
                        Content =
                            dataSource.Delete(metaViewName,
                                              updatedJson,
                                              DynamicEntityJSONDataSource.GetExtra(Request.Params),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString))
                    };

            }


            return res;
        }

        private ContentResult Get(string metaViewName, DynamicEntityJSONDataSource dataSource, string extra)
        {
            var viewAllowViewDeleted = new List<string>(){
               "BudgetItem_Edit",
               "LegalEntity_Edit",
               "Invoice_Edit",
               "Contract_Edit"
            };

            bool ignoreDeleteFilter = false;

            if(viewAllowViewDeleted.Contains(metaViewName)){
                ignoreDeleteFilter = true;
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = dataSource.GetJSONData(metaViewName,
                    DynamicEntityJSONDataSource.GetEntityOperationType(Request.QueryString),
                    DynamicEntityJSONDataSource.GetPageSize(Request.QueryString),
                    DynamicEntityJSONDataSource.GetPageNumber(Request.QueryString),
                    DynamicEntityJSONDataSource.GetSort(Request.QueryString),
                    DynamicEntityJSONDataSource.GetFilter(Request.QueryString),
                    DynamicEntityJSONDataSource.GetSearch(Request.QueryString),
                    extra,
                    DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                    DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString),
                    DynamicEntityJSONDataSource.GetCallback(Request.QueryString),
                    DynamicEntityJSONDataSource.GetVisibility(Request.QueryString),
                    GetShowDeleted(metaViewName),
                    ignoreDeleteFilter
                    )

            };
        }
        
        public ActionResult GetAJAXTree(string metaViewName)
        {
            ActionResult res = new EmptyResult();
            var dataSource = new DynamicEntityJSONDataSource();

            if (Request.HttpMethod.Equals("GET", StringComparison.InvariantCultureIgnoreCase))
            {
                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
                {
                    return new ContentResult
                        {
                            ContentType = "text/html",
                            Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                        };
                }



                res = new ContentResult
                    {
                        ContentType = "text/html",

                        Content = dataSource.GetJSONAJAXTreeData(metaViewName,
                                                                 DynamicEntityJSONDataSource.GetSort(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetSearch(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetExtra(Request.Params),
                                                                 DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetCallback(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetNodeValue(Request.QueryString),
                                                                 DynamicEntityJSONDataSource.GetVisibility(Request.QueryString), GetShowDeleted(metaViewName)
                            )
                    };
            }
            else if (Request.HttpMethod.Equals("DELETE", StringComparison.InvariantCultureIgnoreCase))
            {
                if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.Delete))
                {
                    return new ContentResult
                        {
                            ContentType = "text/html",
                            Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                        };
                }

                var updatedJson = Request.Body();
                string validateRes = string.Empty;
                if (!MetadataRepositoty.ValidadateDelete(metaViewName, updatedJson, out validateRes))
                {
                    return new ContentResult
                    {
                        ContentType = "text/html",
                        Content = DynamicEntityJSONDataSource.GetNotSuccess(validateRes)
                    };
                }

                return new ContentResult
                    {
                        ContentType = "text/html",
                        Content =
                            dataSource.Delete(metaViewName,
                                              updatedJson,
                                              DynamicEntityJSONDataSource.GetExtra(Request.Params),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                                              DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString))
                    };


            }

            return res;
        }

        private bool GetShowDeleted(string metaViewName)
        {
            //return true;
            return DynamicEntityJSONDataSource.GetShowDeleted(Request.QueryString)
                   ;//&& SecurityCache.CheckPermission("Common", "ShowDeleteDeleted");
        }

        public ActionResult Bulk(string metaViewName)
        {
            var dataSource = new DynamicEntityJSONDataSource();

            var isNew = Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase);

            SecurityPermissionBaseTypeEnum type = isNew ? SecurityPermissionBaseTypeEnum.Add : SecurityPermissionBaseTypeEnum.Edit;

            if (!SecurityCache.ViewCan(metaViewName, type))
            {
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                };
            }

            var entityOperationType = DynamicEntityJSONDataSource.GetEntityOperationType(Request.QueryString);

            return new ContentResult
            {
                ContentType = "text/html",
                Content = dataSource.BulkApply(metaViewName, Request.Body(), isNew, entityOperationType)
            };
        }

        public ActionResult GetHistory(string metaViewName, Guid id)
        {
            if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
            {
                return new ContentResult
                {
                    ContentType = "text/html",
                    Content = DynamicEntityJSONDataSource.GetNotSuccess(WsFactory.GetАccessDeniedPage())
                };
            }

            return new ContentResult
            {
                ContentType = "text/html",
                Content = VersionFormatter.GetObjectHistoryInHtml(id)
            };
        }

        #region Export CSV/XLS/XLSX

        public ActionResult ExportCSV(string metaViewName, string entityIds)
        {
            if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
            {
                return Content(WsFactory.GetАccessDeniedHtmlFrom());
            }

            EventsLogHelper.ExportData("CSV", metaViewName, Request);

            EntityContainer data;
            if (string.IsNullOrEmpty(entityIds))
            {
                data = GetDataFromRequest(metaViewName);
            }
            else
            {
                data = GetDataFromRequest(metaViewName, entityIds);
            }

            return File(data.ToCsv(DynamicEntityJSONDataSource.GetFieldColumns(Request.QueryString)), "application/CSV", string.Format("{0}.csv", metaViewName));

        }

        public ActionResult ExportXls(string metaViewName, string entityIds)
        {
            if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
            {
                return Content(WsFactory.GetАccessDeniedHtmlFrom());
            }

            EventsLogHelper.ExportData("Xls", metaViewName, Request);

            EntityContainer data;

            if (string.IsNullOrEmpty(entityIds))
            {
                data = GetDataFromRequest(metaViewName);
            }
            else {
                data = GetDataFromRequest(metaViewName, entityIds);
            }
            var dt = data.ToDataTable(DynamicEntityJSONDataSource.GetFieldColumns(Request.QueryString));

            return GridExportHelper.ExportToXls(metaViewName, dt);
        }

        public ActionResult ExportXlsx(string metaViewName, string entityIds)
        {
            if (!SecurityCache.ViewCan(metaViewName, SecurityPermissionBaseTypeEnum.View))
            {
                return Content(WsFactory.GetАccessDeniedHtmlFrom());
            }

            EventsLogHelper.ExportData("Xlsx", metaViewName, Request);

            EntityContainer data;

            if (string.IsNullOrEmpty(entityIds))
            {
                data = GetDataFromRequest(metaViewName);
            }
            else
            {
                data = GetDataFromRequest(metaViewName, entityIds);
            }

            var dt = data.ToDataTable(DynamicEntityJSONDataSource.GetFieldColumns(Request.QueryString));

            return GridExportHelper.ExportToXlsx(metaViewName, dt);
        }


        private EntityContainer GetDataFromRequest(string metaViewName, string entityIds)
        {
            var dataSource = new DynamicEntityJSONDataSource();
            return dataSource.GetData(metaViewName, entityIds);
        }

        private EntityContainer GetDataFromRequest(string metaViewName)
        {
            var dataSource = new DynamicEntityJSONDataSource();
            
            var extra = DynamicEntityJSONDataSource.GetExtra(Request.QueryString);
            if (extra != null)
                extra = extra.ToLower();

            return dataSource.GetData(metaViewName,
                                      DynamicEntityJSONDataSource.GetSort(Request.QueryString),
                                      DynamicEntityJSONDataSource.GetFilter(Request.QueryString),
                                      DynamicEntityJSONDataSource.GetSearch(Request.QueryString),
                                      extra,
                                      DynamicEntityJSONDataSource.GetBaseEntityIdName(Request.QueryString),
                                      DynamicEntityJSONDataSource.GetBaseEntityIdValue(Request.QueryString));
        }

       
       

        #endregion
    }
}
