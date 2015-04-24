using System.Collections.Generic;
using System.Threading;

namespace OptimaJet.BJet.Calculation
{
    public class InMemoryLocker<T1, T2> : ILocker<T1,T2>
    {
        private readonly Dictionary<T1, T2> _locks = new Dictionary<T1, T2>();

        private ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();


        public bool TryLock(T1 itemId, T2 processId)
        {
            _lock.EnterUpgradeableReadLock();
            try
            {
                if (_locks.ContainsKey(itemId))
                {
                    if (!_locks[itemId].Equals(processId))
                        return false;
                    return true;
                }
                else
                {
                    _lock.EnterWriteLock();
                    try
                    {
                        if (!_locks.ContainsKey(itemId))
                        {
                            _locks.Add(itemId, processId);
                            return true;
                        }
                        else
                        {
                            return _locks[itemId].Equals(processId);
                        }
                    }
                    finally
                    {
                        _lock.ExitWriteLock();
                    }
                }
            }
            finally
            {
                _lock.ExitUpgradeableReadLock();
            }

        }

        public bool Unlock(T1 itemid)
        {
           _lock.EnterWriteLock();
            try
            {
                if (_locks.ContainsKey(itemid))
                {
                    _locks.Remove(itemid);
                    return true;
                }

                return false;

            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public bool Unlock(T1 itemid, T2 processId)
        {
            _lock.EnterWriteLock();
            try
            {
                if (_locks.ContainsKey(itemid))
                {
                    if (_locks[itemid].Equals(processId))
                    {
                        _locks.Remove(itemid);
                        return true;
                    }
                    return false;
                }

                return false;

            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }
    }
}
