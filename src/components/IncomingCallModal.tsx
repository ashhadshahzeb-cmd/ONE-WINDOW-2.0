import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallModalProps {
  callerName: string;
  callerRole: string;
  callerAvatar?: string;
  roomId: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallModal({ callerName, callerRole, callerAvatar, roomId, onAccept, onDecline }: IncomingCallModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play incoming ringtone loop (Classic WhatsApp/Skype style)
    audioRef.current = new Audio('https://www.soundjay.com/phone/sounds/ringtone-1-2.mp3');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        {/* Pulsing Avatar */}
        <div className="relative mb-6 mt-4">
          <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-20 scale-150"></div>
          <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-40 scale-110 animation-delay-200"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-[#18181b] overflow-hidden">
            {callerAvatar ? (
              <img src={callerAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-white">{callerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{callerName}</h2>
        <p className="text-sm text-white/50 uppercase tracking-widest font-semibold mb-8">
          {callerRole.replace(/_/g, ' ')}
        </p>
        <p className="text-sm text-sky-400 animate-pulse font-medium mb-8">
          Incoming Video Call...
        </p>

        <div className="flex items-center gap-6 w-full justify-center">
          <Button 
            onClick={onDecline}
            variant="outline" 
            className="w-16 h-16 rounded-full bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button 
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20 animate-bounce"
          >
            <Phone className="w-6 h-6 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
