using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class SecurityGroupModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(128)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType=typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Comment", ResourceType=typeof(Resources.Resource))]
        public string Comment { get; set; }

        [Display(Name = "SyncWithDomainGroup", ResourceType = typeof(Resources.Resource))]
        public bool IsSyncWithDomainGroup { get; set; }
               

        [Display(Name = "Roles", ResourceType = typeof(Resources.Resource))]
        [UIHint("ClientEditSecurityRole")]
        public List<Guid> Roles { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<SecurityGroup, SecurityGroupModel>()
                .ForMember("Roles", f => f.MapFrom(a => a.SecurityRole.Select(c => c.Id).ToList()));
            Mapper.CreateMap<SecurityGroupModel, SecurityGroup>().ForMember("Id", f => f.Ignore());
        }
    }
}