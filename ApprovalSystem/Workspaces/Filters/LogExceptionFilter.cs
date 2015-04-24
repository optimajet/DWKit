using OptimaJet.Common;
using System.Web;
using System.Web.Mvc;

namespace Workspaces.Filters
{
    public class LogExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext filterContext)
        {
            var exception = filterContext.Exception;
            if (!(exception is HttpException))
            {
                Logger.Log.Error(exception);
            }
        }
    }
}