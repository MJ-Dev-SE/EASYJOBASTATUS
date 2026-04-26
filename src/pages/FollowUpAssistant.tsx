import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  Copy, 
  MessageSquare, 
  AlertCircle, 
  Clock,
  ArrowRight,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ai } from '../lib/gemini';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

interface FollowUpTemplates {
  followup_email_1: string;
  followup_email_2: string;
  linkedin_message: string;
  thank_you_email: string;
  final_closeout: string;
}

export const FollowUpAssistant: React.FC = () => {
  const location = useLocation();
  const initialAppId = (location.state as { appId?: string })?.appId || '';
  
  const { applications, loading: appsLoading } = useApplications();
  const [selectedAppId, setSelectedAppId] = useState(initialAppId);
  const [loading, setLoading] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [templates, setTemplates] = useState<FollowUpTemplates | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackStars, setFeedbackStars] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { user } = useAuth();

  const handleFeedbackSubmit = async () => {
    if (!user || !selectedApp) return;
    if (feedbackStars === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase.from('follow_up_feedback').insert({
        user_id: user.id,
        application_id: selectedApp.id,
        original_instruction: revisionPrompt,
        feedback_text: feedbackComment,
        stars: feedbackStars,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setFeedbackOpen(false);
      setFeedbackStars(0);
      setFeedbackComment('');
    } catch (error) {
      toast.error('Failed to save feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const selectedApp = applications.find(a => a.id === selectedAppId);

  const handleGenerate = async () => {
    if (!selectedApp) {
      toast.error('Please select an application first');
      return;
    }

    setLoading(true);
    setTemplates(null);
    setFeedbackOpen(false); // Close feedback when regenerating

    const daysSince = Math.floor((Date.now() - new Date(selectedApp.application_date).getTime()) / (1000 * 3600 * 24));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate follow-up message templates for a job application.
        Company: ${selectedApp.company_name}
        Position: ${selectedApp.job_position}
        Days Since Applied: ${daysSince}
        ${revisionPrompt ? `User's Special Instructions: ${revisionPrompt}` : ''}`,
        config: {
          systemInstruction: `You are a professional career coach. Generate follow-up message templates for a job application.
          
          CRITICAL INSTRUCTION FOR CUSTOM PROMPTS:
          If the user provides "User's Special Instructions", YOU MUST PRIORITIZE THESE OVER ALL OTHER DEFAULTS.
          - If the instructions specify a tone for a specific section, apply it ONLY to that exactly specified section.
          - RETAIN the default professional tone for all other templates unless specifically instructed otherwise.
          - Ensure responses are HIGHLY SPECIFIC to the position and company.
          - AVOID generic "I am writing to follow up" openings.
          - INTEGRATE feedback from User's Special Instructions into the word choice.

          Return the templates in JSON format with these exact keys:
          - followup_email_1 (Day 5-7)
          - followup_email_2 (Day 10-14)
          - linkedin_message
          - thank_you_email
          - final_closeout`,
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      const parsedTemplates = JSON.parse(text);
      setTemplates(parsedTemplates);
      toast.success('Templates generated!');
    } catch (error) {
       console.error('AI Error:', error);
       toast.error('Failed to generate templates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (appsLoading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
          <Mail className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Follow-Up Assistant</h1>
          <p className="text-slate-500">AI-powered communication templates optimized for recruiter response.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Selector Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-wider text-slate-400">Step 1: Select Job</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">Choose an application...</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company_name} - {app.job_position}
                  </option>
                ))}
              </select>

              {selectedApp && (
                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Timeline Status</span>
                    <span className="text-primary-600">Active</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                     <Clock className="h-4 w-4 text-slate-400" />
                     <span className="text-sm font-bold text-slate-700">Applied {Math.floor((Date.now() - new Date(selectedApp.application_date).getTime()) / (1000 * 3600 * 24))} days ago</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3" />
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm placeholder:text-slate-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 min-h-[100px]"
                      placeholder="e.g. 'Make it more casual', 'Mention my interest in their sustainability goals'"
                      value={revisionPrompt}
                      onChange={(e) => setRevisionPrompt(e.target.value)}
                    />
                  </div>

                  <Button className="w-full gap-2 h-11" onClick={handleGenerate} isLoading={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {templates ? 'Regenerate Strategy' : 'Generate Templates'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
             <CardContent className="pt-6">
                <div className="flex gap-3">
                   <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                   <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wider">Communication Rules</p>
                </div>
                <ul className="mt-4 space-y-2 text-xs font-medium text-amber-700">
                   <li>• Send max 2-3 follow-ups total.</li>
                   <li>• Wait at least 5 business days between.</li>
                   <li>• Always be professional and concise.</li>
                   <li>• Respect the recruiter's time.</li>
                </ul>
             </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {!templates && !loading && (
            <div className="flex h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <Mail className="mb-4 h-16 w-16 text-slate-100" />
              <h3 className="text-xl font-bold text-slate-800 font-serif">Strategy Pending</h3>
              <p className="mt-2 max-w-sm text-sm font-medium text-slate-400">
                Select a job application to generate optimized follow-up and outreach templates.
              </p>
            </div>
          )}

          {loading && (
             <div className="flex h-[500px] flex-col items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 animate-pulse">
                <Spinner size="lg" />
                <p className="mt-4 font-bold text-slate-900 tracking-tight">AI is drafting your strategy...</p>
             </div>
          )}

          {templates && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               {/* Feedback Section */}
               <Card className="bg-slate-50 border-slate-200">
                  <button 
                    onClick={() => setFeedbackOpen(!feedbackOpen)}
                    className="flex w-full items-center justify-between p-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="h-5 w-5 text-primary-500" />
                      <span className="font-bold text-slate-700">How was the AI response?</span>
                    </div>
                    {feedbackOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {feedbackOpen && (
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-200 mt-2">
                       <p className="text-sm font-medium text-slate-500">Your feedback helps us refine the specific tone and accuracy of instructions.</p>
                       
                       <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star} 
                              onClick={() => setFeedbackStars(star)}
                              className={`transition-all ${feedbackStars >= star ? 'text-amber-400 scale-110' : 'text-slate-300'}`}
                            >
                              <Star className="h-6 w-6 fill-current" />
                            </button>
                          ))}
                       </div>

                       <textarea
                         className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-primary-500 focus:outline-none min-h-[80px]"
                         placeholder="What could be better? (e.g., 'The first email was still too formal', 'Did not follow the sarcastic prompt')"
                         value={feedbackComment}
                         onChange={(e) => setFeedbackComment(e.target.value)}
                       />

                       <Button 
                         size="sm" 
                         className="w-full h-10" 
                         onClick={handleFeedbackSubmit}
                         isLoading={isSubmittingFeedback}
                       >
                         Submit Feedback
                       </Button>
                    </div>
                  )}
               </Card>

              <div className="grid grid-cols-1 gap-6">
                <TemplateCard title="First Follow-Up (Day 5-7)" content={templates.followup_email_1} onCopy={() => copyToClipboard(templates.followup_email_1)} color="blue" />
                <TemplateCard title="Second Follow-Up (Day 10-14)" content={templates.followup_email_2} onCopy={() => copyToClipboard(templates.followup_email_2)} color="indigo" />
                <TemplateCard title="LinkedIn Outreach" content={templates.linkedin_message} onCopy={() => copyToClipboard(templates.linkedin_message)} color="teal" />
                <TemplateCard title="Post-Interview Thank You" content={templates.thank_you_email} onCopy={() => copyToClipboard(templates.thank_you_email)} color="emerald" />
                <TemplateCard title="Final Polite Close-Out" content={templates.final_closeout} onCopy={() => copyToClipboard(templates.final_closeout)} color="slate" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplateCard = ({ title, content, onCopy, color }: any) => {
  const colors = {
    blue: 'border-l-blue-500',
    indigo: 'border-l-indigo-500',
    teal: 'border-l-teal-500',
    emerald: 'border-l-emerald-500',
    slate: 'border-l-slate-400',
  };

  return (
    <Card className={`border-l-4 ${colors[color]} shadow-md`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          {title}
          <Button variant="ghost" size="sm" onClick={onCopy} className="text-primary-600 hover:bg-primary-50">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-xl bg-slate-50 p-4 border border-slate-100">
          <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-slate-600 leading-relaxed">
            {content}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
