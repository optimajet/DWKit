using System;
using System.Globalization;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using DevExpress.Data;
using DevExpress.Web.ASPxClasses;
using DevExpress.Web.ASPxEditors;
using DevExpress.Web.ASPxGridView;
using DevExpress.Web.ASPxPopupControl;
using DevExpress.Web.Mvc;
using System.Drawing;
using OptimaJet.DynamicEntities;
using System.Configuration;

namespace Admin.Helpers
{
    public class CurrentSettings
    { 
        public static void LoadMainGridViewSettings(GridViewSettings settings)
        {
            settings.Name = "MainGrid";
            settings.KeyFieldName = "Id";
            settings.Width = Unit.Percentage(100);
            int pageSize = 50;
            int.TryParse(Admin.DAL.Settings.Current["MainGrid.SettingsPager.PageSize"], out pageSize);
            settings.SettingsPager.PageSize = pageSize;
            settings.Settings.ShowFilterRow = true;
            settings.Settings.ShowFilterRowMenu = true;
            settings.CommandColumn.Visible = true;
            settings.CommandColumn.ClearFilterButton.Visible = true;
            settings.TotalSummary.Add(new ASPxSummaryItem("Id", SummaryItemType.Count));
            settings.CommandColumn.ShowSelectCheckbox = true;

            settings.HtmlRowCreated += delegate(object sender, ASPxGridViewTableRowEventArgs args)
                                           {
                                               if (args.RowType == GridViewRowType.Data)
                                               {
                                                   object isDeleted = null;
                                                   try
                                                   {
                                                       isDeleted = args.GetValue("IsDeleted");
                                                   }
                                                   catch 
                                                   {
                                                   }

                                                   if (isDeleted is bool && (bool) isDeleted)
                                                   {
                                                       args.Row.Style["background-color"] = "#FFFFCC";
                                                       args.Row.Attributes["isdeleted"] = "1";
                                                   }
                                               }
                                           };

            settings.ClientSideEvents.SelectionChanged += string.Format(@"
function SelectionChanged(s, e) {{
      $('.dxgvDataRow[isdeleted=""1""]').css('background-color', '#FFFFCC');
    }}");
        }

        public static void LoadRelatedGridViewSettings(GridViewSettings settings)
        {
            settings.Name = "RelatedGrid";
            settings.KeyFieldName = "Id";
            settings.Width = Unit.Percentage(100);
            settings.SettingsEditing.Mode = GridViewEditingMode.Inline;
            settings.SettingsPager.Mode = GridViewPagerMode.ShowAllRecords;
            settings.CommandColumn.Visible = true;
            settings.CommandColumn.ClearFilterButton.Visible = false;
            settings.CommandColumn.ShowSelectCheckbox = false;
                  
            settings.Settings.ShowFilterRow = true;
            settings.Settings.ShowFilterRowMenu = true;
        }

        public static void LoadPopupViewSettings(PopupControlSettings settings)
        {
            settings.CloseAction = CloseAction.OuterMouseClick;
            settings.PopupVerticalAlign = PopupVerticalAlign.Below;
            settings.PopupHorizontalAlign = PopupHorizontalAlign.LeftSides;
            settings.ShowFooter = true;

            int height = 400;
            int.TryParse(Admin.DAL.Settings.Current["PopupView.Height"], out height);
            settings.Height = Unit.Pixel(height);

            int width = 600;
            int.TryParse(Admin.DAL.Settings.Current["PopupView.Width"], out height);
            settings.Width = Unit.Pixel(width);
            settings.LoadContentViaCallback = LoadContentViaCallback.OnFirstShow;
            settings.Modal = true;
            settings.PopupHorizontalAlign = PopupHorizontalAlign.WindowCenter;
            settings.PopupVerticalAlign = PopupVerticalAlign.WindowCenter;
            settings.EnableAnimation = false;
            settings.AllowDragging = true;
        }

        public static string GeMainMenuStyle(string param)
        {
            param = param.ToLower();
            if (HttpContext.Current != null)
            {
                if (HttpContext.Current.Request.RawUrl == "/" && param == "home")
                    return "class=active";

                if (HttpContext.Current.Request.RawUrl.ToLower().Contains(param))
                    return "class=active";
            }
            return string.Empty;
        }

        public static void LoadComboBoxSettings(ComboBoxSettings settings, ViewDataDictionary viewData,
                                                string dictionaryUrl)
        {
            LoadComboBoxSettings(settings, viewData.ModelMetadata.PropertyName,
                                 viewData.ModelMetadata.IsNullableValueType, dictionaryUrl);
        }

        public static void LoadComboBoxSettings(ComboBoxSettings settings, string propertyName, bool isNullableValueType,
                                                string dictionaryUrl)
        {
            settings.Name = propertyName + "ComboBox";
            settings.Width = new Unit("99%");
            settings.Properties.DropDownStyle = DropDownStyle.DropDownList;
            settings.Properties.DropDownRows = 20;
            settings.Properties.EnableCallbackMode = true;
            settings.Properties.CallbackPageSize = 30;
            settings.Properties.IncrementalFilteringMode = IncrementalFilteringMode.StartsWith;
            settings.Properties.TextFormatString = "{0}";
            settings.Properties.ValueField = "Id";
            settings.Properties.TextField = "Name";
            settings.Properties.NullDisplayText = "";
            settings.Properties.ValueType = typeof (Guid);

            settings.Properties.ClientSideEvents.ValueChanged =
                string.Format("function(){{ $('#{0}').val({1}.GetValue()); }}",
                              propertyName,
                              settings.Name);

            var buttonOnClick = new StringBuilder();
            if (isNullableValueType)
            {
                settings.Properties.Buttons.Add(Resources.Resource.Clean);
                buttonOnClick.AppendLine(string.Format(
                    @"case {0}:
                                s.SetText("""");
                                s.SetValue("""");
                                $('#{1}').val("""");
                            break;",
                    settings.Properties.Buttons.Count - 1, propertyName));
            }
            if (!string.IsNullOrEmpty(dictionaryUrl))
            {
                settings.Properties.Buttons.Add(Resources.Resource.Link);
                string toUrl = dictionaryUrl;
                if(dictionaryUrl[dictionaryUrl.Length - 1] != '/')
                    toUrl += "/";
                buttonOnClick.AppendLine(string.Format(
                    @"case {0}:
                                var objId = {1}.GetValue();
                                if(objId != undefined && objId != '')
                                    window.open('{2}' + objId);                                
                            break;",
                    settings.Properties.Buttons.Count - 1, settings.Name, toUrl));
            }

            if (buttonOnClick.Length > 0)
            {
                settings.Properties.ClientSideEvents.ButtonClick =
                    string.Format(
                        @"function (s, e) {{
                            switch (e.buttonIndex) {{
                            {0}
                            }}
                        }}",
                        buttonOnClick);
            }
        }

        public static void SetConnectionKeyToCookies(string connectionkey)
        {
            HttpContext.Current.Response.SetCookie(new HttpCookie("ConnectionKey", connectionkey));
        }

        public static void SetLangToCookies(string lang)
        {
            HttpContext.Current.Response.SetCookie(new HttpCookie("LangKey", lang));
        }

        public static void InitConnection()
        {
            DynamicEntitiesSettings.ConnectionStringMetadataForEF = Admin.DAL.Settings.ConnectionStringForEF;
            DynamicEntitiesSettings.ConnectionStringData = ConfigurationManager.ConnectionStrings["DEData"] != null ?
                ConfigurationManager.ConnectionStrings["DEData"].ConnectionString : Admin.DAL.Settings.ConnectionString;
            DynamicEntitiesSettings.ConnectionStringMetadata = ConfigurationManager.ConnectionStrings["DEMetadata"] != null ? ConfigurationManager.ConnectionStrings["DEMetadata"].ConnectionString : Admin.DAL.Settings.ConnectionString;
            DynamicEntitiesSettings.ConnectionStringVersion = ConfigurationManager.ConnectionStrings["DEData"] != null ? ConfigurationManager.ConnectionStrings["DEVersion"].ConnectionString : Admin.DAL.Settings.ConnectionString;
        }
    }
}