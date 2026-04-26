import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Search, 
  FileSearch,
  Calendar,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JobApplication, ApplicationTimeline, ApplicationStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Spinner } from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<JobApplication | null>(null);
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    
    const [appRes, timelineRes] = await Promise.all([
      supabase.from('job_applications').select('*').eq('id', id).single(),
      supabase.from('application_timeline').select('*').eq('application_id', id).order('created_at', { ascending: false })
    ]);

    if (appRes.error || !appRes.data) {
      toast.error('Application not found');
      navigate('/applications');
    } else {
      setApp(appRes.data);
      setNotes(appRes.data.notes || '');
      setTimeline(timelineRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateStatus = async (newStatus: ApplicationStatus) => {
    if (!app || !user) return;
    
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${newStatus}`);
      
      // Add to timeline
      await supabase.from('application_timeline').insert([{
        application_id: app.id,
        user_id: user.id,
        action: 'Status Updated',
        notes: `Application moved to ${newStatus}`
      }]);
      
      fetchData();
    }
  };

  const handleSaveNotes = async () => {
    if (!app) return;
    setSavingNotes(true);
    const { error } = await supabase
      .from('job_applications')
      .update({ notes })
      .eq('id', app.id);
    
    if (error) toast.error('Failed to save notes');
    else toast.success('Notes saved');
    setSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!app || !window.confirm('Are you sure you want to delete this application?')) return;
    
    const { error } = await supabase.from('job_applications').delete().eq('id', app.id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Deleted');
      navigate('/applications');
    }
  };

  const getSuggestedAction = () => {
    if (!app) return null;
    const daysSince = Math.floor((Date.now() - new Date(app.application_date).getTime()) / (1000 * 3600 * 24));
    
    switch (app.status) {
      case 'applied':
        if (daysSince >= 14) return { text: 'Send a final follow-up or consider moving on.', type: 'warning' };
        if (daysSince >= 5) return { text: 'Time to send a polite follow-up email.', type: 'info' };
        return { text: 'Wait a few more days before following up.', type: 'neutral' };
      case 'interview':
        return { text: 'Review company background and prepare post-interview thank you note.', type: 'success' };
      case 'offer':
        return { text: 'Analyze and compare offer terms carefully.', type: 'success' };
      case 'saved':
        return { text: 'Complete your application and submit soon!', type: 'info' };
      default:
        return null;
    }
  };

  if (loading || !app) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const suggestion = getSuggestedAction();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link to="/applications" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:border-red-200" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 font-serif">{app.company_name}</h1>
                  <StatusBadge status={app.status} className="mt-1" />
                </div>
                <p className="text-xl font-medium text-slate-600">{app.job_position}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Update Status</label>
                <select 
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium shadow-sm focus:border-primary-500 focus:outline-none"
                  value={app.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as ApplicationStatus)}
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="followed_up">Followed Up</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Applied On</p>
                  <p className="font-semibold text-slate-800">{new Date(app.application_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Days Since Applied</p>
                  <p className="font-semibold text-slate-800">
                    {Math.floor((Date.now() - new Date(app.application_date).getTime()) / (1000 * 3600 * 24))} Days
                  </p>
                </div>
              </div>
            </div>

            {app.job_link && (
              <div className="mt-6">
                <a 
                  href={app.job_link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Job Posting
                </a>
              </div>
            )}
          </Card>

          {/* AI Suggestions Card */}
          {suggestion && (
            <div className={`mt-4 flex items-start gap-4 rounded-xl border p-4 shadow-sm ${
              suggestion.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              suggestion.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Next Action Recommendation</p>
                <p className="mt-1 font-medium">{suggestion.text}</p>
              </div>
            </div>
          )}

          {/* Quick AI Tools Button Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
             <Link to="/ai-fit-analyzer" state={{ company: app.company_name, position: app.job_position }}>
                <QuickTool icon={FileSearch} label="Fit Analyzer" />
             </Link>
             <Link to="/follow-up" state={{ appId: app.id }}>
                <QuickTool icon={Mail} label="Follow-Up" />
             </Link>
             <Link to="/company-research" state={{ company: app.company_name }}>
                <QuickTool icon={Search} label="Research" />
             </Link>
          </div>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notes
                <Button variant="ghost" size="sm" onClick={handleSaveNotes} isLoading={savingNotes}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                className="min-h-[200px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50/50 p-4 font-medium text-slate-700 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add interview details, recruiter contacts, or application thoughts..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" />
                History & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-center py-4 text-sm text-slate-400">No events recorded yet.</p>
              ) : (
                <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pl-8">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-white bg-primary-500 shadow-sm ring-1 ring-primary-100" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 leading-tight">{event.action}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                        {event.notes && (
                          <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 border border-slate-100">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const QuickTool = ({ icon: Icon, label }: any) => (
  <div className="glass-card flex flex-col items-center justify-center p-4 transition-all hover:bg-primary-50 hover:border-primary-200 group active:scale-95">
    <div className="mb-2 rounded-lg bg-primary-100 p-2 text-primary-600 transition-colors group-hover:bg-white">
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-primary-700">{label}</span>
  </div>
);
