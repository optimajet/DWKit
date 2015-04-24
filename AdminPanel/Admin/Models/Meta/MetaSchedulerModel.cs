using System;
using System.ComponentModel.DataAnnotations;
using Admin.DAL;
using AutoMapper;

namespace Admin.Models
{
    public class MetaSchedulerModel
    {
        public MetaSchedulerModel()
        {
            IsActive = true;
            StartTime2 = new TimeSpan(5, 3, 0);
        }

        public Guid Id { get; set; }
       
        [Required]
        [StringLength(256)]
        [DataType(DataType.Text)]
        [Display(Name = "Name", ResourceType = typeof(Resources.Resource))]
        public string Name { get; set; }

        [Display(Name = "Type", ResourceType = typeof(Resources.Resource))]
        public byte TypeId { get; set; }

        [Display(Name = "Period", ResourceType = typeof(Resources.Resource))]
        public byte? PeriodId { get; set; }
        
        [DataType(DataType.Time)]
        [Display(Name = "StartTime", ResourceType = typeof(Resources.Resource))]
        public TimeSpan? StartTime2
        {
            get
            {
                if (StartTime.HasValue)
                    return new TimeSpan(StartTime.Value.Hour, StartTime.Value.Minute, StartTime.Value.Second);
                else
                    return null;
            }
            set
            {
                if (value.HasValue)
                {
                    StartTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, value.Value.Hours, value.Value.Minutes, value.Value.Seconds);
                }
                else
                {
                    StartTime = null;
                }
            }
        }

        [Display(Name = "StartTime", ResourceType = typeof(Resources.Resource))]
        public DateTime? StartTime { get; set; }

        [Display(Name = "IntervalSecond", ResourceType = typeof(Resources.Resource))]
        public int? IntervalSecond { get; set; }

        [Display(Name = "NumberInPeriod", ResourceType = typeof(Resources.Resource))]
        public int? NumberInPeriod { get; set; }        

        [Required]
        [Display(Name = "Function", ResourceType = typeof(Resources.Resource))]
        [UIHint("ExternalMethod")]
        public Guid? ExternalMethodId { get; set; }

        [Required]
        [Display(Name = "User", ResourceType = typeof(Resources.Resource))]
        [UIHint("SecurityUserId")]
        public Guid? SecurityUserId { get; set; }

        [Display(Name = "Parameters", ResourceType = typeof(Resources.Resource))]
        public string Parameters { get; set; }

        [Display(Name = "Active", ResourceType = typeof(Resources.Resource))]
        public bool IsActive { get; set; }

        public static void CreateMap()
        {
            Mapper.CreateMap<MetaScheduler, MetaSchedulerModel>();

            Mapper.CreateMap<MetaFormModel, MetaForm>();
            Mapper.CreateMap<MetaSchedulerModel, MetaScheduler>().ForMember("Id", f => f.Ignore());
        }
    }
}