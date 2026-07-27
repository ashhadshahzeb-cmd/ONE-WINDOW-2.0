import React, { useState } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-[#111]/95 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <DropdownMenuLabel className="p-0 font-bold text-white text-lg">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
              className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2 rounded-lg"
            >
              <Check className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px] max-h-[60vh] custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/40">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={cn(
                    "px-4 py-3 focus:bg-white/5 cursor-pointer flex flex-col items-start gap-1 outline-none transition-colors",
                    !notification.is_read ? "bg-white/5 border-l-2 border-blue-500" : "opacity-70"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full justify-between gap-2">
                    <span className={cn("font-semibold text-sm", !notification.is_read ? "text-white" : "text-white/80")}>
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-white/40 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 w-full pr-4">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
