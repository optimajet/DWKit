using OptimaJet.Meta.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Web;

namespace Admin.Helpers
{
    public class Scheduler
    {
        private static volatile Scheduler _scheduler;
        private static readonly object _sync = new object();

        #region Start Stop Restart

        public static void Restart()
        {
            lock (_sync)
            {
                if (_scheduler == null)
                {
                    _scheduler = new Scheduler();
                }

                _scheduler.TimerRestart();
            }
        }

        public static void Start()
        {
            if (_scheduler == null)
            {
                lock (_sync)
                {
                    if (_scheduler == null)
                    {
                        _scheduler = new Scheduler();
                        _scheduler.TimerRestart();
                    }
                }
            }
        }

        public static void Stop()
        {
            if (_scheduler != null)
            {
                lock (_sync)
                {
                    if (_scheduler != null)
                    {
                        _scheduler.TimerStop();
                    }
                }
            }
        }

        #endregion

        protected DateTime PrevDataTime;
        protected Timer _localTimer;
        
        public void TimerStop()
        {
            if (_localTimer != null)
                _localTimer.Stop();
        }

        public void TimerRestart()
        {
            var span =  60000;

            if (_localTimer == null)
            {
                _localTimer = new Timer(span);
                _localTimer.AutoReset = false;
                _localTimer.Elapsed += _localTimer_Elapsed;
                PrevDataTime = DateTime.Now;
                _localTimer.Start();
            }
            else
            {
                _localTimer.Interval = span;
                PrevDataTime = DateTime.Now;
                _localTimer.Start();
            }
        }

        void _localTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            DateTime prevDate = PrevDataTime;
            DateTime nowDate = PrevDataTime = DateTime.Now;

            MetaSchedulerHelper.OnTimer(nowDate, prevDate);

            ((Timer)sender).Start();
        }
    }
}