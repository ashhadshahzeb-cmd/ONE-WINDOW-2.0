import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth, getDepartmentUsers, DepartmentUser } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, VideoOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import GroupCallModal from '@/components/GroupCallModal';
import { supabase } from '@/integrations/supabase/client';

export default function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const { userName, userRole, userAvatar } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [contacts, setContacts] = useState<DepartmentUser[]>([]);

  useEffect(() => {
    // Load contacts, excluding myself
    const allUsers = getDepartmentUsers();
    setContacts(allUsers.filter(u => u.roleId !== userRole));
  }, [userRole]);

  const handleInvite = async (selectedContacts: DepartmentUser[]) => {
    if (!userRole || !userName || !roomId) return;

    const msg = `[CALL_RING]::${roomId}::${userAvatar || ''}`;
    
    // Batch Insert for Invites
    const payloads = selectedContacts.map(contact => ({
      sender_role: userRole,
      sender_name: userName,
      receiver_role: contact.roleId,
      receiver_name: contact.displayName,
      message: msg
    }));

    if (payloads.length > 0) {
      const { error } = await supabase.from('messages').insert(payloads);
      if (error) {
        toast.error('Failed to send invites: ' + error.message);
        console.error('Invite error:', error);
      } else {
        toast.success(`Invited ${payloads.length} participant(s) to the call!`);
      }
    }

    setShowInviteModal(false);
  };

  // ZegoCloud App ID and Server Secret 
  // (In a real app, Server Secret should be used on the backend to generate tokens)
  // For demo/prototype, UIKits allows using them directly on frontend.
  const appID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 0;
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";

  useEffect(() => {
    if (!roomId || !userName || !containerRef.current) return;

    if (!appID || !serverSecret) {
      toast.error('Video Call configuration is missing. Please check your App ID and Server Secret.');
      return;
    }

    const myMeeting = async (element: HTMLDivElement) => {
      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userRole || 'anonymous',
        userName || 'User'
      );

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Join the room
      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Room Link',
            url: window.location.origin + window.location.pathname + '?roomId=' + roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        layout: "Gallery",
        showScreenSharingButton: true,
        onLeaveRoom: () => {
          navigate('/messages');
        },
      });
    };

    myMeeting(containerRef.current);

    // Cleanup when component unmounts
    return () => {
      // ZegoCloud handles its own cleanup onLeaveRoom, but we can clear the div just in case
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [roomId, userName, userRole, appID, serverSecret, navigate]);

  if (!appID || !serverSecret) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <VideoOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Video Call Not Configured</h2>
        <p className="text-white/60 max-w-md">
          To enable Video Calling & Screen Sharing, you must add <code>VITE_ZEGO_APP_ID</code> and <code>VITE_ZEGO_SERVER_SECRET</code> to your <code>.env</code> file.
        </p>
        <p className="text-white/40 text-sm max-w-md">
          Create a free account at ZegoCloud.com to get these keys.
        </p>
        <Button onClick={() => navigate('/messages')} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] w-full flex flex-col relative rounded-2xl overflow-hidden bg-black/50 border border-white/5">
      {/* Header bar */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-4 justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="ml-4 text-white">
            <h2 className="font-semibold text-sm">Secure Room</h2>
            <p className="text-xs text-white/60 opacity-80 font-mono">ID: {roomId}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2 h-9 px-4 shadow-lg shadow-sky-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Add People
        </Button>
      </div>

      {/* ZegoCloud Container */}
      <div className="w-full h-full" ref={containerRef} />

      {/* Invite Modal */}
      {showInviteModal && (
        <GroupCallModal 
          contacts={contacts}
          onCall={handleInvite}
          onCancel={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
