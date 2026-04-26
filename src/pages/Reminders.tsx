import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { useApplications } from '../hooks/useApplications';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ReminderType } from '../types';

export const Reminders: React.FC = () => {
  const { reminders, loading, addReminder, toggleComplete, deleteReminder } = useReminders();
  const { applications } = useApplications();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    reminder_type: 'follow_up' as ReminderType,
    label: '',
    application_id: '',
    scheduled_for: new Date().toISOString().split('T')[0] + 'T09:00'
  });

  const getReminderColor = (type: ReminderType) => {
    switch (type) {
      case 'follow_up': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'interview_prep': return 'text-indigo-500 bg-indigo-50 border-indigo-100';
      case 'research': return 'text-teal-500 bg-teal-50 border-teal-100';
      case 'update_resume': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReminder(formData);
    setIsAddModalOpen(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Smart Reminders</h1>
          <p className="text-slate-500">Don't miss a single chance. Your career tasks listed here.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Manual Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Reminders List */}
        <div className="xl:col-span-2 space-y-4">
          {reminders.length === 0 ? (
            <Card className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <Bell className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Your reminder list is clear!</h3>
              <p className="mt-1 text-slate-500">Excellent work. Add a reminder if you have tasks coming up.</p>
            </Card>
          ) : (
            reminders.map((r) => {
              const relatedApp = applications.find(a => a.id === r.application_id);
              return (
                <Card key={r.id} className={`transition-opacity ${r.is_completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleComplete(r.id, r.is_completed)}
                      className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        r.is_completed 
                        ? 'bg-primary-600 border-primary-600' 
                        : 'border-slate-200 hover:border-primary-400'
                      }`}
                    >
                      {r.is_completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getReminderColor(r.reminder_type)}`}>
                          {r.reminder_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.scheduled_for).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      
                      <h3 className={`text-lg font-bold text-slate-800 ${r.is_completed ? 'line-through decoration-slate-300' : ''}`}>
                        {r.label}
                      </h3>

                      {relatedApp && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                           <Briefcase className="h-3 w-3" />
                           {relatedApp.company_name} — {relatedApp.job_position}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => deleteReminder(r.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Sidebar Help Card */}
        <div className="space-y-6">
           <Card className="!bg-slate-900 text-white shadow-xl border-none overflow-hidden">
              <CardHeader>
                 <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                    Did you know?
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm font-medium text-slate-300">Candidates who follow up within 5-10 days are <span className="font-bold border-b border-white/30 text-white">35% more likely</span> to move to the next stage.</p>
                
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">The Golden Schedule</p>
                   
                   <div className="space-y-2">
                      <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10 border border-white/5">
                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">7d</div>
                         <div>
                            <p className="text-xs font-bold text-white">After Applying</p>
                            <p className="text-[10px] text-slate-400 italic">Send brief follow-up</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10 border border-white/5">
                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">1d</div>
                         <div>
                            <p className="text-xs font-bold text-white">After Interview</p>
                            <p className="text-[10px] text-slate-400 italic">Send thank you note</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10 border border-white/5">
                         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">14d</div>
                         <div>
                            <p className="text-xs font-bold text-white">No Response</p>
                            <p className="text-[10px] text-slate-400 italic">Final status check</p>
                         </div>
                      </div>
                   </div>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <Card className="relative w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <h2 className="mb-6 text-2xl font-bold font-serif">Schedule Reminder</h2>
             <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.reminder_type}
                    onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as any })}
                  >
                    <option value="follow_up">Follow Up</option>
                    <option value="interview_prep">Interview Prep</option>
                    <option value="research">Company Research</option>
                    <option value="update_resume">Resume Update</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">What needs doing?</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium focus:border-primary-500 focus:bg-white focus:outline-none"
                    placeholder="e.g., Send follow-up email to HR"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Link to Job (Optional)</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.application_id}
                    onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  >
                    <option value="">No linked job</option>
                    {applications.filter(a => !['rejected', 'offer'].includes(a.status)).map(app => (
                      <option key={app.id} value={app.id}>{app.company_name} — {app.job_position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Schedule For</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Schedule Notification</Button>
                </div>
             </form>
          </Card>
        </div>
      )}
    </div>
  );
};
