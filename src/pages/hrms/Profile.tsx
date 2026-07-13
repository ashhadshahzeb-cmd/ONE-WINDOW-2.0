import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { User, Phone, MapPin, Lock, Camera, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const empId = localStorage.getItem('kwsb_hrms_emp_id');
    if (!empId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('hrms_employees')
      .select('*')
      .eq('id', empId)
      .single();

    if (data && !error) {
      setProfile(data);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setPassword(data.password || '');
      setPhotoUrl(data.photo_url || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const empId = localStorage.getItem('kwsb_hrms_emp_id');
    if (!empId) return;

    setSaving(true);
    const { error } = await supabase
      .from('hrms_employees')
      .update({
        phone,
        address,
        password,
        photo_url: photoUrl
      })
      .eq('id', empId);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your information has been saved successfully!' });
    }
  };

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setPhotoUrl(data.publicUrl);
      toast({ title: 'Upload Successful', description: 'Don\'t forget to click Save Changes!' });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!profile) {
    return <div className="text-center text-white/50 mt-20">Profile not found. Are you logged in as an employee?</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white/5 border border-white/10 p-6 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        
        {/* Profile Picture Upload */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/30 bg-black/40 flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-white/30" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-emerald-400 transition-colors">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
          </label>
        </div>

        {/* Read-Only Info */}
        <div className="text-center sm:text-left flex-1 mt-2">
          <h1 className="text-3xl font-black text-white">{profile.name}</h1>
          <p className="text-emerald-400 font-medium text-lg mt-1">{profile.designation}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-white/50 text-xs sm:text-sm">
            <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5">{profile.department}</span>
            <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Joined: {profile.join_date}</span>
            <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5">{profile.email}</span>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-black/20 border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-sm space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-emerald-500" />
          Update Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70 ml-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Phone Number
            </label>
            <Input 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              placeholder="03XX-XXXXXXX"
              className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white/70 ml-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Password
            </label>
            <Input 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Your secure password"
              className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-white/70 ml-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Address
            </label>
            <Input 
              value={address} 
              onChange={e => setAddress(e.target.value)}
              placeholder="House #, Street, Area, City"
              className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto px-8 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
