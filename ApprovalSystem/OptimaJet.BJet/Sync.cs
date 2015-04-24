using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    public class Sync
    {
        public static void CheckRecords(string viewName, List<dynamic> records, Dictionary<string, object> syncParams,List<string> excludeProperties = null)
        {
            if (records == null || records.Count == 0)
                return;

            var budgetProperties = new List<string>() { "BudgetVersionId", "BudgetId" };

            var d = new DynamicEntityRepository();
            var metadata = d.GetEntityMetadataByViewName(viewName, VisibilitySettings.Empty);

            var replaceIds = new Dictionary<object, object>();
            
            foreach (dynamic record in records)
            {   
                foreach (PlainAttributeDescription att in metadata.PlainAttributes)
                {
                    if ((excludeProperties != null && excludeProperties.Contains(att.PropertyName)) || budgetProperties.Contains(att.PropertyName))
                        continue;

                    if (string.IsNullOrWhiteSpace(att.ViewNameForSelect))
                        continue;

                    var joinedMd = d.GetEntityMetadataByViewName(att.ViewNameForSelect, VisibilitySettings.Empty);
                    if (!joinedMd.Attributes.Any(c => budgetProperties.Contains(c.PropertyName)))
                    {
                        continue;
                    }

                    var deRecord = (DynamicEntity)record;
                    var oldId = deRecord[att.PropertyName];

                    if (oldId == null)
                        continue;

                    deRecord[att.PropertyName] = replaceIds.ContainsKey(oldId) ? 
                        replaceIds[oldId] :
                        GetSyncRecordId(oldId, joinedMd, syncParams);

                    if (!replaceIds.ContainsKey(oldId))
                        replaceIds.Add(oldId, deRecord[att.PropertyName]);
                }
            }
        }
              
        private static object GetSyncRecordId(object id, EntityMetadata metadata, Dictionary<string, object> syncParams)
        {
            if (!metadata.Attributes.Any(c =>syncParams.ContainsKey(c.PropertyName)))
            {
                return id;
            }

            var oldItem = DynamicRepository.Get(metadata, FilterCriteriaSet.And.Equal(id, metadata.PrimaryKeyPropertyName), ExternalMethodsCallMode.None).FirstOrDefault();
            foreach(var p in syncParams)
            {
                if(metadata.Attributes.Any(c => c.PropertyName == p.Key))
                {
                    if ((oldItem as DynamicEntity)[p.Key].Equals(p.Value))
                        return id;
                }
            }

            FilterCriteriaSet compareFilter = FilterCriteriaSet.And;
            foreach (var p in syncParams)
            {
                if (metadata.Attributes.Any(c => c.PropertyName == p.Key))
                {
                    compareFilter.Merge(FilterCriteriaSet.And.Equal(p.Value, p.Key));
                }
            }

            foreach (var attributeToCompare in metadata.Attributes.Where(a => a.ForCompare))
            {
                compareFilter.Merge(FilterCriteriaSet.And.Equal((oldItem as DynamicEntity)[attributeToCompare.PropertyName], attributeToCompare.PropertyName));
            }

            var item = DynamicRepository.Get(metadata, compareFilter, ExternalMethodsCallMode.None).FirstOrDefault();
            return item != null ? (item as DynamicEntity).GetId() : id;
        }
    }
}
