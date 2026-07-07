import React, { useState, useEffect, useRef } from 'react';
import { useAuth, getDepartmentUsers, DepartmentUser } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Send, MessageCircle, User, Video, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import OutgoingCallModal from '@/components/OutgoingCallModal';
import GroupCallModal from '@/components/GroupCallModal';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender_role: string;
  sender_name: string;
  receiver_role: string;
  receiver_name: string;
  message: string;
  created_at: string;
}

const PREDEFINED_CHANNELS: DepartmentUser[] = [
  { roleId: '#general', displayName: 'general', avatarUrl: '', name: 'General', department: 'system', permissions: [] },
  { roleId: '#finance-updates', displayName: 'finance-updates', avatarUrl: '', name: 'Finance Updates', department: 'system', permissions: [] },
  { roleId: '#cfo-discussions', displayName: 'cfo-discussions', avatarUrl: '', name: 'CFO Discussions', department: 'system', permissions: [] }
];

export default function Messages() {
  const { userRole, userName, userAvatar } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<DepartmentUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<DepartmentUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dialing States
  const [isDialing, setIsDialing] = useState(false);
  const [dialingRoomId, setDialingRoomId] = useState<string | null>(null);

  const startVideoCall = async () => {
    if (!selectedContact || !userRole || !userName) return;

    // Generate random room ID
    const roomId = Math.random().toString(36).substring(7);
    // Send Ring Signal without Avatar to avoid Realtime limits
    const msg = `[CALL_RING]::${roomId}`;
    
    await supabase.from('messages').insert([
      {
        sender_role: userRole,
        sender_name: userName,
        receiver_role: selectedContact.roleId,
        receiver_name: selectedContact.displayName,
        message: msg
      }
    ]);

    setIsDialing(true);
    setDialingRoomId(roomId);
  };

  const cancelCall = async () => {
    if (!selectedContact || !dialingRoomId || !userRole || !userName) return;
    
    const msg = `[CALL_CANCELED]::${dialingRoomId}`;
    await supabase.from('messages').insert([
      {
        sender_role: userRole,
        sender_name: userName,
        receiver_role: selectedContact.roleId,
        receiver_name: selectedContact.displayName,
        message: msg
      }
    ]);

    setIsDialing(false);
    setDialingRoomId(null);
  };

  useEffect(() => {
    // Listen for call acceptance or decline while dialing
    if (!isDialing || !dialingRoomId) return;

    const channel = supabase
      .channel('public:messages_calling')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg && newMsg.receiver_role === userRole) {
            if (newMsg.message === `[CALL_ACCEPTED]::${dialingRoomId}`) {
              // They accepted!
              setIsDialing(false);
              setDialingRoomId(null);
              navigate(`/video-call/${dialingRoomId}`);
            } else if (newMsg.message === `[CALL_DECLINED]::${dialingRoomId}`) {
              // They declined!
              setIsDialing(false);
              setDialingRoomId(null);
              toast.error(`${newMsg.sender_name} declined the call.`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDialing, dialingRoomId, userRole, navigate]);

  const [lastActivityMap, setLastActivityMap] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load contacts, excluding myself
    const allUsers = getDepartmentUsers();
    setContacts(allUsers.filter(u => u.roleId !== userRole));
  }, [userRole]);

  // Fetch recent activity map to sort contacts like WhatsApp
  useEffect(() => {
    if (!userRole) return;

    const fetchRecentActivity = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_role.eq.${userRole},receiver_role.eq.${userRole}`)
        .order('created_at', { ascending: false })
        .limit(300);

      if (data) {
        const activityMap: Record<string, number> = {};
        data.forEach((msg: ChatMessage) => {
          if (!msg.receiver_role.startsWith('#')) {
            const otherRole = msg.sender_role === userRole ? msg.receiver_role : msg.sender_role;
            const time = new Date(msg.created_at).getTime();
            if (!activityMap[otherRole] || time > activityMap[otherRole]) {
              activityMap[otherRole] = time;
            }
          }
        });
        setLastActivityMap(activityMap);
      }
    };
    fetchRecentActivity();
  }, [userRole]);

  // Fetch messages for active 1-on-1 chat
  useEffect(() => {
    if (!selectedContact || !userRole) return;
    fetchMessages(selectedContact.roleId);
  }, [selectedContact, userRole]);

  // Global realtime listener for incoming/outgoing messages
  useEffect(() => {
    if (!userRole) return;

    const channel = supabase
      .channel('private_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          
          if (newMsg.receiver_role.startsWith('#')) {
            // It's a channel message
            if (selectedContact && selectedContact.roleId === newMsg.receiver_role) {
              setMessages((prev) => [...prev, newMsg]);
            }
          } else if (newMsg.sender_role === userRole || newMsg.receiver_role === userRole) {
            const otherRole = newMsg.sender_role === userRole ? newMsg.receiver_role : newMsg.sender_role;
            const time = new Date(newMsg.created_at).getTime();
            
            // Update activity map so contact bubbles to top
            setLastActivityMap(prev => ({
              ...prev,
              [otherRole]: Math.max(prev[otherRole] || 0, time)
            }));

            // Only append to chat view if it belongs to the currently active 1-on-1 conversation
            if (selectedContact && !selectedContact.roleId.startsWith('#') && (
              (newMsg.sender_role === userRole && newMsg.receiver_role === selectedContact.roleId) ||
              (newMsg.sender_role === selectedContact.roleId && newMsg.receiver_role === userRole)
            )) {
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchMessages = async (contactRole: string) => {
    setLoading(true);
    setMessages([]);
    
    // Fetch messages based on channel vs DM
    let query = supabase.from('messages').select('*');
    
    if (contactRole.startsWith('#')) {
      query = query.eq('receiver_role', contactRole);
    } else {
      query = query.or(`and(sender_role.eq.${userRole},receiver_role.eq.${contactRole}),and(sender_role.eq.${contactRole},receiver_role.eq.${userRole})`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: true })
      .limit(200);

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userRole || !selectedContact) return;

    const msg = newMessage.trim();
    setNewMessage('');

    // Optimistic UI update could be done here, but Realtime will handle it instantly
    await supabase.from('messages').insert([
      {
        sender_role: userRole,
        sender_name: userName || userRole,
        receiver_role: selectedContact.roleId,
        receiver_name: selectedContact.displayName,
        message: msg
      }
    ]);
  };

  const filteredContacts = contacts
    .filter(c => 
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aTime = lastActivityMap[a.roleId] || 0;
      const bTime = lastActivityMap[b.roleId] || 0;
      return bTime - aTime;
    });

  const [showGroupCall, setShowGroupCall] = useState(false);

  const startGroupCall = async (selectedContacts: DepartmentUser[]) => {
    if (!userRole || !userName) return;

    // Generate random room ID
    const roomId = Math.random().toString(36).substring(7);
    // Omit userAvatar to prevent Realtime payload size limits
    const msg = `[CALL_RING]::${roomId}`;
    
    // Send to all selected contacts at once (Batch Insert)
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
        toast.error('Failed to start group call: ' + error.message);
        console.error('Group call error:', error);
        return;
      }
    }

    setShowGroupCall(false);
    navigate(`/video-call/${roomId}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex bg-[#0B101E]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Sidebar - Contacts List */}
      <div className="w-80 flex flex-col border-r border-white/5 bg-background/20 relative z-10">
        <div className="p-5 border-b border-white/5 bg-background/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black tracking-tight text-white/90">Messages</h2>
            <Button size="sm" className="h-8 gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md shadow-lg transition-colors group" onClick={() => setShowGroupCall(true)}>
              <Headphones className="w-3.5 h-3.5 text-white/70 group-hover:text-primary transition-colors" />
              <span className="font-bold text-xs">Huddle</span>
            </Button>
          </div>
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white/90 placeholder:text-white/30 font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Channels Section */}
          <div className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Channels</h3>
            {PREDEFINED_CHANNELS.map(channel => (
              <button
                key={channel.roleId}
                onClick={() => setSelectedContact(channel)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-[1rem] transition-all text-left group border border-transparent",
                  selectedContact?.roleId === channel.roleId 
                    ? "bg-primary/15 border-primary/20 shadow-lg" 
                    : "hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                  selectedContact?.roleId === channel.roleId 
                    ? "bg-primary/20 border-primary/30" 
                    : "bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20"
                )}>
                  <span className={cn("text-lg font-black", selectedContact?.roleId === channel.roleId ? "text-primary" : "text-white/50")}>#</span>
                </div>
                <div className="overflow-hidden">
                  <p className={cn("font-bold text-sm truncate", selectedContact?.roleId === channel.roleId ? "text-white" : "text-white/80")}>
                    {channel.displayName}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Direct Messages Section */}
          <div className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 mt-4 flex items-center justify-between">
              Direct Messages
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] text-white/60">{filteredContacts.length}</span>
            </h3>
            {filteredContacts.map(contact => (
              <button
                key={contact.roleId}
                onClick={() => setSelectedContact(contact)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-[1rem] transition-all text-left group border border-transparent",
                  selectedContact?.roleId === contact.roleId 
                    ? "bg-primary/10 border-primary/20 shadow-lg" 
                    : "hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-colors relative",
                  selectedContact?.roleId === contact.roleId 
                    ? "bg-primary/20 border-primary/30" 
                    : "bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20"
                )}>
                  <User className={cn("w-4 h-4", selectedContact?.roleId === contact.roleId ? "text-primary" : "text-white/50")} />
                  {/* Fake online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B101E] rounded-full"></span>
                </div>
                <div className="overflow-hidden">
                  <p className={cn("font-bold text-sm truncate", selectedContact?.roleId === contact.roleId ? "text-white" : "text-white/80")}>
                    {contact.displayName}
                  </p>
                  <p className={cn(
                    "text-[9px] truncate uppercase tracking-widest font-bold",
                    selectedContact?.roleId === contact.roleId ? "text-primary/80" : "text-white/40"
                  )}>
                    {contact.roleId.replace(/_/g, ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area - Chat Window */}
      <div className="flex-1 flex flex-col relative z-10">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-[76px] px-8 border-b border-white/5 bg-background/10 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white/90">{selectedContact.displayName}</h3>
                  <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">{selectedContact.roleId.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 bg-white/5 text-white/90 border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-primary font-bold rounded-xl h-10 px-5 transition-all group shadow-sm"
                onClick={startVideoCall}
              >
                <Headphones className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors" />
                Start Huddle
              </Button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full bg-[url('/noise.png')] bg-repeat bg-opacity-5">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>No messages yet. Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, index, filteredMessages) => {
                  const isMe = msg.sender_role === userRole;
                  const showHeader = index === 0 || filteredMessages[index - 1].sender_role !== msg.sender_role;

                  return (
                    <div key={msg.id} className={cn("flex items-start gap-4 hover:bg-white/[0.02] p-2 -mx-2 rounded-2xl transition-colors group", showHeader ? "mt-6" : "mt-1")}>
                      {/* Avatar */}
                      {showHeader ? (
                        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border", isMe ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "bg-white/5 border-white/10 text-white/50")}>
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[10px] text-white/20 font-medium text-center">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/ AM| PM/, '')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className={cn("font-bold text-[15px]", isMe ? "text-primary/90" : "text-white/90")}>
                              {isMe ? 'You' : msg.sender_name}
                            </span>
                            <span className="text-[10px] text-white/30 font-medium">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        
                        {/* Message Content Bubble */}
                        {msg.message.startsWith('[FILE_TRACKING_EDIT_REQ]') ? (
                          <div className="mt-2 bg-amber-500/10 border border-amber-500/20 text-amber-100 rounded-2xl p-4 max-w-sm backdrop-blur-md">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-amber-400 mb-1">File Edit Request</h4>
                                <p className="text-xs opacity-80 mb-3 text-amber-200/70">Tracking ID: {msg.message.split('::')[1]}</p>
                                {!isMe && (
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 h-7 text-[10px] px-3">Approve</Button>
                                    <Button size="sm" variant="ghost" className="text-white/50 hover:bg-white/5 hover:text-white h-7 text-[10px] px-3">Decline</Button>
                                  </div>
                                )}
                                {isMe && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">Pending Approval</span>}
                              </div>
                            </div>
                          </div>
                        ) : msg.message.startsWith('[FILE_TRACKING_EDIT_APPROVED]') ? (
                          <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-2xl p-4 max-w-sm backdrop-blur-md">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-emerald-400">Edit Request Approved</h4>
                                <p className="text-xs opacity-80 text-emerald-200/70">Tracking ID: {msg.message.split('::')[1]}</p>
                              </div>
                            </div>
                          </div>
                        ) : msg.message.startsWith('[CALL_') ? (
                          <div className={cn(
                            "mt-2 px-4 py-2.5 rounded-xl text-xs font-bold border inline-flex items-center gap-2",
                            msg.message.startsWith('[CALL_ACCEPTED]') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            msg.message.startsWith('[CALL_DECLINED]') ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            msg.message.startsWith('[CALL_CANCELED]') ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" :
                            "bg-sky-500/10 border-sky-500/20 text-sky-400"
                          )}>
                            <Headphones className="w-3.5 h-3.5" />
                            {msg.message.startsWith('[CALL_RING]') ? (isMe ? 'Started a Huddle' : 'Incoming Huddle') :
                             msg.message.startsWith('[CALL_ACCEPTED]') ? 'Huddle Started' :
                             msg.message.startsWith('[CALL_DECLINED]') ? (isMe ? 'Huddle Declined' : 'Missed Huddle') :
                             'Huddle Canceled'}
                          </div>
                        ) : (
                          <div className="text-[15px] text-white/80 leading-relaxed break-words">
                            {msg.message}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-5 bg-background/20 backdrop-blur-2xl border-t border-white/5 flex items-end gap-3 relative z-10">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedContact.displayName}...`}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white/90 placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-black/30 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
              <Button type="submit" size="icon" className="h-[56px] w-[56px] rounded-2xl shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-primary-foreground group" disabled={!newMessage.trim()}>
                <Send className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/40 p-8 text-center relative z-10">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.02)] backdrop-blur-md">
              <MessageCircle className="w-12 h-12 text-white/30" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white/60">Select a Contact</h2>
            <p className="text-sm font-medium mt-3 max-w-sm text-white/40 leading-relaxed">Choose someone from the left sidebar to start messaging. All conversations are end-to-end secured inside KW&SC Network.</p>
          </div>
        )}
      </div>

      {isDialing && selectedContact && (
        <OutgoingCallModal 
          receiverName={selectedContact.displayName}
          receiverRole={selectedContact.roleId}
          receiverAvatar={selectedContact.avatarUrl}
          onCancel={cancelCall}
        />
      )}

      {showGroupCall && (
        <GroupCallModal 
          contacts={contacts}
          onCall={startGroupCall}
          onCancel={() => setShowGroupCall(false)}
        />
      )}
    </div>
  );
}
