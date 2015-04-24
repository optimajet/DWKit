using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class LocalizationModel
    {
        public Guid Id { get; set; }

        public LocalizationModel()
        {           
        }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Key", ResourceType=typeof(Resources.Resource))]
        public string Key { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Value", ResourceType = typeof(Resources.Resource))]
        public string Value { get; set; }
    }

    public class LocalizationItemModel
    {
        public Guid Id { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Language", ResourceType = typeof(Resources.Resource))]
        public string Lang { get; set; }

        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Value", ResourceType=typeof(Resources.Resource))]
        public string Value { get; set; }

    }
}