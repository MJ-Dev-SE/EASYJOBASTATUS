import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Reminder, ReminderType } from '../types';
import { toast } from 'react-hot-toast';

export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Fetch error:', error);
      toast.error(`Fetch failed: ${error.message}`);
    } else {
      setReminders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'is_completed'>) => {
    if (!user) return;

    // Fix: Handle empty application_id as null to avoid foreign key errors
    const cleanedReminder = {
      ...reminder,
      application_id: reminder.application_id === "" ? null : reminder.application_id,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('reminders')
      .insert([cleanedReminder])
      .select()
      .single();

    if (error) {
      toast.error('Failed to add reminder');
      return null;
    } else if (data) {
      setReminders([...reminders, data].sort((a, b) => 
        new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      ));
      toast.success('Reminder scheduled!');
      return data;
    }
    return null;
  };

  const toggleComplete = async (id: string, is_completed: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_completed: !is_completed })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update reminder');
    } else {
      setReminders(reminders.map(r => r.id === id ? { ...r, is_completed: !is_completed } : r));
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete reminder');
    } else {
      setReminders(reminders.filter(r => r.id !== id));
      toast.success('Reminder removed');
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    toggleComplete,
    deleteReminder,
    refresh: fetchReminders
  };
};
