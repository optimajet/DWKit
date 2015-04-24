using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;

namespace OptimaJet.BJet
{
    public class CommonMethods
    {
        public static FilterCriteriaSet GetProcessedFilter(EntityMetadata metadata)
        {
            var subquery =
                string.Format(
                    "[{0}].[{1}].[{2}] IN (SELECT DISTINCT ProcessId FROM WorkflowHistory WHERE SecurityUserId IS NOT NULL AND SecurityUserId = '{3}')",
                    metadata.SchemaName, metadata.TableName, metadata.PrimaryKeyPropertyName,
                    (Guid)CommonSettings.CurrentEmployee.SecurityUserId);

            return FilterCriteriaSet.And.Custom(subquery);
        }

        public static FilterCriteriaSet GetInboxFilter(EntityMetadata metadata)
        {
            var subquery =
                string.Format(
                    "[{0}].[{1}].[{2}] IN (SELECT DISTINCT ProcessId FROM WorkflowInbox WHERE IdentityId = '{3}')",
                    metadata.SchemaName, metadata.TableName, metadata.PrimaryKeyPropertyName,
                    (Guid)CommonSettings.CurrentEmployee.SecurityUserId);

            return  FilterCriteriaSet.And.Custom(subquery);
        }

        public static bool VisibilityAccessCheck(EntityMetadata metadata, Guid id, FilterCriteriaSet visibilityFilter)
        {
            if (visibilityFilter.IsEmpty)
                return true;

            var accessFilter =
                FilterCriteriaSet.Or.Merge(visibilityFilter)
                    .Merge(CommonMethods.GetInboxFilter(metadata))
                    .Merge(CommonMethods.GetProcessedFilter(metadata));
            accessFilter = FilterCriteriaSet.And.Equal(id, metadata.PrimaryKeyPropertyName).Merge(accessFilter);

            var cnt = metadata.Count(accessFilter);
            return cnt == 1;
        }

        public static ExternalMethodCallResult AccessDeniedResult()
        {
            var externalMethodCallResult = new ExternalMethodCallResult(false);
            externalMethodCallResult.AddGlobalError("Access denied", ExternalMethodErrorCodes.AccessDenied);
            return externalMethodCallResult;
        }

        public static AttributeDescription GetEntityCaptionAttribute(EntityMetadata metadata)
        {
            string[] columnCaptions = new string[] { "Code", "IdNumber", "NumberId", "Number", "Name", "Caption", "Id" };

            int i = -1;
            var properties = metadata.PlainAttributes.Select(pa => pa.PropertyName);
            while (++i < columnCaptions.Count() && !properties.Contains(columnCaptions[i])) { }

            return i < columnCaptions.Count() ? metadata.GetAttributeByPropertyName(columnCaptions[i]) : null;
        }
    }
}
