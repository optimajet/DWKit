using System;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Admin.Models
{
    public class FormBlockTemplateModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType=typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Comment", ResourceType = typeof(Resources.Resource))]
        public string Comment { get; set; }

        [AllowHtml]
        [Display(Name = "SourceCode", ResourceType = typeof(Resources.Resource))]
        public string Source { get; set; }

        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Params { get; set; }

        [Display(Name = "Deleted", ResourceType = typeof(Resources.Resource))]
        public bool IsDeleted { get; set; }
    }
}