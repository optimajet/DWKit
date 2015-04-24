using System;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaFormModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType=typeof(Resources.Resource))]
        public string Name { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Caption", ResourceType = typeof(Resources.Resource))]
        public string Caption { get; set; }

        [AllowHtml]
        [DataType(DataType.Text)]
        [Display(Name = "Source", ResourceType = typeof(Resources.Resource))]
        public string Source { get; set; }

        [Display(Name = "AvailableForSearch", ResourceType = typeof(Resources.Resource))]
        public bool IsAvailableForSearch { get; set; }

        [Display(Name = "AvailableForImportExport", ResourceType = typeof(Resources.Resource))]
        public bool IsAvailableForImportExport { get; set; }

        [Display(Name = "SearchWeight", ResourceType = typeof(Resources.Resource))]
        public int? SearchWeight { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }

        [Display(Name = "Parent", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetaForm")]
        public Guid? ParentId { get; set; }

        [Display(Name = "Parent", ResourceType = typeof(Resources.Resource))]
        public string ParentName { get; set; }

        public bool ShowImportExportOptions { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<MetaForm, MetaFormModel>();
            Mapper.CreateMap<MetaFormModel, MetaForm>().ForMember("Id", f => f.Ignore());
        }
    }

    public class MetaFormBlockModel
    {
        public Guid Id { get; set; }
        public Guid MetaFormId { get; set; }

        [Display(Name = "Form", ResourceType = typeof(Resources.Resource))]
        public string MetaFormCaption { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Template", ResourceType = typeof(Resources.Resource))]
        [UIHint("FormBlockTemplate")]
        public Guid? TemplateId { get; set; }

        [Display(Name = "Template", ResourceType = typeof(Resources.Resource))]
        public string TemplateName { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "TemplateParams", ResourceType = typeof(Resources.Resource))]
        public string TemplateParams { get; set; }

        [AllowHtml]
        [DataType(DataType.Text)]
        [Display(Name = "Source", ResourceType = typeof(Resources.Resource))]
        public string Source { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }

        [Display(Name = "ExcludedFromImportExport", ResourceType = typeof(Resources.Resource))]
        public bool IsExcludedFromImportExport { get; set; }

        [Display(Name = "LazyLoad", ResourceType = typeof(Resources.Resource))]
        public bool IsLazyLoad { get; set; }

        [Display(Name = "Order", ResourceType = typeof(Resources.Resource))]
        public string Code { get; set; }

        [Display(Name = "Order", ResourceType = typeof(Resources.Resource))]
        public int Order { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaFormBlock, MetaFormBlockModel>();
            Mapper.CreateMap<MetaForm, MetaFormModel>();
            Mapper.CreateMap<MetaFormBlockTemplate, FormBlockTemplateModel>();

            Mapper.CreateMap<MetaFormBlockModel, MetaFormBlock>().ForMember("Id", f => f.Ignore());
            Mapper.CreateMap<MetaFormModel, MetaForm>();
            Mapper.CreateMap<FormBlockTemplateModel, MetaFormBlockTemplate>();
        }
    }

    public class MetaFormExternalMethodModel
    {
        public MetaFormExternalMethodModel(){
            TypeId = 10;

        }
        

        public Guid Id { get; set; }
        public Guid MetaFormId { get; set; }
        [Display(Name = "Form", ResourceType = typeof(Resources.Resource))]
        public string MetaFormCaption { get; set; }

        [Display(Name = "Order", ResourceType = typeof(Resources.Resource))]
        public int Order { get; set; }

        [Required]
        [Display(Name = "Function", ResourceType = typeof(Resources.Resource))]
        [UIHint("ExternalMethod")]
        public Guid? ExternalMethodId { get; set; }

        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string ExternalMethodName { get; set; }

        [Required]
        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetaFormExternalMethodType")]
        public byte TypeId { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Params { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaFormExternalMethod, MetaFormExternalMethodModel>();

            Mapper.CreateMap<MetaFormExternalMethodModel, MetaFormExternalMethod>().ForMember("Id", f => f.Ignore());
        }
    }
}