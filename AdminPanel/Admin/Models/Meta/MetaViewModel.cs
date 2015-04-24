using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaViewModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(50)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Caption", ResourceType = typeof(Resources.Resource))]
        public string Caption { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Description", ResourceType = typeof(Resources.Resource))]
        public string Comment { get; set; }

        [Display(Name = "Model", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetadataEntity")]
        public Guid MasterEntityId { get; set; }

        [Display(Name = "Model", ResourceType = typeof(Resources.Resource))]
        public string MasterEntityCaption { get; set; }

        [Display(Name = "DefaultSort", ResourceType = typeof(Resources.Resource))]
        public string DefaultSort { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaView, MetaViewModel>();
            Mapper.CreateMap<MetaViewModel, MetaView>().ForMember("Id", f => f.Ignore());
        }
    }

    public class MetaViewColumnModel
    {
        private string _customEditor;
        private string _customFormat;
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }

        public Guid MetaViewId { get; set; }
        public Guid AttributeId { get; set; }
        public Guid AttributeEntityId { get; set; }
        public byte AttributeTypeId { get; set; }
        public byte AttributePurpose { get; set; }

        internal bool NeedSave { get; set; }

        [Display(Name = "Column", ResourceType = typeof(Resources.Resource))]
        public string AttributeCaption { get; set; }



        [Display(Name = "Show", ResourceType = typeof(Resources.Resource))]
        public bool AllowShow { get; set; }

        [Display(Name = "Edit", ResourceType = typeof(Resources.Resource))]
        public bool AllowEdit { get; set; }

        [Display(Name = "ImportExport", ResourceType = typeof(Resources.Resource))]
        public bool AlowImportExport { get; set; }

        [Display(Name = "Compare", ResourceType = typeof(Resources.Resource))]
        public bool AllowCompare { get; set; }

        [Display(Name = "SortOrder", ResourceType = typeof(Resources.Resource))]
        public int? SortOrder { get; set; }

        [Display(Name = "Width", ResourceType = typeof(Resources.Resource))]
        public string Width { get; set; }

        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "CustomCaption", ResourceType = typeof(Resources.Resource))]
        public string CustomCaption { get; set; }

        [Display(Name = "ViewForSelect", ResourceType = typeof(Resources.Resource))]
        public Guid? MetaViewForSelectId { get; set; }

        [StringLength(256)]
        [Display(Name = "FormatString", ResourceType = typeof(Resources.Resource))]
        public string CustomFormat
        {
            get { return _customFormat ?? string.Empty; }
            set { _customFormat = value; }
        }

        [StringLength(256)]
        [Display(Name = "ControlEdit", ResourceType = typeof(Resources.Resource))]
        public string CustomEditor
        {
            get { return _customEditor ?? string.Empty; }
            set { _customEditor = value; }
        }


        public bool IsGroup
        {
            get { return AttributeTypeId != 0; }
        }
        public static void CreateMap()
        {
            Mapper.CreateMap<MetaViewColumn, MetaViewColumnModel>();
            Mapper.CreateMap<MetaViewColumnModel, MetaViewColumn>().ForMember("Id", f => f.Ignore());
        }
    }

    public class MetaViewExternalMethodModel
    {
        public Guid Id { get; set; }
        public Guid MetaViewId { get; set; }
        [Display(Name = "View", ResourceType = typeof(Resources.Resource))]
        public string MetaViewCaption { get; set; }

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
        [UIHint("MetaViewExternalMethodType")]
        public byte TypeId { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Params { get; set; }
        
        public static void CreateMap()
        {
            Mapper.CreateMap<MetaViewExternalMethod, MetaViewExternalMethodModel>();
            
            Mapper.CreateMap<MetaViewExternalMethodModel, MetaViewExternalMethod>().ForMember("Id", f => f.Ignore());
        }
    }


}