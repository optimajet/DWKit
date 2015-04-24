using System;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace Admin.Models
{
    public class ExternalMethodModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Name",ResourceType=typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Assembly", ResourceType = typeof(Resources.Resource))]
        public string AssemblyName { get; set; }

        [Required]
        [Display(Name = "Class", ResourceType = typeof(Resources.Resource))]
        public string ClassName { get; set; }

        [Required]
        [Display(Name = "Method", ResourceType = typeof(Resources.Resource))]
        public string MethodName { get; set; }

        [Display(Name = "ReturnType", ResourceType = typeof(Resources.Resource))]
        public string ReturnType { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public string Type { get; set; }

        [AllowHtml]
        [DataType(DataType.Text)]
        [Display(Name = "Namespace", ResourceType = typeof(Resources.Resource))]
        public string UsingText { get; set; }

        [AllowHtml]
        [DataType(DataType.Text)]
        [Display(Name = "SourceCode", ResourceType = typeof(Resources.Resource))]
        public string CodeText { get; set; }
    }

    public class ExternalMethodParamsModel
    {
        public Guid Id { get; set; }
        public Guid ExternalMethodId { get; set; }
        
        [Required]
        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public string Type { get; set; }
    }
}