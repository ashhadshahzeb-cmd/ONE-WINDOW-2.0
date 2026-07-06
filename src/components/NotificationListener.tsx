import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BellRing, FileText, MessageCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import IncomingCallModal from './IncomingCallModal';

interface IncomingCallData {
  roomId: string;
  callerName: string;
  callerRole: string;
}

export default function NotificationListener() {
  const { userRole, userName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);

  useEffect(() => {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // If no user is logged in, do not subscribe
    if (!userRole) return;

    // Define the specific channel for file tracking updates
    const fileChannel = supabase
      .channel('public:file_tracking_records_notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'file_tracking_records',
        },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          const eventType = payload.eventType;

          // We only care if the record is currently marked to the logged-in user
          // AND it wasn't the logged-in user themselves who just made the change
          if (newRecord && newRecord.mark_to === userRole) {
            
            // For an UPDATE, check if it was just forwarded to us
            if (eventType === 'UPDATE') {
              // If it was already marked to us, don't notify again unless something major changed.
              // We'll primarily notify if `mark_to` changed to our role, OR it's a new forward.
              if (oldRecord && oldRecord.mark_to !== userRole) {
                showNotification(newRecord, 'forwarded');
              }
            } 
            // For an INSERT, check if it's newly registered directly to us
            else if (eventType === 'INSERT') {
              showNotification(newRecord, 'registered');
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to file notifications for role:', userRole);
        }
      });

    // Define the channel for chat messages and calls
    const messageChannel = supabase
      .channel('public:messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          // Only notify if message is for us, and we are not the sender
          if (newMsg && newMsg.receiver_role === userRole && newMsg.sender_role !== userRole) {
            
            // Call logic
            if (newMsg.message.startsWith('[CALL_RING]::')) {
              const roomId = newMsg.message.split('::')[1];
              setIncomingCall({
                roomId,
                callerName: newMsg.sender_name,
                callerRole: newMsg.sender_role
              });
              return;
            } else if (newMsg.message.startsWith('[CALL_CANCELED]::')) {
              const roomId = newMsg.message.split('::')[1];
              setIncomingCall(prev => prev?.roomId === roomId ? null : prev);
              return;
            } else if (newMsg.message.startsWith('[CALL_ACCEPTED]::') || newMsg.message.startsWith('[CALL_DECLINED]::')) {
              // handled in caller's side
              return;
            }

            // Normal chat notification
            if (location.pathname !== '/messages') {
              showMessageNotification(newMsg);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to message notifications for role:', userRole);
        }
      });

    return () => {
      supabase.removeChannel(fileChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [userRole, location.pathname]);

  const handleAcceptCall = async () => {
    if (!incomingCall || !userRole || !userName) return;

    // Send accepted signal
    await supabase.from('messages').insert([{
      sender_role: userRole,
      sender_name: userName,
      receiver_role: incomingCall.callerRole,
      receiver_name: incomingCall.callerName,
      message: `[CALL_ACCEPTED]::${incomingCall.roomId}`
    }]);

    navigate(`/video-call/${incomingCall.roomId}`);
    setIncomingCall(null);
  };

  const handleDeclineCall = async () => {
    if (!incomingCall || !userRole || !userName) return;

    // Send declined signal
    await supabase.from('messages').insert([{
      sender_role: userRole,
      sender_name: userName,
      receiver_role: incomingCall.callerRole,
      receiver_name: incomingCall.callerName,
      message: `[CALL_DECLINED]::${incomingCall.roomId}`
    }]);

    setIncomingCall(null);
  };

  const showNotification = (record: any, action: 'registered' | 'forwarded') => {
    toast.custom((t) => (
      <div className="bg-[#0f1115]/95 border border-sky-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-4 animate-in slide-in-from-right w-[350px]">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
          <BellRing className="w-5 h-5 text-sky-400 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-black text-white tracking-wide">
            New File {action === 'forwarded' ? 'Forwarded' : 'Received'}!
          </p>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-400 font-bold">{record.receiving_number || 'N/A'}</span>
          </div>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
            {record.subject || 'No subject provided'}
          </p>
          {record.received_from && (
            <p className="text-[10px] text-white/40 italic mt-1">
              From: {record.received_from}
            </p>
          )}
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-right',
    });

    // Also trigger browser push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New File ${action === 'forwarded' ? 'Forwarded' : 'Received'}!`, {
        body: `${record.receiving_number || 'N/A'}\n${record.subject || 'No subject'}`,
        icon: '/favicon.ico',
      });
    }
  };

  const showMessageNotification = (msg: any) => {
    toast.custom((t) => (
      <div className="bg-[#0f1115]/95 border border-amber-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-4 animate-in slide-in-from-right w-[350px]">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-black text-white tracking-wide">
            New Message
          </p>
          <p className="text-xs text-white/70 font-semibold">
            From: <span className="text-amber-400">{msg.sender_name || msg.sender_role}</span>
          </p>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed italic border-l-2 border-white/10 pl-2 mt-1">
            "{msg.message}"
          </p>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-right',
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New Message from ${msg.sender_name || msg.sender_role}`, {
        body: msg.message,
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <>
      {incomingCall && (
        <IncomingCallModal 
          callerName={incomingCall.callerName}
          callerRole={incomingCall.callerRole}
          roomId={incomingCall.roomId}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </>
  );
}
