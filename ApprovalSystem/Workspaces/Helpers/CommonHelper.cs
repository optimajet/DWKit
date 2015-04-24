using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Workspaces.Helpers
{
    public class CommonHelper
    {
        public static bool IsMobile(HttpRequestBase request)
        {
            if (request.Cookies.AllKeys.Contains("View"))
            {
                switch (request.Cookies["View"].Value)
                {
                    case "Web": return false;
                    case "Mobile": return true;
                }                
            }

            string userAgent = request.UserAgent.ToLower();
            return userAgent.Contains("iphone") |
                 userAgent.Contains("ppc") |
                 userAgent.Contains("windows ce") |
                 userAgent.Contains("blackberry") |
                 userAgent.Contains("opera mini") |
                 userAgent.Contains("mobile") |
                 userAgent.Contains("palm") |
                 userAgent.Contains("portable");
        }
    }
}