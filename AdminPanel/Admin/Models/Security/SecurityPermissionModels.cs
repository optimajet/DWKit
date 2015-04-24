using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class SecurityPermissionModel
    {
        public SecurityPermissionModel()
        {
            IsSystem = false;
        }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Code", ResourceType = typeof(Resources.Resource))]
        public string Code { get; set; }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "System", ResourceType = typeof(Resources.Resource))]
        public bool IsSystem { get; set; }

        public Guid GroupId { get; set; }
        public Guid Id { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityPermission, SecurityPermissionModel>();
            Mapper.CreateMap<SecurityPermissionModel, SecurityPermission>().ForMember("Id", f => f.Ignore());
        }
    }

    public class SecurityPermissionGroupModel
    {
        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Code", ResourceType = typeof(Resources.Resource))]
        public string Code { get; set; }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        public Guid Id { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityPermissionGroup, SecurityPermissionGroupModel>();
            Mapper.CreateMap<SecurityPermissionGroupModel, SecurityPermissionGroup>().ForMember("Id", f => f.Ignore());
        }
    }
}