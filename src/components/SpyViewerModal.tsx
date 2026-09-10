import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as rrweb from 'rrweb';
import { Loader2 } from 'lucide-react';

interface SpyViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserEmail: string;
}

export default function SpyViewerModal({ isOpen, onClose, targetUserEmail }: SpyViewerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<any>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  
  useEffect(() => {
    if (!isOpen || !targetUserEmail) return;
    setStatus('Connecting...');

    const emailKey = targetUserEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const channelName = `spy_watch_${emailKey}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
      },
    });

    let events: any[] = [];

    channel.on('broadcast', { event: 'rrweb_events' }, (payload) => {
      const incomingEvents = payload.payload.events;
      if (!incomingEvents || incomingEvents.length === 0) return;
      
      setStatus('Connected (Live)');

      if (!replayerRef.current && containerRef.current) {
         events.push(...incomingEvents);
         // Ensure we have at least one full snapshot before starting
         if (events.some(e => e.type === 2)) {
            replayerRef.current = new rrweb.Replayer(events, {
              root: containerRef.current,
              liveMode: true,
            });
            replayerRef.current.play();
         }
      } else if (replayerRef.current) {
         incomingEvents.forEach((ev: any) => replayerRef.current.addEvent(ev));
      }
    });

    channel.subscribe((subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        setStatus('Waiting for screen data...');
        // Request the target to start watching
        channel.send({
          type: 'broadcast',
          event: 'start_watch',
          payload: {}
        });
      }
    });

    return () => {
      channel.send({ type: 'broadcast', event: 'stop_watch', payload: {} });
      supabase.removeChannel(channel);
      if (replayerRef.current) {
        // Cleanup if possible, rrwebPlayer doesn't have a direct destroy method sometimes, 
        // but removing it from DOM is handled by React unmount.
        containerRef.current!.innerHTML = '';
        replayerRef.current = null;
      }
    };
  }, [isOpen, targetUserEmail]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[95vh] bg-[#1a1a1a] border-zinc-800 p-0 flex flex-col">
        <DialogHeader className="p-4 border-b border-zinc-800 shrink-0 bg-[#222]">
          <DialogTitle className="text-zinc-200 flex items-center justify-between">
            <span>Live View: {targetUserEmail}</span>
            <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">
              {status}
              {status !== 'Connected (Live)' && <Loader2 className="inline-block ml-2 w-3 h-3 animate-spin" />}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden relative flex items-center justify-center" ref={containerRef}>
          {status !== 'Connected (Live)' && (
            <div className="flex flex-col items-center text-zinc-500 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-zinc-700" />
              <p>Connecting to user's screen stream...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
