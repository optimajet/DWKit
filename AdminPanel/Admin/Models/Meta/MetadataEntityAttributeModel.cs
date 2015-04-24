using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;
using OptimaJet.Meta.Objects;
using System.Collections.Generic;

namespace Admin.Models
{
    public class MetadataEntityAttributeModel
    {
     
        public MetadataEntityAttributeModel()
        {
        }

        public Guid EntityId { get; set; }

        [Display(Name = "Object", ResourceType=typeof(Resources.Resource))]
        public string EntityCaption { get; set; }

        public Guid Id { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Caption { get; set; }

        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "AlterName", ResourceType = typeof(Resources.Resource))]
        public string CustomCaption { get; set; }

        [Required]
        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public byte TypeId { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public string AttributeTypeName
        {
            get
            {
                if (TypeId == (byte)AttributeType.Value)
                    return Resources.Resource.Column;
                return Resources.Resource.Link;
            }
        }

        [Display(Name = "System", ResourceType = typeof(Resources.Resource))]
        public bool IsSystem { get; set; }

        [Display(Name = "Virtual", ResourceType = typeof(Resources.Resource))]
        public bool IsVirtual { get; set; }


        [Display(Name = "Calculate", ResourceType = typeof(Resources.Resource))]
        public bool IsCalculated { get; set; }


        [DataType(DataType.Text)]
        [Display(Name = "Description", ResourceType = typeof(Resources.Resource))]
        public string Comment { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }


        [Display(Name = "Purpose", ResourceType = typeof(Resources.Resource))]
        public byte Purpose { get; set; }


        [Display(Name = "List", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetaList")]
        public Guid? ListId { get; set; }

        [Required]
        [Display(Name = "ColumnName", ResourceType = typeof(Resources.Resource))]
        public string ColumnName { get; set; }

        [Display(Name = "ColumnType", ResourceType = typeof(Resources.Resource))]
        public string Type { get; set; }

        [Display(Name = "Nullable")]
        public bool IsNullable { get; set; }

        [Display(Name = "DefaultValue", ResourceType = typeof(Resources.Resource))]
        public string DefaultValue { get; set; }

        [Display(Name = "CreateConstraint", ResourceType = typeof(Resources.Resource))]
        public bool IsCreateConstraint { get; set; }

        [Display(Name = "UpdateCascade", ResourceType = typeof(Resources.Resource))]
        public bool IsUpdateCascade { get; set; }

        [Display(Name = "DeleteCascade", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleteCascade { get; set; }

 
        [Display(Name = "Object", ResourceType = typeof(Resources.Resource))]
        [UIHint("MetadataEntity")]
        public Guid? ReferencedEntityId { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetadataEntityAttribute, MetadataEntityAttributeModel>();
            
            Mapper.CreateMap<MetadataEntityAttributeModel, MetadataEntityAttribute>();

        }

        public static List<MetaAttributePurpose> GetAttributePurpose()
        {
            return new List<MetaAttributePurpose>
                {
                    new MetaAttributePurpose {Name = Resources.Resource.Normal, Id = 0},
                    new MetaAttributePurpose {Name = Resources.Resource.PrimaryKey, Id = 1},
                    new MetaAttributePurpose {Name = Resources.Resource.VersioningField, Id = 2},
                    new MetaAttributePurpose {Name = Resources.Resource.ParentRef, Id = 3},
                    new MetaAttributePurpose {Name = Resources.Resource.FileDownload, Id = 4},
                    new MetaAttributePurpose {Name = Resources.Resource.TokenFile, Id = 5},
                    new MetaAttributePurpose {Name = Resources.Resource.IdVersionEntity, Id = 6},
                    new MetaAttributePurpose {Name = Resources.Resource.IdBaseVersionEntity, Id = 7},
                    new MetaAttributePurpose {Name = Resources.Resource.VersionFrom, Id = 8},
                    new MetaAttributePurpose {Name = Resources.Resource.VersionTo, Id = 9},
                    new MetaAttributePurpose {Name = Resources.Resource.LogicalDeleted, Id = 10}
                };
        }
    }
}