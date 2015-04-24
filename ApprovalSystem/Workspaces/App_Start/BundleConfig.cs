using System.Web.Optimization;

public class BundleConfig
{
    public static void RegisterBundles(BundleCollection bundles)
    {
        bundles.Add(new ScriptBundle("~/bundles/jquery.js")
            .Include("~/Scripts/jquery-{version}.js"));

        bundles.Add(new ScriptBundle("~/bundles/jquery-ui.js")
            .Include("~/Scripts/jquery-ui-{version}.js"));
        bundles.Add(new StyleBundle("~/bundles/jquery-ui.css")
            .Include("~/Content/themes/base/jquery.ui.all.css"));

        bundles.Add(new ScriptBundle("~/bundles/modernizr.js")
            .Include("~/Scripts/modernizr-*"));

        bundles.Add(new ScriptBundle("~/Scripts/ExtJS/include-ext")
            .Include("~/Scripts/ExtJS/include-ext.js"));

        bundles.Add(new ScriptBundle("~/bundles/optimajet-utils")
            .Include("~/Scripts/optimajet-utils.js"));

        bundles.Add(new ScriptBundle("~/bundles/linq")
            .Include("~/Scripts/linq.min.js"));

        bundles.Add(new ScriptBundle("~/bundles/moment")
            .Include("~/Scripts/moment-with-locales.min.js"));

        bundles.Add(new ScriptBundle("~/bundles/mzPivotGrid")
            .Include("~/Scripts/mzPivotGrid/mzPivotGrid/mzPivotGrid-all.js")
            .IncludeDirectory("~/Scripts/MetaReport/", "*.js", true));

        bundles.Add(new StyleBundle("~/Content/mzPivotGrid")
            .Include(
                "~/Scripts/mzPivotGrid/mzPivotGrid/mzPivotGrid.css",
                "~/Content/Assets/css/metareport.css"));

		bundles.Add(new ScriptBundle("~/bundles/MetaReport-ru")
			.Include(
				"~/Scripts/mzPivotGrid/mzPivotGrid/locale/mz-locale-ru.js",
				"~/Scripts/locale/report-lang-ru.js"));

		bundles.Add(new ScriptBundle("~/bundles/MetaReport-en")
			.Include(
				"~/Scripts/mzPivotGrid/mzPivotGrid/locale/mz-locale-en.js",
				"~/Scripts/locale/report-lang-en.js"));


        bundles.Add(new StyleBundle("~/bundles/styles")
            .Include("~/Content/base.css")
            .Include("~/Content/layout.css")
            .Include("~/Content/typography.css")
            .Include("~/Content/style12.css"));
        //.Include("~/Content/Workspace.css")
        //.Include("~/Content/MainMenu.css")
        //.Include("~/Content/Sidebar.css")
        //.Include("~/Content/Grid.css")
        //.Include("~/Content/Form.css"));

        //BundleTable.EnableOptimizations = true;
    }
}