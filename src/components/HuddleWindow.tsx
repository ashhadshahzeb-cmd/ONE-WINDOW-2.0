import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/contexts/AuthContext';
import { Headphones, Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HuddleWindowProps {
  roomId: string;
  onLeave: () => void;
}

export default function HuddleWindow({ roomId, onLeave }: HuddleWindowProps) {
  const { userName, userRole } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 0;
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

  useEffect(() => {
    if (!roomId || !userName || !containerRef.current) return;

    if (!appID || !serverSecret) {
      toast.error('Huddle configuration is missing (Zego App ID/Secret).');
      return;
    }

    let zp: any = null;

    const myMeeting = async (element: HTMLDivElement) => {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userRole || 'anonymous',
        userName || 'User'
      );

      zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // Group call fits Huddle better
        },
        maxUsers: 50,
        showScreenSharingButton: true,
        showTextChat: false, // We have our own chat
        showUserList: true,
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: false, // Audio first!
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showLayoutButton: true,
        onLeaveRoom: () => {
          onLeave();
        },
      });
    };

    myMeeting(containerRef.current);

    return () => {
      if (zp) {
        zp.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [roomId, userName, userRole, appID, serverSecret, onLeave]);

  return (
    <div 
      className={cn(
        "absolute z-50 bg-[#0B101E]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out",
        isExpanded 
          ? "top-4 left-4 right-4 bottom-4" // Full size
          : "bottom-6 right-6 w-[400px] h-[500px]" // Floating compact size
      )}
    >
      {/* Custom Huddle Header */}
      <div className="h-12 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 shrink-0 cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-bold text-sm text-white/90">Huddle <span className="text-white/40 text-xs font-normal">| {roomId}</span></span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/20"
            onClick={onLeave}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zego Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-black/50"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
