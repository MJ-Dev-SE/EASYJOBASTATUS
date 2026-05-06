import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  ShieldCheck, 
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';
import { ai } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useApplications } from '../hooks/useApplications';
import { useReminders } from '../hooks/useReminders';

interface JobOpening {
  title: string;
  link: string;
  location: string;
  type?: string;
}

interface ResearchResult {
  overview: {
    industry: string;
    size: string;
    location: string;
    careers_url: string;
  };
  description: string;
  official_channels: string;
  legitimacy_tips: string[];
  search_guidance: string;
  recent_openings: JobOpening[];
}

export const CompanyResearch: React.FC = () => {
  const location = useLocation();
  const { addApplication } = useApplications();
  const { addReminder } = useReminders();
  const initialCompany = (location.state as { company?: string })?.company || '';

  const [companyName, setCompanyName] = useState(initialCompany);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [history, setHistory] = useState<(ResearchResult & { company: string, location?: string, timestamp: number })[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!companyName) {
      toast.error('Please enter a company name');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research the company "${companyName}" ${locationName ? `located in or with presence in "${locationName}"` : ''}. 
        Find their official careers page and at least 3-5 currently open job positions if available.
        Provide a comprehensive summary and legitimacy check.`,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        config: {
          systemInstruction: `You are a career research assistant. Provide helpful company guidance and job discovery information in JSON format.
          Use Google Search to find real, current information about the company's careers page and recent job openings.
          
          The JSON must include exactly these keys:
          - overview (object with industry, size, location, and careers_url strings)
          - description (2-3 sentences company overview)
          - official_channels (string explaining website/careers page)
          - legitimacy_tips (array of strings)
          - search_guidance (string explaining independent verification)
          - recent_openings (array of objects with title, link, and location strings)`,
          responseMimeType: "application/json"
        }
      } as any);

      const text = response.text;
      if (!text) throw new Error("No response");
      
      // Basic JSON cleaning if needed
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const cleanJson = text.substring(jsonStart, jsonEnd);
      
      const newResult = JSON.parse(cleanJson);
      setResult(newResult);
      
      const historyItem = { ...newResult, company: companyName, location: locationName, timestamp: Date.now() };
      setHistory(prev => [historyItem, ...prev]);
      
      toast.success('Research and Job Discovery completed!');
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Failed to get company information. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobOpening) => {
    setIsApplying(job.title);
    
    // 1. Create a "Saved" application automatically
    const appData = {
      company_name: companyName,
      job_position: job.title,
      job_link: job.link,
      status: 'saved' as const,
      application_date: new Date().toISOString().split('T')[0],
      resume_version: null,
      notes: `Discovered via AI Research. User redirected to application page on ${new Date().toLocaleDateString()}.`
    };

    try {
      const savedApp = await addApplication(appData);
      
      // 2. Automatically schedule a follow-up reminder (3 days from now)
      if (savedApp) {
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 3);
        
        await addReminder({
          application_id: savedApp.id,
          reminder_type: 'follow_up',
          label: `Follow up: ${job.title} at ${companyName}`,
          scheduled_for: followUpDate.toISOString(),
        });
      }

      // 3. Open link in new tab
      window.open(job.link, '_blank');
      
      toast.success('Application tracked & follow-up scheduled!');
    } catch (err) {
      console.error('Tracking failed:', err);
      // Still open link even if tracking fails, but notify
      window.open(job.link, '_blank');
      toast.error('Redirecting, but tracking failed.');
    } finally {
      setIsApplying(null);
    }
  };

  const filteredHistory = history.filter(item => 
    item.company.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.overview.industry.toLowerCase().includes(filterQuery.toLowerCase())
  );

  useEffect(() => {
    if (initialCompany) {
      handleResearch();
    }
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
          <Search className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Company Research</h1>
          <p className="text-slate-500">Get an AI-powered summary of company background and legitimacy.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="relative lg:col-span-6">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Company name (e.g. Acme Corp)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <div className="relative lg:col-span-4">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Location (e.g. New York, Remote)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <Button size="lg" className="lg:col-span-2" onClick={handleResearch} isLoading={loading}>
              Research
            </Button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50/50 p-3 border border-blue-100/50">
            <Info className="mt-0.5 h-4 w-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Note: This information is AI-generated guidance based on training knowledge. 
              Always independently verify details on official company websites.
            </p>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-2xl">{companyName} Overview</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>Clear View</Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <InfoItem icon={Globe} label="Industry" value={result.overview.industry} />
                  <InfoItem icon={Users} label="Size" value={result.overview.size} />
                  <InfoItem icon={MapPin} label="HQ/Presence" value={result.overview.location} />
                  <a href={result.overview.careers_url} target="_blank" rel="noreferrer" className="block group">
                    <div className="h-full rounded-xl border border-primary-100 bg-primary-50/50 p-4 transition-all group-hover:border-primary-300 group-hover:bg-primary-50">
                      <ExternalLink className="h-4 w-4 text-primary-500 mb-1" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Careers Page</p>
                      <p className="text-sm font-bold text-primary-600 mt-1 truncate">Visit Page</p>
                    </div>
                  </a>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Company Description</h4>
                  <p className="text-slate-700 leading-relaxed font-medium">{result.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Latest Openings</h4>
                    <span className="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full uppercase">Real-time Search</span>
                  </div>
                  
                  {result.recent_openings && result.recent_openings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {result.recent_openings.map((job, i) => (
                        <div key={i} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-300 transition-all">
                          <div>
                            <h5 className="font-bold text-slate-800 line-clamp-1">{job.title}</h5>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.location || 'Location not specified'}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="w-full text-xs" 
                              onClick={() => handleApply(job)}
                              isLoading={isApplying === job.title}
                            >
                              Track & Apply
                            </Button>
                            <a 
                              href={job.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary-600 transition-all"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                      <p className="text-sm text-slate-500 font-medium">No specific openings found. Check the careers page for the latest updates.</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-primary-100 bg-primary-50/30 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-primary-700 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    Official Verification Guidance
                  </h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{result.official_channels}</p>
                </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-amber-100 bg-amber-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <ShieldCheck className="h-5 w-5" />
                  Legitimacy & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {result.legitimacy_tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-slate-700">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-amber-100/50">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    Independent Verification
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.search_guidance}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 flex items-center justify-center p-8 border-2 border-dashed border-red-100 rounded-2xl bg-red-50/30">
             <div className="flex items-start gap-4 max-w-2xl px-6">
                <AlertTriangle className="h-10 w-10 text-red-400 flex-shrink-0" />
                <div>
                   <h4 className="text-sm font-black uppercase tracking-widest text-red-600 mb-1">Critical Safety Disclaimer</h4>
                   <p className="text-sm text-red-700/80 font-medium leading-relaxed">
                      EASYJOBAISTATUS provides AI-generated summaries for educational purposes only. Some information may be outdated or inaccurate as it depends on the AI's training data. Never provide personal sensitive data like bank info, SSN, or advance payments to any employer without thorough independent verification.
                   </p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        history.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 font-serif">Recent Research</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter history..." 
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map((item, idx) => (
                <Card 
                  key={idx} 
                  className="cursor-pointer hover:border-primary-300 transition-all group"
                  onClick={() => setResult(item)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{item.company}</h3>
                      <p className="text-xs text-slate-500 mt-1">{item.overview.industry}</p>
                      {item.location && <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="h-2 w-2" /> {item.location}</p>}
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
    <Icon className="h-4 w-4 text-primary-500 mb-1" />
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{value}</p>
  </div>
);
