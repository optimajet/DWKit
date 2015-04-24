//using System.IO;
//using Admin.DAL;
//using OptimaJet.Common;
//using OptimaJet.Meta.Objects;
//using OptimaJet.Search;
//using OptimaJet.Search.Interface;
//using System;
//using System.Collections.Generic;
//using System.Runtime.Remoting;
//using System.Text;
//using System.Threading;
//using System.Web;

//namespace Admin.Helpers
//{
//    public class SearchInit
//    {
//        private static volatile SearchRuntime _runtime;

//        private static readonly object _sync = new object();

//        public static SearchRuntime Runtime
//        {
//            get
//            {
//                if (_runtime == null)
//                {
//                    lock (_sync)
//                    {
//                        if (_runtime == null)
//                        {
//                            string defaultFolder = "~/SearchIndexFolder";
//                            if (Settings.Current.ParamExists("AppSearch.IndexFolder"))
//                            {
//                                defaultFolder = Settings.Current["AppSearch.IndexFolder"];
//                            }

//                            defaultFolder = Path.IsPathRooted(defaultFolder) ? defaultFolder : HttpContext.Current.Server.MapPath(defaultFolder);



//                            var temporaryFolder = Settings.Current["TemporaryFolderForImportExport"];

//                            temporaryFolder = Path.IsPathRooted(temporaryFolder) ? temporaryFolder : HttpContext.Current.Server.MapPath(temporaryFolder);
                            
//                            AppSearchProviderBase[] providers = GetRegisterProviders();
//                            _runtime = new SearchRuntime(providers, defaultFolder, temporaryFolder);
//                            _runtime.OnProgress += _runtime_OnProgress;
//                        }
//                    }
//                }

//                return _runtime;
//            }
//        }

//        static void _runtime_OnProgress(AppSearchProviderBase provider, SearchRuntimeScanProgressStatus status, decimal percentComplete, int indexDocCount)
//        {
//            if (provider.Id is Guid)
//            {
//                string state = string.Empty;
//                switch (status)
//                {
//                    case SearchRuntimeScanProgressStatus.Progress:
//                        state = string.Format("Процесс обновления индекса. Завершено {0}%. Проиндексировано документов: {1} шт.", percentComplete, indexDocCount);
//                        break;
//                    case SearchRuntimeScanProgressStatus.Success:
//                        state = string.Format("Индекс обновлен. Проиндексировано документов: {0} шт.", indexDocCount);
//                        break;
//                    case SearchRuntimeScanProgressStatus.Fail:
//                        state = string.Format("Ошибка при обновлении индекса. Проиндексировано документов: {0} шт.", indexDocCount);
//                        break;
//                }

//                MetaAppSearchHelper.SetStatus((Guid)provider.Id, state);
//            }
//        }

//        #region other
//        private static AppSearchProviderBase[] GetRegisterProviders()
//        {
//            var providers = new List<AppSearchProviderBase>();
            
//            foreach (var item in MetaAppSearchHelper.GetAll())
//            {
//                if (!item.IsActive)
//                    continue;

//                AppSearchProviderBase p = null;
//                try
//                {
//                    var handle = Activator.CreateInstance(item.AssemblyName, item.TypeName);
//                    p = (AppSearchProviderBase)handle.Unwrap();
//                }
//                catch(Exception ex)
//                {
//                    Logger.Log.Error(ex);
//                    continue;
//                }

//                if (p != null)
//                {
//                    var param = GetParams(item.Parameters);
//                    var path = item.AlterIndexPath;
//                    if(!string.IsNullOrWhiteSpace(path))
//                        path = HttpContext.Current.Server.MapPath(path);

//                    p.Init(item.Id, item.Name, param, path);
//                    providers.Add(p);
//                }                
//            }

//            return providers.ToArray();
//        }

//        private static Dictionary<string,string> GetParams(string param)
//        {
//            var dic = new Dictionary<string, string>();
//            if(string.IsNullOrWhiteSpace(param))
//                return dic;

//            foreach(string p in param.Split('\n'))
//            {
//                if (string.IsNullOrWhiteSpace(p))
//                    continue;

//                int index = p.IndexOf('=');
//                if(index > 0)
//                {
//                    string key = p.Substring(0, index);
//                    index++;
//                    string value = index >= p.Length ? 
//                                string.Empty : 
//                                p.Substring(index, p.Length - index).Replace("\r", "");

//                    if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(value))
//                        continue;

//                    key = key.Trim();
                    
//                    if (!dic.ContainsKey(key))
//                    {
//                        dic.Add(key, value.Trim());
//                    }
//                }                
//            }

//            return dic;
//        }

//        public static string GetProviderParams(string assemblyName, string typeName)
//        {
//            string res = string.Empty;
//            AppSearchProviderBase p = null;
//            ObjectHandle handle = null;
//            try
//            {
//                handle = Activator.CreateInstance(assemblyName, typeName);
//            }
//            catch(Exception ex)
//            {
//                res = ex.Message;
//            }
            
//            if (handle != null)
//            {
//                p = handle.Unwrap() as AppSearchProviderBase;
//                if (p == null)
//                {
//                    res = "Указанный тип не имплементирует интерфейс IAppSearchProvider";
//                }
//                else
//                {
//                    StringBuilder sb = new StringBuilder();
//                    foreach (var s in p.GetConfigParams())
//                    {
//                        if (sb.Length > 0)
//                            sb.AppendLine();
//                        sb.AppendFormat("{0}=", s);
                        
//                    }
//                    res = sb.ToString();
//                }
//            }
//            return res;
//        }
//        #endregion

//        public static string AsycRefreshIndex()
//        {
//            return AsycRefreshIndex(null);
//        }

//        public static string AsycRefreshIndex(object checkedRecords)
//        {
//            var r = Runtime;
//            ThreadPool.QueueUserWorkItem(_RefreshIndex, checkedRecords);
            
//            if(checkedRecords == null)
//                return "Процесс обновления индексов запущен...";
//            else
//                return "Процесс обновления индексов для выбранных элементов запущен...";
//        }

//        private static void _RefreshIndex(object checkedRecords)
//        {
//            try
//            {
//                if (checkedRecords is Array)
//                {
//                    Runtime.RefreshIndex(checkedRecords as object[]);
//                }
//                else
//                {
//                    Runtime.RefreshIndex();
//                }
//            }
//            catch (Exception ex)
//            {
//                Logger.Log.Error(ex);
//            }
//        }

//        public static SearchRuntime Restart()
//        {
//            _runtime = null;
//            return Runtime;
//        }
//    }
//}
