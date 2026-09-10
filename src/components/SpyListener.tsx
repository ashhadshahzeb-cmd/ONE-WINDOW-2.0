import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import * as rrweb from 'rrweb';
import { toast } from 'sonner';

const CHUNK_SIZE = 200 * 1024; // 200KB per chunk

export default function SpyListener() {
  const { user, userRole } = useAuth();
  const stopFnRef = useRef(null);
  const flushIntervalRef = useRef(null);

  useEffect(() => {
    if (!user || !user.email) return;
    if (userRole === 'super_admin' || userRole === 'admin') return;

    const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const channelName = `spy_${emailKey}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { ack: false, self: false } },
    });

    const startRecording = () => {
      if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
      if (flushIntervalRef.current) { clearInterval(flushIntervalRef.current); flushIntervalRef.current = null; }

      const eventBuffer = [];

      stopFnRef.current = rrweb.record({
        emit(event) { eventBuffer.push(event); },
      });

      flushIntervalRef.current = setInterval(async () => {
        if (eventBuffer.length === 0) return;
        const batch = eventBuffer.splice(0, eventBuffer.length);
        const payloadStr = JSON.stringify(batch);
        const totalChunks = Math.ceil(payloadStr.length / CHUNK_SIZE);
        const groupId = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        for (let i = 0; i < totalChunks; i++) {
          const chunk = payloadStr.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          try {
            await channel.send({
              type: 'broadcast',
              event: 'screen_chunk',
              payload: { groupId, idx: i, total: totalChunks, chunk },
            });
          } catch (err) {
            console.error('[SpyListener] send error', err);
          }
          if (totalChunks > 1) await new Promise(r => setTimeout(r, 50));
        }
      }, 500);
    };

    const stopRecording = () => {
      if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
      if (flushIntervalRef.current) { clearInterval(flushIntervalRef.current); flushIntervalRef.current = null; }
    };

    channel
      .on('broadcast', { event: 'watch_start' }, () => {
        toast.info('Super Admin is viewing your screen.');
        startRecording();
      })
      .on('broadcast', { event: 'watch_stop' }, () => {
        stopRecording();
        toast.info('Super Admin stopped viewing your screen.');
      })
      .subscribe((status) => {
        console.log('[SpyListener] channel status:', status);
      });

    return () => {
      stopRecording();
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  return null;
}
