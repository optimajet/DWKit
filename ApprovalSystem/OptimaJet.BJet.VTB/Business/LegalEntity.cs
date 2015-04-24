using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet.VTB
{
    public class LegalEntity
    {
        public static decimal? GetVAT(Guid Id)
        {
            var item = DynamicRepository.GetByEntity("LegalEntity", FilterCriteriaSet.And.Equal(Id, "Id")).FirstOrDefault();
            return item == null ? null : item.VAT;
        }
    }
}
