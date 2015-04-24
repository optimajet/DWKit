using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaMenuModel
    {
        public MetaMenuModel()
        {
            IsShow = true;
        }

        public Guid Id { get; set; }

        [Display(Name = "Parent", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetaMenu")]
        public Guid? ParentId { get; set; }

        [Display(Name = "Parent", ResourceType = typeof(Resources.Resource))]
        public string ParentName { get; set; }

        [Required]
        [StringLength(50)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Caption", ResourceType = typeof(Resources.Resource))]
        public string Caption { get; set; }

        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "ImageUrl", ResourceType = typeof(Resources.Resource))]
        public string ImageUrl { get; set; }

        [Display(Name = "SortOrder", ResourceType = typeof(Resources.Resource))]
        public int SortOrder { get; set; }

        [Display(Name = "Form", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetaForm")]
        public Guid? FormId { get; set; }

        [Display(Name = "Form", ResourceType = typeof(Resources.Resource))]
        public string FormName { get; set; }

        [Display(Name = "URL", ResourceType = typeof(Resources.Resource))]
        public string Url { get; set; }

        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string AddParams { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public int TypeId { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public string TypeName { get; set; }

        [Display(Name = "Show", ResourceType = typeof(Resources.Resource))]
        public bool IsShow { get; set; }

        [Display(Name = "OpenInNewWindow", ResourceType = typeof(Resources.Resource))]
        public bool OpenInNewWindow { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaForm, MetaFormModel>();
            Mapper.CreateMap<MetaMenu, MetaMenuModel>();

            Mapper.CreateMap<MetaFormModel, MetaForm>();
            Mapper.CreateMap<MetaMenuModel, MetaMenu>()
                .ForMember("Type", f => f.Ignore())
                .ForMember("Parent", f => f.Ignore())
                .ForMember("Id", f => f.Ignore());
        }
    }
}