import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Megaphone, Plus, Pin, Trash2, Pencil, Loader2, Clock, AlertTriangle, 
  Bell, Search, PinOff
} from "lucide-react";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  posted_by: string;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function NoticeBoard() {
  const { isAdmin, userName } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices' as any)
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out expired notices
      const now = new Date();
      const active = (data || []).filter((n: any) => {
        if (!n.expires_at) return true;
        return new Date(n.expires_at) > now;
      });
      
      setNotices(active as Notice[]);
    } catch (err: any) {
      console.error("Error fetching notices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();

    // Realtime subscription
    const channel = supabase
      .channel('notices-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
        fetchNotices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const openNewDialog = () => {
    setEditingNotice(null);
    setTitle("");
    setContent("");
    setPriority("normal");
    setExpiresAt("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setPriority(notice.priority);
    setExpiresAt(notice.expires_at ? notice.expires_at.split('T')[0] : "");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        priority,
        posted_by: userName || 'Admin',
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString(),
      };

      if (editingNotice) {
        const { error } = await supabase
          .from('notices' as any)
          .update(payload)
          .eq('id', editingNotice.id);
        if (error) throw error;
        toast.success("Notice updated!");
      } else {
        const { error } = await supabase
          .from('notices' as any)
          .insert(payload);
        if (error) throw error;
        toast.success("Notice published!");

        // Trigger push notification for urgent notices
        if (priority === 'urgent' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Urgent Notice', { body: title, icon: '/favicon.ico' });
        }
      }

      setIsDialogOpen(false);
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message || "Failed to save notice");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePin = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from('notices' as any)
        .update({ is_pinned: !notice.is_pinned })
        .eq('id', notice.id);
      if (error) throw error;
      toast.success(notice.is_pinned ? "Unpinned" : "Pinned!");
      fetchNotices();
    } catch (err: any) {
      toast.error("Failed to pin/unpin");
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const { error } = await supabase
        .from('notices' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success("Notice deleted!");
      fetchNotices();
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  const priorityConfig = {
    urgent: { color: 'border-red-500/50 bg-red-500/5', badge: 'bg-red-500/20 text-red-400', icon: AlertTriangle, label: 'URGENT' },
    important: { color: 'border-orange-500/50 bg-orange-500/5', badge: 'bg-orange-500/20 text-orange-400', icon: Bell, label: 'IMPORTANT' },
    normal: { color: 'border-border', badge: 'bg-primary/10 text-primary', icon: Megaphone, label: 'NOTICE' },
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Notice Board
          </h1>
          <p className="text-muted-foreground mt-1">Official announcements and important updates for all staff.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-64 bg-background/50"
            />
          </div>
          {isAdmin && (
            <Button className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20" onClick={openNewDialog}>
              <Plus className="w-5 h-5 mr-2" /> New Notice
            </Button>
          )}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <Card className="bg-background/30 border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Megaphone className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No notices posted yet.</p>
            {isAdmin && <p className="text-sm text-muted-foreground/70 mt-1">Click "New Notice" to post the first one.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map(notice => {
            const config = priorityConfig[notice.priority];
            const Icon = config.icon;

            return (
              <Card key={notice.id} className={`${config.color} border transition-all hover:shadow-lg relative overflow-hidden group`}>
                {notice.is_pinned && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                    📌 Pinned
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${config.badge} mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg font-bold">{notice.title}</CardTitle>
                          <Badge className={`${config.badge} text-[10px] font-black`}>{config.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">{notice.posted_by}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(notice.created_at)}</span>
                          {notice.expires_at && (
                            <>
                              <span>•</span>
                              <span className="text-orange-400">Expires: {new Date(notice.expires_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => togglePin(notice)}>
                          {notice.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(notice)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => deleteNotice(notice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed pl-11">{notice.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border-border sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Notice' : 'Post New Notice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Office will be closed on Friday" required />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Write the full notice details here..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">📋 Normal</SelectItem>
                    <SelectItem value="important">⚠️ Important</SelectItem>
                    <SelectItem value="urgent">🚨 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expires On (Optional)</Label>
                <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full font-bold" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingNotice ? 'Update Notice' : 'Publish Notice'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
