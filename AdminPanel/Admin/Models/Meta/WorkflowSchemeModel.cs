using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class WorkflowSchemeModel
    {
        [Required]
        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Code", ResourceType = typeof(Resources.Resource))]
        public string Code { get; set; }

        public bool IsNew { get;set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<WorkflowScheme, WorkflowSchemeModel>();
            Mapper.CreateMap<WorkflowSchemeModel, WorkflowScheme>();//.ForMember("Id", f => f.Ignore());
        }
    }
}