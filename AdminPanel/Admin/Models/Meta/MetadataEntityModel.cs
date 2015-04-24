using System;
using System.ComponentModel.DataAnnotations;

namespace Admin.Models
{
    public class MetadataEntityModel
    {
        public MetadataEntityModel()
        {
            IsSupportsOptimisticLock = true;
        }

        public Guid Id { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType=typeof(Resources.Resource))]
        public string Caption { get; set; }

        [Display(Name = "System", ResourceType = typeof(Resources.Resource))]
        public bool IsSystem { get; set; }

        [Required]
        [StringLength(40)]
        [DataType(DataType.Text)]
        [Display(Name = "TableName", ResourceType = typeof(Resources.Resource))]
        public string TableName { get; set; }

        [Required]
        [StringLength(30)]
        [DataType(DataType.Text)]
        [Display(Name = "Scheme", ResourceType = typeof(Resources.Resource))]
        public string SchemaName { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Comment", ResourceType = typeof(Resources.Resource))]
        public string Comment { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }

        [Display(Name = "SupportOptimisticLock", ResourceType = typeof(Resources.Resource))]
        public bool IsSupportsOptimisticLock { get; set; }

        [Display(Name = "View", ResourceType = typeof(Resources.Resource))]
        public bool IsView { get; set; }

        [Display(Name = "VersioningType", ResourceType = typeof(Resources.Resource))]
        public byte VersioningType { get; set; }

        [Display(Name = "AvailableForImportExport", ResourceType = typeof(Resources.Resource))]
        public bool IsAvailableForImportExport { get; set; }
    }
}