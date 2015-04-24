using DevExpress.Web.ASPxGridView;
using DevExpress.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Workspaces.Helpers
{
    public static class GridExportHelper
    {
        private static Dictionary<string, List<string>> columnsToFormatting = new Dictionary<string, List<string>>() {
                {"Work", new List<string>() { "TotalCost" }},
                {"WorkDocumentsRequired", new List<string>() { "TotalCost" }},
                {"ObjectTEIndicator", new List<string>() { "Value", "AverageCostPerUnit", "CostPerUnit", "Cost", "AverageCost" }},
                {"Reason", new List<string>() { "TotalCostPSP" }},
            };

        public static ActionResult ExportToXls(string metaViewName, DataTable dt)
        {
            var settings = GridExportHelper.GetGridViewSettings(metaViewName, dt);

            return GridViewExtension.ExportToXls(settings, dt);
        }

        public static ActionResult ExportToXlsx(string metaViewName, DataTable dt)
        {
            var settings = GridExportHelper.GetGridViewSettings(metaViewName, dt);

            return GridViewExtension.ExportToXlsx(settings, dt);
        }

        private static GridViewSettings GetGridViewSettings(string name, DataTable dt)
        {
            var s = new GridViewSettings { Name = name };

            foreach (DataColumn col in dt.Columns)
            {
                s.Columns.Add(col.ColumnName, col.Caption);
            }

            s.SettingsExport.RenderBrick = (sender, e) =>
            {
                if (e.RowType == GridViewRowType.Data && e.VisibleIndex % 2 == 0)
                    e.BrickStyle.BackColor = System.Drawing.Color.FromArgb(0xEE, 0xEE, 0xEE);


                var col = e.Column as GridViewDataColumn;

                if (IsDecimalValueColumn(name, col.FieldName))
                {
                    if (e.Value != null && e.Value.GetType() != typeof(DBNull))
                    {
                        e.TextValue = Convert.ToDecimal(e.Value);
                        e.TextValueFormatString = "#,###.00";
                    }
                }
            };
            return s;
        }


        private static bool IsDecimalValueColumn(string objectName, string columnName)
        {
            if (!columnsToFormatting.ContainsKey(objectName))
                return false;

            foreach (string decimalColumnName in columnsToFormatting[objectName])
                if (decimalColumnName == columnName)
                    return true;

            return false;
        }

    }
}