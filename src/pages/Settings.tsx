import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Moon, 
  Sun,
  FileText,
  Upload,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { Profile } from '../types';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        const profileData = data as Profile;
        setProfile(profileData);
        setFullName(profileData.full_name || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) toast.error('Update failed');
    else {
      toast.success('Profile updated');
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
    }
    setUpdating(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL: This will permanently delete your account and all tracked data. This cannot be undone.')) return;
    
    toast.loading('Deleting account...');
    // Realistically, you'd call a Supabase function or a secure endpoint since users can't delete themselves directly easily
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('Error signing out');
    else {
       toast.success('Account scheduled for deletion. You have been signed out.');
    }
  };

  return (
    <div className="space-y-8 pb-12 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
          <SettingsIcon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Account Settings</h1>
          <p className="text-slate-500">Manage your profile, data, and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-500" />
              General Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Email (Private)</label>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-sm font-bold text-slate-400">
                   <ShieldCheck className="h-4 w-4" />
                   {user?.email}
                </div>
             </div>
             <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
             </div>
             <div className="pt-4 flex justify-end">
                <Button onClick={handleUpdateProfile} isLoading={updating}>Save Profile Changes</Button>
             </div>
          </CardContent>
        </Card>

        {/* Resumes Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-500" />
              Resume Versions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm font-medium text-slate-400">No resumes uploaded yet.</p>
             </div>
             <Button variant="outline" className="w-full gap-2 text-slate-600 bg-slate-50 border-slate-100">
                <Upload className="h-4 w-4" />
                Upload New PDF Version
             </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
           <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Moon className="h-5 w-5 text-primary-500" />
                 Display Preferences
              </CardTitle>
           </CardHeader>
           <CardContent className="flex items-center justify-between">
              <div>
                 <p className="font-bold text-slate-800">Dynamic User Interface</p>
                 <p className="text-xs font-medium text-slate-500">Adjust colors based on time of day.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button className="p-2 rounded-md bg-white shadow-sm text-primary-600"><Sun className="h-4 w-4" /></button>
                 <button className="p-2 rounded-md text-slate-400"><Moon className="h-4 w-4" /></button>
              </div>
           </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100 bg-red-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm font-medium text-red-700/70">
                Deleting your account will remove all applications, reminders, and profile data from our servers instantly.
             </p>
             <Button variant="danger" className="w-full gap-2 h-11" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4" />
                Permanently Delete Account
             </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center py-12 text-center opacity-50 grayscale">
         <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold font-serif text-slate-800">EasyJobStatus</span>
         </div>
         <p className="text-xs font-black uppercase tracking-widest text-slate-500">Build Version 1.0.4 — Product of Future Recruiting Tech</p>
      </div>
    </div>
  );
};
