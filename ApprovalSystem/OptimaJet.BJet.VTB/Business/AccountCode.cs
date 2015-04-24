using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet.VTB
{
    public class AccountCode
    {
        public static dynamic GetInfo(Guid accountcodeId)
        {
            var item = DynamicRepository.GetByEntity("AccountCode", FilterCriteriaSet.And.Equal(accountcodeId, "Id")).FirstOrDefault();
            return new{
                UsefulLife = item == null ? null : item.UsefulLife,
                OnlyOPEX = item == null ? false : item.OnlyOPEX,
            };
        }
    }
}
