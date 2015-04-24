using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaAppSearchModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "AdapterAssembly", ResourceType = typeof(Resources.Resource))]
        public string AssemblyName { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "AdapterType", ResourceType = typeof(Resources.Resource))]
        public string TypeName { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "IndexStorageFolder", ResourceType = typeof(Resources.Resource))]
        public string AlterIndexPath { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Parameters { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "State", ResourceType = typeof(Resources.Resource))]
        public string Status { get; set; }

        [Display(Name = "Use", ResourceType = typeof(Resources.Resource))]
        public bool IsActive { get; set; }

        [Required]
        [Display(Name = "Priority", ResourceType = typeof(Resources.Resource))]
        public int Priority { get; set; }

        public MetaAppSearchModel()
        {
            Priority = 0;
            IsActive = true;
        }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaAppSearch, MetaAppSearchModel>();
            Mapper.CreateMap<MetaAppSearchModel, MetaAppSearch>().ForMember("Id", f => f.Ignore());
        }
    }
}