import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { Loader2 } from 'lucide-react';
import LZString from 'lz-string';

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
      config: { broadcast: { ack: false } },
    });

    let events: any[] = [];

    channel.on('broadcast', { event: 'rrweb_compressed' }, (payload) => {
      try {
        const decompressed = LZString.decompressFromUTF16(payload.payload.data);
        if (!decompressed) return;

        const incomingEvents = JSON.parse(decompressed);
        if (!incomingEvents || incomingEvents.length === 0) return;
        
        setStatus('Connected (Live)');

        if (!replayerRef.current && containerRef.current) {
           events.push(...incomingEvents);
           if (events.some(e => e.type === 2)) {
              
              const width = containerRef.current.clientWidth || 1024;
              const height = containerRef.current.clientHeight || 768;
              
              replayerRef.current = new rrwebPlayer({
                target: containerRef.current,
                props: {
                  events: events,
                  autoPlay: true,
                  liveMode: true,
                  width: width,
                  height: height,
                  showController: false,
                }
              });

           } else if (events.length > 0) {
              events = [];
              channel.send({ type: 'broadcast', event: 'start_watch', payload: {} });
           }
        } else if (replayerRef.current) {
           incomingEvents.forEach((ev: any) => {
              replayerRef.current.addEvent(ev);
           });
        }
      } catch(e) {
        console.error("Failed to parse compressed events", e);
      }
    });

    channel.subscribe((subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        setStatus('Waiting for screen data...');
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
        if (replayerRef.current.__cleanupScale) replayerRef.current.__cleanupScale();
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
        <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-black" ref={containerRef}>
          {status !== 'Connected (Live)' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-zinc-700" />
              <p>Connecting to user's screen stream...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
