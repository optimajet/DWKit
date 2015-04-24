using OptimaJet.DynamicEntities.DataSource;
using OptimaJet.DynamicEntities.Query;
using OptimaJet.Workflow.Core.Runtime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OptimaJet.Workspace;
using Admin.DAL;

namespace OptimaJet.BJet
{
    public class Notification
    {
        static Notification()
        {
            if (Settings.Current.ParamExists("NotificationEmailEnabled"))
            {
                bool.TryParse(Settings.Current["NotificationEmailEnabled"], out Enabled);
            }
        }

        public static bool Enabled = false;

        public static void DocumentAddToInbox(ProcessStatusChangedEventArgs e, List<Guid> identityId)
        {
            if (!Enabled)
                return;

            var comment = e.ProcessInstance.ProcessParameters != null ?
                e.ProcessInstance.ProcessParameters.Where(c => c.Name == "Comment").Select(c => c.Value).FirstOrDefault() : 
                null;

            string subject = string.Format("@ObjectType №@ObjectNumber [@ObjectState] {0}", 
                Localization.LocalizationProvider.Provider.Get("email:addedtoinbox"));
            
            string wfinfo = GenerateWfInfo(string.Empty, string.Empty, comment as string);

            SendNotification(e.ProcessId, identityId,
                string.Format("[{0}] {1}", Settings.ApplicationName, subject),
                string.Format("<a href='@ObjectUrl'>{0}</a>.", subject),
                wfinfo,
                NotificationTypeEnum.DocumentAddToInbox);
        }

        public static void DocumentCommandExecute(Guid processId, Guid identityId, Guid impersonatedIdentityId, WorkflowCommand command)
        {
            if (!Enabled)
                return;
            
            string subject = string.Format("@ObjectType №@ObjectNumber [@ObjectState] {0}",
                Localization.LocalizationProvider.Provider.Get("email:changedstate"));

            var identity = DynamicRepository.GetByEntity("SecurityUser", FilterCriteriaSet.And.Equal(identityId, "Id")).FirstOrDefault();
            var comment = command.Parameters.Where(c=> c.ParameterName == "Comment").Select(c=>c.Value).FirstOrDefault();

            string wfinfo = GenerateWfInfo(identity == null ? null : (string)identity.Name as string, command.LocalizedName, comment as string);

            SendNotification(processId, null,
                string.Format("[{0}] {1}", Settings.ApplicationName, subject),
                string.Format("<a href='@ObjectUrl'>{0}</a>.", subject), 
                wfinfo,
                command.Classifier == Workflow.Core.Model.TransitionClassifier.Reverse ?
                NotificationTypeEnum.NotificationWorkflowMyDocBack : NotificationTypeEnum.NotificationWorkflowMyDocChangeState);
        }

        public static void DocumentSetState(Guid processId, Guid identityId, Guid impersonatedIdentityId, string stateName, IDictionary<string, object> parameters)
        {
            if (!Enabled)
                return;

            string subject = string.Format("@ObjectType №@ObjectNumber [@ObjectState] {0}",
                Localization.LocalizationProvider.Provider.Get("email:changedstate"));

            var identity = DynamicRepository.GetByEntity("SecurityUser", FilterCriteriaSet.And.Equal(identityId, "Id")).FirstOrDefault();
            var comment = parameters.Where(c => c.Key == "Comment").Select(c => c.Value).FirstOrDefault();

            string wfinfo = GenerateWfInfo(identity == null ? null : (string)identity.Name as string,
                 "Set state", comment as string);

            SendNotification(processId, null,
                string.Format("[{0}] {1}", Settings.ApplicationName, subject),
                string.Format("<a href='@ObjectUrl'>{0}</a>.", subject),
                wfinfo,
                NotificationTypeEnum.NotificationWorkflowMyDocChangeState);
        }

        private static string GenerateWfInfo(string identityName, string command, string comment)
        {
            StringBuilder sb = new StringBuilder();

            sb.AppendFormat("<table>");

            if (!string.IsNullOrWhiteSpace(identityName))
                sb.AppendFormat("<tr><td>Employee:</td><td>{0}</td><tr>", identityName);

            if (!string.IsNullOrWhiteSpace(command))
                sb.AppendFormat("<tr><td>Action:</td><td>{0}</td></tr>", command);

            if (!string.IsNullOrWhiteSpace(comment))
                sb.AppendFormat("<tr><td>Comment:</td><td>{0}</td></tr>", comment.Replace("\n", "<br/>"));

            sb.Append("</table>");
            return sb.ToString();
        }

