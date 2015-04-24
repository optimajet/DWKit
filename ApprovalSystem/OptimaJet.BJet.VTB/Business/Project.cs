using OptimaJet.Common;
using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.DataProvider;
using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Exchange;
using OptimaJet.DynamicEntities.ExternalMethods;
using OptimaJet.DynamicEntities.Model;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.DynamicEntities.View;
using OptimaJet.Localization;
using OptimaJet.Security.Providers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using OptimaJet.Workflow;

namespace OptimaJet.BJet.VTB
{
    public class Project
    {
        public static void SetStatus(List<Guid> ids, Int16 status)
        {
            List<dynamic> items = DynamicRepository.GetByEntity("Project", FilterCriteriaSet.And.In(ids, "Id"));
            foreach(dynamic item in items)
                item.Status = status;
            DynamicRepository.UpdateByEntity("Project", items);
        }
    }
}
