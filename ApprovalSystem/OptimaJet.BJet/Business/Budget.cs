using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using OptimaJet.DynamicEntities.Model;

namespace OptimaJet.BJet
{
    public class Budget
    {
        public Dictionary<string, Dictionary<object, object>> CopyEntityByForms(string columnName, object fromId, object toId, List<string> formNames, Dictionary<string, FilterCriteriaSet> filters)
        {
            var replaceIds = new Dictionary<string, Dictionary<object, object>>();
            var formList = new List<FormModel>();

            var mdRep = new MetadataRepositoty();

            #region Вставка основной записи
            foreach (var formName in formNames)
            {
                var form = FormModelRepository.GetFormModel(formName, FormModelType.All);
                
                EntityMetadata md = mdRep.GetEntityMetadataByViewName(form.MainViewName);
                
                var filter = FilterCriteriaSet.And.Equal(fromId, columnName);
                if (filters.ContainsKey(form.MainViewName))
                    filter = filter.Merge(filters[form.MainViewName]); 

                List<dynamic> records = md.Get(filter, ExternalMethodsCallMode.None);
                
                foreach (DynamicEntity r in records)
                {
                    var oldId = r[md.PrimaryKeyAttribute.ColumnName];
                    md.SetNewPrimaryKey(r);
                    if (!replaceIds.ContainsKey(md.TableName))
                    {
                        replaceIds.Add(md.TableName, new Dictionary<object, object>());
                    }

                    replaceIds[md.TableName].Add(oldId, r[md.PrimaryKeyAttribute.ColumnName]);
                    r[columnName] = toId;
                }

                md.Insert(records, ExternalMethodsCallMode.None);
                formList.Add(form);
            }
            #endregion

            #region Вставка дочерних и обновленеи ids
            foreach (var form in formList)
            {
                EntityMetadata md = mdRep.GetEntityMetadataByViewName(form.MainViewName);
                var replaceAtt = md.Attributes.Where(c => !string.IsNullOrEmpty(c.ReferencedTableName) &&
                    replaceIds.ContainsKey(c.ReferencedTableName)).ToList();

                if (form.Blocks.Where(c => !string.IsNullOrWhiteSpace(c.BaseEntityIdName)).Count() == 1 && 
                    replaceAtt.Count == 0)
                    continue;

                var filter1 = FilterCriteriaSet.And.Equal(toId, columnName);
                if (filters.ContainsKey(form.MainViewName))
                    filter1 = filter1.Merge(filters[form.MainViewName]);

                List<dynamic> records = md.Get(filter1, ExternalMethodsCallMode.None);

                foreach (DynamicEntity r in records)
                {   
                    foreach(AttributeDescription rAtt in replaceAtt)
                    {
                        var replaceIdsForTable = replaceIds[rAtt.ReferencedTableName];
                        if(r[rAtt.PropertyName] != null && replaceIdsForTable.ContainsKey(r[rAtt.PropertyName]))
                        {
                            r[rAtt.PropertyName] = replaceIdsForTable[r[rAtt.PropertyName]];
                        }
                    }

                    #region Создаем записи в дочерних таблицах
                    foreach (var block in form.Blocks.Where(c=> form.MainViewName != c.ViewName &&
                        !string.IsNullOrWhiteSpace(c.BaseEntityIdName)))
                    {
                        EntityMetadata blockMd = mdRep.GetEntityMetadataByViewName(block.ViewName);
                        if (md.TableName == blockMd.TableName)
                            continue;

                        object oldParentEntityId = replaceIds[md.TableName].Where(c => c.Value.Equals(r.GetId())).Select(c => c.Key).First();

                        var filter2 = FilterCriteriaSet.And.Equal(oldParentEntityId, block.BaseEntityIdName);
                        if (filters.ContainsKey(block.ViewName))
                            filter2 = filter2.Merge(filters[block.ViewName]);

                        List<dynamic> blockRecords = blockMd.Get(filter2, ExternalMethodsCallMode.None);

                        foreach (DynamicEntity blockR in blockRecords)
                        {
                            var oldId = blockR[blockMd.PrimaryKeyAttribute.ColumnName];
                            blockMd.SetNewPrimaryKey(blockR);
                            if (!replaceIds.ContainsKey(blockMd.TableName))
                            {
                                replaceIds.Add(blockMd.TableName, new Dictionary<object, object>());
                            }

                            replaceIds[blockMd.TableName].Add(oldId, blockR[blockMd.PrimaryKeyAttribute.ColumnName]);
                            
                            var replaceAttForBlock = blockMd.Attributes.Where(c => !string.IsNullOrEmpty(c.ReferencedTableName) &&
                                replaceIds.ContainsKey(c.ReferencedTableName)).ToList();

                            foreach (AttributeDescription rAtt in replaceAttForBlock)
                            {
                                var replaceIdsForTable = replaceIds[rAtt.ReferencedTableName];
                                if (replaceIdsForTable.ContainsKey(blockR[rAtt.PropertyName]))
                                {
                                    blockR[rAtt.PropertyName] = replaceIdsForTable[blockR[rAtt.PropertyName]];
                                }
                            }
                        }

                        blockMd.Insert(blockRecords, ExternalMethodsCallMode.None);
                    }
                    #endregion
                }

                md.Update(records, ExternalMethodsCallMode.None);
            }

            return replaceIds;

            #endregion
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="entityName"></param>
        /// <param name="idProperty"></param>
        /// <param name="baseFilter"></param>
        /// <param name="replaceIds"></param>
        /// <param name="ignoreNotFoundReplaces">Если true - то при отсутствии ключа в словаре замен не вставляем новую запись</param>
        /// <returns></returns>
        public Dictionary<object, object> CopyDependsEntity(string entityName, string idProperty,
            FilterCriteriaSet baseFilter,
            Dictionary<string, Dictionary<object, object>> replaceIds, bool ignoreNotFoundReplaces = false)
        {
            List<dynamic> allocationRecords = DynamicRepository.GetByEntity(entityName, baseFilter);
            var dependsReplaceId = new Dictionary<object, object>();
            var entitiesToInsert = new List<dynamic>();
            foreach (DynamicEntity r in allocationRecords)
            {
                if (!string.IsNullOrWhiteSpace(idProperty))
                {
                    object oldId = r[idProperty];
                    r[idProperty] = Guid.NewGuid();
                    dependsReplaceId.Add(oldId, r[idProperty]);
                }

                var needInsert = true;

                foreach (var replaceId in replaceIds)
                {
                    object newValue;

                    if (!replaceId.Value.TryGetValue(r[replaceId.Key], out newValue))
                    {
                        if (!ignoreNotFoundReplaces)
                            throw new Exception(string.Format("Not found new value for property {0}. Old Value = {1}",
                                replaceId.Key, r[replaceId.Key]));
                        else
                        {
                            needInsert = false;
                            break;
                        }
                    }
                    else
                    {
                        r[replaceId.Key] = newValue;
                    }

                }

                if (needInsert)
                    entitiesToInsert.Add(r);
            }

            DynamicRepository.InsertByEntity(entityName, entitiesToInsert);

            return dependsReplaceId;
        }

        public void DeleteEntityByForms(string columnName, object valueId, List<string> formNames)
        {
            if (formNames == null)
                return;

            var replaceIds = new Dictionary<object, object>();
            var mdRep = new MetadataRepositoty();

            foreach (var formName in formNames)
            {
                var form = FormModelRepository.GetFormModel(formName, FormModelType.All);

                EntityMetadata md = mdRep.GetEntityMetadataByViewName(form.MainViewName);
                List<dynamic> records = md.Get(FilterCriteriaSet.And.Equal(valueId, columnName), ExternalMethodsCallMode.None);

                DynamicRepository.DeleteByView(md.Name, records.Select(c => (c as DynamicEntity).GetId()).ToList(), false);
            }
        }

        public void DeleteEntityByViews(string columnName, object valueId, List<string> views)
        {
            if (views == null)
                return;

            var replaceIds = new Dictionary<object, object>();
            var mdRep = new MetadataRepositoty();

            foreach (var viewName in views)
            {
                EntityMetadata md = mdRep.GetEntityMetadataByViewName(viewName);
                List<dynamic> records = md.Get(FilterCriteriaSet.And.Equal(valueId, columnName), ExternalMethodsCallMode.None);
                DynamicRepository.DeleteByView(md.Name, records.Select(c => (c as DynamicEntity).GetId()).ToList(), false);
            }
        }

        public static dynamic GetCurrentVersionByBudgetName(string name)
        {
            int year;
            if (int.TryParse(name, out year))
            {
                return DynamicRepository.GetByEntity("BudgetVersion",
                                    FilterCriteriaSet.And.Custom(string.Format("BudgetId in (SELECT Id FROM Budget WHERE Budget.Name = '{0}')", year))
                                    .Merge(FilterCriteriaSet.And.Equal(true, "IsCurrent"))).FirstOrDefault();
            }
            return null;
        }
    }
}
