import { useEffect, useRef, useCallback, useState } from 'react';
import { db, SyncTask } from '@/lib/db';
import { supabase } from '@/integrations/supabase/client';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export function useSyncManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(navigator.onLine ? 'online' : 'offline');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);

  // Count pending tasks in real-time
  const updatePendingCount = useCallback(async () => {
    const count = await db.syncQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .count();
    setPendingCount(count);
  }, []);

  // Process a single sync task
  const processTask = useCallback(async (task: SyncTask): Promise<boolean> => {
    try {
      await db.syncQueue.update(task.id!, { status: 'processing' });

      if (task.table === 'file_tracking_records') {
        if (task.action === 'insert') {
          const { id: _id, is_dirty, deleted_locally, ...payload } = task.payload;
          const { error } = await supabase
            .from('file_tracking_records' as any)
            .insert(payload);
          if (error) throw error;

        } else if (task.action === 'update') {
          const { id: _id, is_dirty, deleted_locally, ...payload } = task.payload;
          const { error } = await supabase
            .from('file_tracking_records' as any)
            .update(payload)
            .eq('receiving_number', task.record_id!);
          if (error) throw error;

        } else if (task.action === 'delete') {
          const { error } = await supabase
            .from('file_tracking_records' as any)
            .delete()
            .eq('receiving_number', task.record_id!);
          if (error) throw error;
        }
      }

      // On success, remove the task from the queue
      await db.syncQueue.delete(task.id!);

      // Clear the dirty flag on the local record
      if (task.action !== 'delete' && task.record_id) {
        await db.records
          .where('receiving_number')
          .equals(task.record_id)
          .modify({ is_dirty: false });
      }
      return true;
    } catch (err: any) {
      // Mark as failed with error message, increment retry count
      await db.syncQueue.update(task.id!, {
        status: 'failed',
        error_message: err?.message || 'Unknown sync error',
        retry_count: (task.retry_count || 0) + 1,
      });
      return false;
    }
  }, []);

  // Main sync loop: processes all pending tasks in order
  const runSync = useCallback(async () => {
    if (isSyncingRef.current || !navigator.onLine) return;
    isSyncingRef.current = true;

    const tasks = await db.syncQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .and(t => (t.retry_count || 0) < 5) // Max 5 retries
      .sortBy('id');

    if (tasks.length === 0) {
      isSyncingRef.current = false;
      return;
    }

    setSyncStatus('syncing');
    let allSuccess = true;

    for (const task of tasks) {
      const success = await processTask(task);
      if (!success) allSuccess = false;
    }

    await updatePendingCount();
    setSyncStatus(allSuccess ? 'online' : 'error');
    isSyncingRef.current = false;
  }, [processTask, updatePendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('online');
      runSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync every 30 seconds when online
    syncIntervalRef.current = setInterval(() => {
      if (navigator.onLine) runSync();
    }, 30_000);

    // Initial count
    updatePendingCount();

    // Initial sync if online
    if (navigator.onLine) runSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [runSync, updatePendingCount]);

  /**
   * Add a task to the sync queue.
   * Call this after every local DB write.
   */
  const enqueue = useCallback(async (task: Omit<SyncTask, 'id' | 'created_at' | 'status' | 'retry_count'>) => {
    await db.syncQueue.add({
      ...task,
      created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    });
    await updatePendingCount();
    // Try to sync immediately if online
    if (navigator.onLine) runSync();
  }, [runSync, updatePendingCount]);

  return { isOnline, pendingCount, syncStatus, enqueue, runSync };
}
