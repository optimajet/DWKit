using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class SecurityUserModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType=typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Email", ResourceType = typeof(Resources.Resource))]
        public string Email { get; set; }

        [Display(Name = "ExternalId", ResourceType = typeof(Resources.Resource))]
        public string ExternalId { get; set; }

        [Display(Name = "Timezone", ResourceType = typeof(Resources.Resource))]
        public string Timezone { get; set; }

        [Display(Name = "Language", ResourceType = typeof(Resources.Resource))]
        public string Localization { get; set; }

        [Display(Name = "Locked", ResourceType = typeof(Resources.Resource))]
        public bool IsLocked { get; set; }

        [Display(Name = "Roles", ResourceType = typeof(Resources.Resource))]
        [UIHint("ClientEditSecurityRole")]
        public List<Guid> Roles { get; set; }

        [Display(Name = "Groups", ResourceType = typeof(Resources.Resource))]
        [UIHint("ClientEditSecurityGroup")]
        public List<Guid> Groups { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityUser, SecurityUserModel>()
                .ForMember("Roles", f => f.MapFrom(a => a.SecurityRole.Select(c => c.Id).ToList()))
                .ForMember("Groups", f => f.MapFrom(a => a.SecurityGroup.Select(c => c.Id).ToList()));
            Mapper.CreateMap<SecurityRole, SecurityRoleModel>();
            Mapper.CreateMap<SecurityGroup, SecurityGroupModel>();

            Mapper.CreateMap<SecurityUserModel, SecurityUser>().ForMember("Id", c => c.Ignore())
                .ForMember("SecurityGroup", c => c.Ignore())
                .ForMember("SecurityRole", c => c.Ignore());
            Mapper.CreateMap<SecurityRoleModel, SecurityRole>();
            Mapper.CreateMap<SecurityGroupModel, SecurityGroup>();
        }
    }

    public class SecurityCredentialModel
    {
        public Guid Id { get; set; }
        public Guid SecurityUserId { get; set; }

        [Display(Name = "Password", ResourceType = typeof(Resources.Resource))]
        public string Password { get; set; }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Login", ResourceType = typeof(Resources.Resource))]
        public string Login { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public byte AuthenticationType { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityCredential, SecurityCredentialModel>();
            Mapper.CreateMap<SecurityCredentialModel, SecurityCredential>();
        }
    }
}