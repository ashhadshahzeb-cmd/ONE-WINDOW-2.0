import React, { useEffect, useRef } from 'react';
import { PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OutgoingCallModalProps {
  receiverName: string;
  receiverRole: string;
  onCancel: () => void;
}

export default function OutgoingCallModal({ receiverName, receiverRole, onCancel }: OutgoingCallModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play outgoing ringtone loop
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
    audioRef.current.loop = true;
    audioRef.current.play().catch(e => console.error("Audio play failed:", e));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Calling Avatar */}
        <div className="relative mb-8 mt-4">
          <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-20 scale-150"></div>
          <div className="relative w-32 h-32 bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-full flex items-center justify-center shadow-lg border border-sky-500/30 backdrop-blur-md">
            <span className="text-4xl font-black text-sky-400">{receiverName.charAt(0).toUpperCase()}</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{receiverName}</h2>
        <p className="text-sm text-white/50 uppercase tracking-widest font-semibold mb-12">
          {receiverRole.replace(/_/g, ' ')}
        </p>
        
        <div className="flex items-center gap-3 mb-16">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></span>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce animation-delay-200"></span>
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce animation-delay-400"></span>
          <p className="text-lg text-sky-400 font-medium ml-2">
            Calling...
          </p>
        </div>

        <Button 
          onClick={onCancel}
          variant="outline" 
          className="w-16 h-16 rounded-full bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10 flex flex-col items-center justify-center group"
        >
          <PhoneOff className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </Button>
        <span className="text-xs text-white/40 mt-4 uppercase tracking-widest">Cancel Call</span>
      </div>
    </div>
  );
}
