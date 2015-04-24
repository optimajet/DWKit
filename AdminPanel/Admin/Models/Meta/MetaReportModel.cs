using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaReportModel
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(1024)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Необходимость формирования", ResourceType = typeof(Resources.Resource))]
        public bool NeedFormed { get; set; }

        [Display(Name = "Запрос на формирование отчёта", ResourceType = typeof(Resources.Resource))]
        public string QueryFormedReport { get; set; }

        [Display(Name = "Запрос данных", ResourceType = typeof(Resources.Resource))]
        public string QuerySelect { get; set; }

        [Display(Name = "Отчёт в процессе формирования", ResourceType = typeof(Resources.Resource))]
        public string IsProcessStarting { get; set; }

        [Display(Name = "Дата последнего обновления", ResourceType = typeof(Resources.Resource))]
        public DateTime? LastDateUpdate { get; set; }

        [Display(Name = "Очищать данные после формирования нового отчёта", ResourceType = typeof(Resources.Resource))]
        public string IsCleanPrevResult { get; set; }

        [Display(Name = "Пользователь, сформировавший отчёт", ResourceType = typeof(Resources.Resource))]
        public string LastUserName { get; set; }

        [Display(Name = "Тип отчета", ResourceType = typeof(Resources.Resource))]
        public byte TypeId { get; set; }

        [Display(Name = "Время формирования отчёта", ResourceType = typeof(Resources.Resource))]
        public int TimeFormed { get; set; }

        [Display(Name = "Таблица с результатом", ResourceType = typeof(Resources.Resource))]
        public string Source { get; set; }

        public bool IsDeleted { get; set; }

        internal static void CreateMap()
        {
            Mapper.CreateMap<MetaReport, MetaReportModel>();
            Mapper.CreateMap<MetaReportModel, MetaReport>().ForMember("Id", f => f.Ignore());
        }
    }
}