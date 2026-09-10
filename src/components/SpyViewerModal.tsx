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
  const replayerRef = useRef<rrweb.Replayer | null>(null);
  const channelRef = useRef<any>(null);
  const [status, setStatus] = useState<string>('Connecting...');

  useEffect(() => {
    if (!isOpen || !targetUserEmail) return;

    setStatus('Connecting...');
    replayerRef.current = null;

    const emailKey = targetUserEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const channelName = `spy_${emailKey}`;

    const pendingChunks: Record<string, string[]> = {};
    const events: any[] = [];

    const processEvents = (incoming: any[]) => {
      if (!incoming || incoming.length === 0) return;

      setStatus('Connected (Live)');

      if (!replayerRef.current && containerRef.current) {
        events.push(...incoming);
        // Wait until we have the full snapshot (type 2)
        if (events.some(e => e.type === 2)) {
          replayerRef.current = new rrweb.Replayer(events, {
            root: containerRef.current,
            liveMode: true,
          });
          replayerRef.current.startLive();
        }
      } else if (replayerRef.current) {
        incoming.forEach(ev => replayerRef.current!.addEvent(ev));
      }
    };

    const channel = supabase.channel(channelName, {
      config: { broadcast: { ack: false, self: false } },
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'screen_chunk' }, ({ payload }) => {
        const { groupId, idx, total, chunk } = payload;
        if (!pendingChunks[groupId]) pendingChunks[groupId] = new Array(total).fill(null);
        pendingChunks[groupId][idx] = chunk;

        if (pendingChunks[groupId].every(c => c !== null)) {
          const full = pendingChunks[groupId].join('');
          delete pendingChunks[groupId];
          try {
            const parsed = JSON.parse(full);
            processEvents(parsed);
          } catch (e) {
            console.error('[SpyViewer] parse error', e);
          }
        }
      })
      .subscribe((subStatus) => {
        console.log('[SpyViewer] channel status:', subStatus);
        if (subStatus === 'SUBSCRIBED') {
          setStatus('Waiting for screen data...');
          // Signal the user to start recording
          channel.send({
            type: 'broadcast',
            event: 'watch_start',
            payload: {},
          });
        }
      });

    return () => {
      channel.send({ type: 'broadcast', event: 'watch_stop', payload: {} });
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      replayerRef.current = null;
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
        <div className="flex-1 overflow-auto bg-black" ref={containerRef} style={{ position: 'relative' }}>
          {status !== 'Connected (Live)' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-zinc-700" />
              <p>{status}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
