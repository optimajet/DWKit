using System;
using System.Text;
using System.Web.Mvc;

namespace Admin.Helpers
{
    public enum MessageType : byte
    {
        warning = 0,
        success,
        note,
        info
    }

    public class MessageHelper
    {
        public static string FormedMessage(string msg, MessageType type)
        {
            var res = new StringBuilder();
            string id = "infoMsg" + Guid.NewGuid().ToString();
            res.AppendFormat("<div id='{0}' class='alert {1}' onclick='$(this).hide();'>{2}</div>", id, type.ToString(),
                             msg);
            return res.ToString();
        }

        public static string FormedMessageWarning(string msg)
        {
            return FormedMessage(msg, MessageType.warning);
        }

        public static string FormedMessageWarning(Exception ex)
        {
            var sb = new StringBuilder();
            sb.Append(ex.Message);
            if (ex.InnerException != null)
            {
                sb.AppendLine(FormedMessageWarning(ex.InnerException));
            }
            return FormedMessage(sb.ToString(), MessageType.warning);
        }

        public static string FormedMessageSuccess(string msg)
        {
            return FormedMessage(msg, MessageType.success);
        }

        public static string FormedMessageNote(string msg)
        {
            return FormedMessage(msg, MessageType.note);
        }

        public static string FormedMessageInfo(string msg)
        {
            return FormedMessage(msg, MessageType.info);
        }

        public static ContentResult FormedContent(string msg)
        {
            var cr = new ContentResult();
            cr.Content = msg;
            return cr;
        }

        public static ContentResult FormedContentObjectNotFound()
        {
            return FormedContent("ObjectNotFound");
        }
    }
}