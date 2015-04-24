using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.WebPages;

public static class WebPageHelpers
{
    public static void PropagateSection(this WebPageBase page, string sectionName)
    {
        if (page.IsSectionDefined(sectionName))
        {
            page.DefineSection(sectionName, delegate { page.Write(page.RenderSection(sectionName)); });
        }
    }

    public static void PropagateSections(this WebPageBase page, params string[] sections)
    {
        foreach (string s in sections)
            PropagateSection(page, s);
    }
}

public static class HtmlHelperExtensions
{
    public static MvcHtmlString LabelFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper,
                                                            Expression<Func<TModel, TProperty>> ex,
                                                            Func<object, HelperResult> template)
    {
        string memberName = ExpressionHelper.GetExpressionText(ex);
        ModelMetadata metadata = ModelMetadata.FromLambdaExpression(ex, new ViewDataDictionary<TModel>());

        var label = new TagBuilder("label");
        label.Attributes["for"] =
            TagBuilder.CreateSanitizedId(htmlHelper.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(memberName));
        label.InnerHtml = string.Format(
            "{0} {1}",
            (metadata.DisplayName ?? metadata.PropertyName ?? memberName),
            template(null).ToHtmlString()
            );
        return MvcHtmlString.Create(label.ToString());
    }
}

namespace Admin.Controls
{
    public enum Layoutt
    {
        Table = 0,
        Flow = 1
    }

    public enum Direction
    {
        Horizontal = 0,
        Vertical = 1
    }

    public enum RepeatColumns
    {
        OneColumn = 1,
        TwoColumns = 2,
        ThreeColumns = 3,
        FourColumns = 4,
        FiveColumns = 5
    }

    public class CheckBoxListSettings
    {
        public Direction cblDirection = Direction.Horizontal;
        public Layoutt cblLayout = Layoutt.Table;
        public string cblName = "SelectedCheckBoxListItems";
        public RepeatColumns cblRepeatColumns = RepeatColumns.FiveColumns;
        public bool Disabled { get; set; }
    }

    public class CheckBoxListItem
    {
        public bool Check;
        public object Id;
        public string Name;
    }

    public static class Controls
    {
        public static MvcHtmlString CheckBoxList(this HtmlHelper helper, IList<CheckBoxListItem> items,
                                                 CheckBoxListSettings settings, object htmlAttributes)
        {
            var stringBuilder = new StringBuilder();

            TagBuilder HtmlBody = GenerateHtmlMarkupOuterTag(settings.cblLayout,
                                                             new RouteValueDictionary(htmlAttributes));

            int iMod = items.Count%(int) settings.cblRepeatColumns;
            int iterationsCount = items.Count/(int) settings.cblRepeatColumns + (iMod == 0 ? 0 : 1);
            for (int i = 0; i < iterationsCount; i++)
            {
                stringBuilder.Append(GenerateHtmlBeginRow(settings.cblLayout));
                foreach (CheckBoxListItem item in items.Where((item, index) =>
                                                              settings.cblDirection == Direction.Horizontal
                                                                  ? index/(int) settings.cblRepeatColumns == i
                                                                  : (index - i)%iterationsCount == 0))
                {
                    stringBuilder.AppendFormat("{0}{1}{2}{3} ",
                                               GenerateHtmlMarkupCheckBox(item, settings),
                                               GenerateHtmlMiddleRow(settings.cblLayout),
                                               GenerateHtmlMarkupLabel(item, string.Format("{0}_{1}", settings.cblName, item.Id)),
                                               GenerateHtmlMiddleRow(settings.cblLayout));
                }
                stringBuilder.Append(GenerateHtmlEndRow(settings.cblLayout));
            }

            HtmlBody.InnerHtml = stringBuilder.ToString();
            return new MvcHtmlString(HtmlBody.ToString(TagRenderMode.Normal));
        }

        public static string GenerateHtmlBeginRow(Layoutt cblLayout)
        {
            switch (cblLayout)
            {
                case Layoutt.Table:
                    return "<tr><td>";
                case Layoutt.Flow:
                    return "";
                default:
                    return "";
            }
        }

        public static string GenerateHtmlMiddleRow(Layoutt cblLayout)
        {
            switch (cblLayout)
            {
                case Layoutt.Table:
                    return "</td><td>";
                case Layoutt.Flow:
                    return "";
                default:
                    return "";
            }
        }

        public static string GenerateHtmlEndRow(Layoutt cblLayout)
        {
            switch (cblLayout)
            {
                case Layoutt.Table:
                    return "</td></tr>";
                case Layoutt.Flow:
                    return "<br>";
                default:
                    return "";
            }
        }

        public static TagBuilder GenerateHtmlMarkupOuterTag(Layoutt cblLayout,
                                                            IDictionary<string, object> htmlAttributes)
        {
            string htmlTag = string.Empty;
            switch (cblLayout)
            {
                case Layoutt.Flow:
                    htmlTag = "div";
                    break;
                case Layoutt.Table:
                    htmlTag = "table";
                    break;
            }

            var tagBuilder = new TagBuilder(htmlTag);
            tagBuilder.MergeAttributes(htmlAttributes);
            return tagBuilder;
        }

        public static string GenerateHtmlMarkupCheckBox(CheckBoxListItem item, CheckBoxListSettings settings)
        {
            var tagBuilder = new TagBuilder("input");

            tagBuilder.MergeAttribute("id", string.Format("{0}_{1}", settings.cblName, item.Id));
            tagBuilder.MergeAttribute("type", "checkbox");
            tagBuilder.MergeAttribute("name", settings.cblName);
            tagBuilder.MergeAttribute("value", item.Id.ToString());
            if (item.Check)
            {
                tagBuilder.MergeAttribute("checked", "checked");
            }

            if (settings.Disabled)
            {
                tagBuilder.MergeAttribute("disabled", "disabled");
            }

            return tagBuilder.ToString(TagRenderMode.SelfClosing);
        }

        public static string GenerateHtmlMarkupLabel(CheckBoxListItem item, string forControl)
        {
            var tagBuilder = new TagBuilder("label");

            tagBuilder.SetInnerText(item.Name);
            tagBuilder.Attributes["for"] = forControl;

            return tagBuilder.ToString(TagRenderMode.Normal);
        }
    }
}