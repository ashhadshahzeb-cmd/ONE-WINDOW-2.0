import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserCircle, Key, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { userName, updateUserProfile, isLocalAuth } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(userName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLocalAuth) {
      toast.error("Profile settings are currently only available for local users.");
      navigate('/');
    }
  }, [isLocalAuth, navigate]);

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
    const { success, error } = await updateUserProfile(displayName, newPassword || undefined);
    
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
          <UserCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-sm text-white/50">Manage your account details and password.</p>
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
