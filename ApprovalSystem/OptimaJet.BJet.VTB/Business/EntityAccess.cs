using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;

namespace OptimaJet.BJet.VTB
{
    public class EntityAccess
    {
        public static List<Tuple<Guid, string, List<Tuple<Guid, string>>>> GetDependingEntityAccess(string metaviewName, Guid[] ids, int deep = 1)
        {
            DynamicEntityRepository repo = new DynamicEntityRepository();
            EntityMetadata metadata = repo.GetEntityMetadataByEntityName(metaviewName);
            List<Guid> dependingEntityMetadataIds = MetadataRepositoty.GetDependingEntityIds(new TableDescription(metadata.SchemaName, metadata.TableName));
            Dictionary<Guid, EntityMetadata> dependingMetadata = dependingEntityMetadataIds.Select(id => new KeyValuePair<Guid, EntityMetadata>(id, repo.GetEntityMetadataByEntityId(id)))
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

            var dependingEntities = new List<Tuple<Guid, string, List<Tuple<Guid, string>>>>();

            foreach (var entityMetadata in dependingMetadata)
            {
                FilterCriteriaSet filters = FilterCriteriaSet.Empty;
                AttributeDescription entityCaptionAttribute = OptimaJet.BJet.CommonMethods.GetEntityCaptionAttribute(entityMetadata.Value);

                List<FilterCriteriaSet> filterSets = entityMetadata.Value.PlainAttributes.Where(a => a.IsReference && a.ReferencedSchemaName == metadata.SchemaName && a.ReferencedTableName == metadata.TableName)
                    .Select(a => FilterCriteriaSet.And.In(ids.ToList(), entityMetadata.Value.GetColumn(a))).ToList();

                filterSets.ForEach(f => filters = filters != FilterCriteriaSet.Empty ? filters.Merge(f) : f);

                var entities = repo.GetEntitiesByMetadata(entityMetadata.Value, filters).Entities;
                if (entities == null || entities.Count() == 0)
                    continue;

                var dependingEntity = new Tuple<Guid, string, List<Tuple<Guid, string>>>(
                    entityMetadata.Key,
                    entityMetadata.Value.TableName,
                    new List<Tuple<Guid, string>>(entities.Select(e =>
                        new Tuple<Guid, string>((Guid)e.Id, e.GetProperty(entityCaptionAttribute.PropertyName).ToString())
                        ).ToList()));
                dependingEntities.Add(dependingEntity);

                if (deep > 0)
                    dependingEntities.AddRange(GetDependingEntityAccess(dependingEntity.Item2, dependingEntity.Item3.Select(t => t.Item1).ToArray(), deep - 1));
            }
            return dependingEntities;
        }
    }
}
