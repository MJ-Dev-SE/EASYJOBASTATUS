import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { JobApplication, ApplicationStatus } from '../types';
import { toast } from 'react-hot-toast';

export const useApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      toast.error(`Fetch failed: ${error.message}`);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const addApplication = async (app: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{ ...app, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to add application');
      return null;
    } else if (data) {
      setApplications([data, ...applications]);
      toast.success('Application added!');
      
      // Auto-timeline entry
      await supabase.from('application_timeline').insert([{
        application_id: data.id,
        user_id: user.id,
        action: 'Application Created',
        notes: `Initial status: ${app.status}`
      }]);
      
      return data;
    }
    return null;
  };

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
      toast.success('Status updated');
      
      // Add to timeline
      if (user) {
        await supabase.from('application_timeline').insert([{
          application_id: id,
          user_id: user.id,
          action: 'Status Updated',
          notes: `Changed status to ${status}`
        }]);
      }
    }
  };

  const deleteApplication = async (id: string) => {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete application');
    } else {
      setApplications(applications.filter(app => app.id !== id));
      toast.success('Application deleted');
    }
  };

  return {
    applications,
    loading,
    addApplication,
    updateStatus,
    deleteApplication,
    refresh: fetchApplications
  };
};