        protected static void SendNotification(Guid processId, List<Guid> identityId, string subject, string message, string wfinfo, NotificationTypeEnum type)
        {
            Email mailer = new Email();

            if (identityId == null)
                identityId = new List<Guid>();

            if (type == NotificationTypeEnum.NotificationWorkflowMyDocBack || type == NotificationTypeEnum.NotificationWorkflowMyDocChangeState)
            {
                var budgetItem = DynamicRepository.GetByView("BudgetItem_Edit", FilterCriteriaSet.And.Equal(processId, "Id")).FirstOrDefault();
                if (budgetItem != null)
                    identityId.Add(budgetItem.CreatorEmployeeId_SecurityUserId);           
            }

            if (identityId.Count == 0)
                return;

            var userFilter = FilterCriteriaSet.And.In(identityId, "Id");

            if(type == NotificationTypeEnum.DocumentAddToInbox)
            {
                userFilter = userFilter.Merge(FilterCriteriaSet.And.Equal(true, "NotificationWorkflowInbox"));
            }
            else if(type == NotificationTypeEnum.NotificationWorkflowMyDocBack)
            {
                userFilter = userFilter.Merge(FilterCriteriaSet.And.Equal(true, "NotificationWorkflowMyDocBack"));
            }
            else if(type == NotificationTypeEnum.NotificationWorkflowMyDocChangeState)
            {
                userFilter = userFilter.Merge(FilterCriteriaSet.And.Equal(true, "NotificationWorkflowMyDocChangeState"));
            }

            var suList = DynamicRepository.GetByEntity("SecurityUser", userFilter);

            if (suList.Count == 0)
                return;

            var param = new Dictionary<string, string>();

            param.Add("Subject", subject);
            param.Add("Message", message);
            param.Add("WFInfo", wfinfo);

            AddObjectParams(param, processId, 
                type == NotificationTypeEnum.NotificationWorkflowMyDocBack);

            var emailList = suList.Select(c => (string)c.Email).ToList();
            mailer.SendEmail("NotificationEmail", param, emailList);
        }

        private static Dictionary<string, string> GetGlobalParams()
        {
            var param = new Dictionary<string, string>();
            param.Add("ApplicationName", Settings.ApplicationName);

            return param;
        }

        private static Dictionary<string, string> AddObjectParams(Dictionary<string, string> param, Guid objectId, bool back = false)
        {
            var budgetItem = DynamicRepository.GetByView("BudgetItem_Edit", FilterCriteriaSet.And.Equal(objectId, "Id")).FirstOrDefault();
            
            foreach(var p in GetGlobalParams())
            {
                if (!param.ContainsKey(p.Key))
                    param.Add(p.Key, p.Value);
            }

            //Надо функционал печатных форм доделать, пока он не готов.
            //var docInfo = new WsDocumentInfo(new Guid("6d543cd1-4f7b-4c32-b984-bf8bee899d47"), objectId, false);
            //param.Add("PrintForm", docInfo.HTMLContent);


            if (param.ContainsKey("Subject"))
            {
                param["Subject"] = param["Subject"].Replace("@ObjectType", "Budget Item")
                    .Replace("@ObjectNumber", budgetItem.NumberId.ToString())
                    .Replace("@ObjectState", budgetItem.StateName.ToString());
            }

            if (param.ContainsKey("Message"))
            {
                param["Message"] = param["Message"].Replace("@ObjectType", "Budget Item")
                    .Replace("@ObjectNumber", budgetItem.NumberId.ToString())
                    .Replace("@ObjectState", budgetItem.StateName.ToString())
                    .Replace("@ObjectUrl", string.Format("{0}/#WS/BudgetItem_Edit/GetContent?editform=BudgetItem_Edit&selectquerytype=0&needredirect=false&id={1}&B={2}&BV={3}",
                    Settings.Current["UrlBase"],
                    ((Guid)budgetItem.Id).ToString("N"), CommonSettings.CurrentBudget.Name, CommonSettings.CurrentBudgetVersion.Name));
            }

            if (budgetItem.WasBack || back)
                param.Add("HeaderColor", "@HeaderColorNegative");
            return param;
        }
    }

    public enum NotificationTypeEnum
    {
        DocumentAddToInbox,
        NotificationWorkflowMyDocBack,
        NotificationWorkflowMyDocChangeState
    }
}
