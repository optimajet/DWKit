namespace OptimaJet.BJet.Calculation
{
    public interface ILocker<in T1, in T2>
    {
        bool TryLock(T1 itemId, T2 processId);

        bool Unlock(T1 itemid);

        bool Unlock(T1 itemid, T2 processId);

   }
}
