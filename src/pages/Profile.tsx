import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserCircle, Key, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { userName, userAvatar, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(userName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(userAvatar || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect (handled globally but safe to have)
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit
      toast.error('Image size must be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display Name cannot be empty');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    const { success, error } = await updateUserProfile(displayName, newPassword || undefined, avatar || undefined);
    
    if (success) {
      toast.success('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(error || 'Failed to update profile');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-6 mb-6">
        <label className="relative group cursor-pointer w-20 h-20 rounded-full flex-shrink-0">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {avatar ? (
            <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-primary/50 shadow-xl" />
          ) : (
            <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
              <UserCircle className="w-10 h-10 text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white font-semibold">Change</span>
          </div>
        </label>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-sm text-white/50">Manage your account details, picture, and password.</p>
        </div>
      </div>

      <Card className="bg-[#09090b]/50 border-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-sky-400" />
            Basic Information
          </CardTitle>
          <CardDescription className="text-white/40">
            This is your public display name that appears on the dashboard and in activity logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Display Name</label>
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12"
              placeholder="Enter your name"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#09090b]/50 border-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Security
          </CardTitle>
          <CardDescription className="text-white/40">
            Change your password. Leave blank if you don't want to change it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">New Password</label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Confirm Password</label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
