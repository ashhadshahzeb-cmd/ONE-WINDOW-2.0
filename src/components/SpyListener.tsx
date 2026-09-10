import React, { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import * as rrweb from 'rrweb';
import { toast } from 'sonner';
import LZString from 'lz-string';

export default function SpyListener() {
  const { user, userRole } = useAuth();
  const stopFnRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    if (!user || userRole === 'super_admin') return;

    const emailKey = user.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
    const channelName = `spy_watch_${emailKey}`;
    let eventBuffer: any[] = [];
    let flushInterval: any = null;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
      },
    });
    
    channel.on('broadcast', { event: 'start_watch' }, (payload) => {
      toast.info("Super Admin is currently viewing your screen.");
      
      if (stopFnRef.current) {
        stopFnRef.current();
      }

      eventBuffer = [];

      stopFnRef.current = rrweb.record({
        emit(event) {
          eventBuffer.push(event);
        },
        recordCanvas: true,
        recordLog: true,
      });

      flushInterval = setInterval(async () => {
        if (eventBuffer.length > 0) {
          const payloadStr = JSON.stringify(eventBuffer);
          eventBuffer = [];
          
          const compressed = LZString.compressToUTF16(payloadStr);

          channel.send({
            type: 'broadcast',
            event: 'rrweb_compressed',
            payload: { data: compressed }
          });
        }
      }, 1000); // send every 1 second
    });

    channel.on('broadcast', { event: 'stop_watch' }, () => {
      if (stopFnRef.current) {
        stopFnRef.current();
        stopFnRef.current = null;
      }
      if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
      }
      toast.info("Super Admin has stopped viewing your screen.");
    });

    channel.subscribe();

    return () => {
      if (stopFnRef.current) stopFnRef.current();
      if (flushInterval) clearInterval(flushInterval);
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  return null;
}
