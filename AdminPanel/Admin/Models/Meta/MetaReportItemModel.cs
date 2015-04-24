using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaReportItemModel
    {
        public Guid Id { get; set; }
        public Guid MetaReportId { get; set; }

        [Display(Name = "Caption", ResourceType = typeof(Resources.Resource))]
        [StringLength(256)]
        [DataType(DataType.Text)]
        public string Caption { get; set; }

        [Display(Name = "Column", ResourceType = typeof(Resources.Resource))]
        [StringLength(256)]
        [DataType(DataType.Text)]
        public string ColumnName { get; set; }

        [Display(Name = "Show", ResourceType = typeof(Resources.Resource))]
        public bool IsVisible { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public byte Type { get; set; }

        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Parametrs { get; set; }

        [Display(Name = "SQLExpression", ResourceType = typeof(Resources.Resource))]
        public string ColumnExpression { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaReportItem, MetaReportItemModel>();
            Mapper.CreateMap<MetaReportItemModel, MetaReportItem>().ForMember("Id", f => f.Ignore());
        }
    }
}
