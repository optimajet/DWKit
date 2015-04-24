using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaListModel
    {
        public Guid Id { get; set; }
        [Required]
        [StringLength(50)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [DataType(DataType.Text)]
        [Display(Name = "List", ResourceType = typeof(Resources.Resource))]
        public string List { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<MetaList, MetaListModel>();
            Mapper.CreateMap<MetaListModel, MetaList>().ForMember("Id", c => c.Ignore());
        }
    }
}