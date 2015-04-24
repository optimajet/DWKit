using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    public class SecurityUserImpersonation
    {
        public static List<ImpersonationInfo> GetImpersonationForUser(Guid userId)
        {
            if ((new DynamicEntityRepository()).GetEntityMetadataByEntityName("SecurityUserImpersonation") == null)
            {
                return new List<ImpersonationInfo>();
            }

            var param = new Dictionary<string, object>();
            param.Add("CurrentDate", DateTime.Now.Date);

            var filter = FilterCriteriaSet.And.Custom("DATEADD(dd, 0, DATEDIFF(dd, 0, @CurrentDate)) >= DATEADD(dd, 0, DATEDIFF(dd, 0, DateFrom)) AND DATEADD(dd, 0, DATEDIFF(dd, 0, @CurrentDate)) <= DATEADD(dd, 0, DATEDIFF(dd, 0, DateTo))  ", param);
            filter = filter.Merge(FilterCriteriaSet.And.Equal(userId, "ImpSecurityUserId"));

            var imp = DynamicRepository.GetByEntity("SecurityUserImpersonation", filter);

            if (imp.Count == 0)
            {
                return new List<ImpersonationInfo>();
            }

            var employee = DynamicRepository.GetByView("Employee", FilterCriteriaSet.And.In(imp.Select(c=>c.SecurityUserId).ToList(), "SecurityUserId"), OrderByCriteriaSet.Asc("SecurityUserId_Name"));

            return employee.Select(e => new ImpersonationInfo()
            {
                Id = e.SecurityUserId,
                Name = e.SecurityUserId_Name,
                Employee = e,
                DateTo = imp.Where(c => c.SecurityUserId == e.SecurityUserId).Single().DateTo
            }).ToList();
        }            
    }

    public class ImpersonationInfo
    {
        public Guid Id;
        public string Name;
        public Guid EmployeeId;
        public dynamic Employee;
        public DateTime DateTo;
    }

}
