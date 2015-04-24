using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class SecurityRoleModel
    {
        public Guid Id { get; set; }

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

        [Display(Name = "Comment", ResourceType = typeof(Resources.Resource))]
        public string Comment { get; set; }

        [Display(Name = "DomainGroup", ResourceType = typeof(Resources.Resource))]
        public string DomainGroup { get; set; }

        [Display(Name = "Groups", ResourceType = typeof(Resources.Resource))]
        [UIHint("ClientEditSecurityGroup")]
        public List<Guid> Groups { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityRole, SecurityRoleModel>()
                .ForMember("Groups", f => f.MapFrom(a => a.SecurityGroup.Select(c => c.Id).ToList()));
            ;
            Mapper.CreateMap<SecurityRoleModel, SecurityRole>().ForMember("Id", f => f.Ignore());
        }
    }

    public class SecurityRoleToSecurityPermissionModel
    {
        public Guid SecurityPermissionId { get; set; }
        public Guid SecurityRoleId { get; set; }

        [Display(Name = "AccessType", ResourceType = typeof(Resources.Resource))]
        public byte AccessType { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Permission", ResourceType = typeof(Resources.Resource))]
        public string SecurityPermissionName { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "Group", ResourceType = typeof(Resources.Resource))]
        public string SecurityPermissionGroupName { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityRoleToSecurityPermission, SecurityRoleToSecurityPermissionModel>();
            Mapper.CreateMap<SecurityRoleToSecurityPermissionModel, SecurityRoleToSecurityPermission>();
        }
    }
}