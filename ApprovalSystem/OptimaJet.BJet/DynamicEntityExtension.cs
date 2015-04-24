using OptimaJet.DynamicEntities;
using OptimaJet.DynamicEntities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OptimaJet.BJet
{
    public class DynamicEntityExtension : IDynamicEntityExtension
    {
        public void CorrectGeneratorParameters(Dictionary<string, string> parameters)
        {
            if (!parameters.ContainsKey("PageSize"))
            {
                var profile = (DynamicEntity)OptimaJet.BJet.CommonSettings.Profile;
                if (profile.HasProperty("PageSize") && OptimaJet.BJet.CommonSettings.Profile.PageSize != null)
                    parameters.Add("PageSize", OptimaJet.BJet.CommonSettings.Profile.PageSize.ToString());
            }
        }
    }
}
