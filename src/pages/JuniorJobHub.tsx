import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Search, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Trophy, 
  Sparkles,
  Filter,
  CheckCircle2,
  Code,
  Laptop,
  Cpu,
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useApplications } from '../hooks/useApplications';
import { useReminders } from '../hooks/useReminders';

interface JuniorJob {
  company: string;
  position: string;
  location: string;
  link: string;
  source: string;
  it_relevance_score: number;
  junior_friendliness_score: number;
  tags: string[];
  description_summary: string;
}

export const JuniorJobHub: React.FC = () => {
  const { addApplication } = useApplications();
  const { addReminder } = useReminders();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JuniorJob[]>([]);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  
  // New Filter States
  const [workType, setWorkType] = useState<'all' | 'remote' | 'hybrid' | 'onsite'>('all');
  const [phRegion, setPhRegion] = useState('');

  const [filters, setFilters] = useState({
    startup: true,
    noExperience: true,
    internship: false,
    trainee: false,
  });

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearch = async () => {
    if (!query && !location && !phRegion) {
      toast.error('Please enter a role or location');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const searchPrompt = `Find current IT job opportunities for fresh graduates and junior developers.
      Search query: "${query}"
      Location context: ${phRegion ? `Focusing on ${phRegion} region/province in the Philippines.` : ''} ${location ? `Specific city/area: ${location}` : ''}
      Work requirement: ${workType !== 'all' ? workType : 'Any (Remote, Hybrid, or On-site)'}
      
      CRITICAL SOURCING INSTRUCTIONS:
      1. DO NOT limit to LinkedIn. Actively source from:
         - Facebook Jobs/Tech Groups (e.g., "IT Jobs Philippines", "Startup PH Jobs")
         - Startup-specific boards (Wellfound, Tech in Asia, Bossjob)
         - Company-direct career pages (e.g., GCash, Maya, Canva PH, Accenture, etc.)
         - Community tech boards and Google-indexed public posts.
      2. PRIORITIZE these keywords: "Fresh Graduate", "Junior", "Associate", "Trainee", "0-1 years experience", "No experience required".
      3. LINK QUALITY: The links provided MUST lead directly to the specific job application form or post, NOT a general homepage.
      
      Ranking logic:
      ${filters.startup ? '- Heavy priority to Startups and tech-first companies.' : ''}
      ${filters.noExperience ? '- Priority to roles explicitly welcoming graduates.' : ''}
      - Strict IT focus: Programming, Data, Cloud, AI, QA, Cybersecurity.
      
      Return a list of 6-8 relevant, verified job openings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: searchPrompt,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        config: {
          systemInstruction: `You are the world's most intelligent Junior IT Career Assistant for the Philippines and Global markets.
          Your specialty is finding "Hidden" junior roles in startups and community groups that aren't visible on major boards.
          
          Return the results strictly in JSON format.
          The JSON must be an object with a "jobs" key containing an array of objects.
          
          Each job object must have:
          - company (string)
          - position (string)
          - location (string: include City and Province/Region)
          - link (string: DIRECT application link)
          - source (string: specific site or group name)
          - it_relevance_score (number 0-100)
          - junior_friendliness_score (number 0-100)
          - tags (array of strings: include ["FB Group", "Direct", "Startup", "Remote", etc])
          - description_summary (1 punchy sentence about the tech stack or role)
          
          Verify that every link is a direct application URL.`,
          responseMimeType: "application/json"
        }
      } as any);

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const cleanJson = text.substring(jsonStart, jsonEnd);
      
      const data = JSON.parse(cleanJson);
      setResults(data.jobs || []);
      
      if (data.jobs?.length === 0) {
        toast.error('No specific junior roles found. Try widening your search.');
      } else {
        toast.success(`Broad sourcing complete. Found ${data.jobs?.length} opportunities!`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Our AI scouts are being throttled.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JuniorJob) => {
    setIsApplying(job.link);
    
    const appData = {
      company_name: job.company,
      job_position: job.position,
      job_link: job.link,
      status: 'saved' as const,
      application_date: new Date().toISOString().split('T')[0],
      resume_version: null,
      notes: `TRACKED REDIRECT: User launched direct application to ${job.company}.\nSourced from: ${job.source}\nAI Relevance: ${job.it_relevance_score}%`
    };

    try {
      const savedApp = await addApplication(appData);
      
      if (savedApp) {
        // Auto-create a reminder to check status in 4 days
        await addReminder({
          application_id: savedApp.id,
          reminder_type: 'follow_up',
          label: `Check status: ${job.position} @ ${job.company}`,
          scheduled_for: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      toast.success('System recording application attempt...');
      setTimeout(() => {
        window.open(job.link, '_blank');
      }, 500);
    } catch (err) {
      window.open(job.link, '_blank');
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl lg:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner">
            <Rocket className="h-10 w-10 text-primary-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary-400">
              <Zap className="h-3 w-3" />
              <span>Intelligent Sourcing Engine v2</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight lg:text-5xl font-serif">Junior Job Hub</h1>
            <p className="max-w-2xl text-slate-300 font-medium leading-relaxed">
              Scanning Facebook, Startups, and Career Portals for direct application links. 
              Optimized for Philippines fresh grads and junior IT talent.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="relative lg:col-span-3">
                <Code className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Stack: React, Python, QA..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="relative lg:col-span-2">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  value={phRegion}
                  onChange={(e) => setPhRegion(e.target.value)}
                >
                  <option value="">All Regions (PH)</option>
                  <option value="NCR (Metro Manila)">Metro Manila</option>
                  <option value="Region IV-A (Calabarzon)">Calabarzon</option>
                  <option value="Region VII (Central Visayas)">Central Visayas (Cebu)</option>
                  <option value="Region XI (Davao)">Davao Region</option>
                  <option value="Province of Pampanga">Pampanga</option>
                  <option value="Province of Iloilo">Iloilo</option>
                </select>
              </div>
              <div className="relative lg:col-span-2">
                <Laptop className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                >
                  <option value="all">Any Work Type</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search City or Municipality..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs font-medium transition-all focus:border-primary-500 focus:bg-white focus:outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button size="lg" className="px-10 shadow-lg shadow-primary-500/20 md:h-10 md:py-0" onClick={handleSearch} isLoading={loading}>
                Deep Search
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mr-2">Sourcing Priorities:</span>
              <FilterTag 
                label="Startups" 
                active={filters.startup} 
                onClick={() => toggleFilter('startup')} 
                icon={Rocket}
              />
              <FilterTag 
                label="Fresh Grad / No Exp" 
                active={filters.noExperience} 
                onClick={() => toggleFilter('noExperience')} 
                icon={CheckCircle2}
              />
              <FilterTag 
                label="Internships" 
                active={filters.internship} 
                onClick={() => toggleFilter('internship')} 
                icon={Trophy}
              />
              <FilterTag 
                label="Trainee" 
                active={filters.trainee} 
                onClick={() => toggleFilter('trainee')} 
                icon={Zap}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-900 border-primary-800 text-white flex flex-col justify-center overflow-hidden">
            <CardContent className="p-6 text-center space-y-4 relative">
              <div className="absolute -right-4 -top-4 text-white/5">
                <Code className="h-24 w-24" />
              </div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 border border-primary-500/30">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-400">Direct Link AI</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Our system skips landing pages. It targets the exact application form for faster processing.
                </p>
              </div>
            </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-slate-800 font-serif">
            {loading ? 'Sourcing Opportunities...' : results.length > 0 ? 'Top Matches for You' : 'Recent Curated Jobs'}
          </h2>
          {results.length > 0 && <span className="text-xs font-bold text-slate-400">{results.length} results found</span>}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {loading ? (
            Array(4).fill(0).map((_, i) => <JobSkeleton key={i} />)
          ) : results.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {results.map((job, idx) => (
                <motion.div
                  key={job.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <JobCard job={job} onApply={handleApply} isApplying={isApplying === job.link} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">No results yet</h3>
                <p className="text-sm text-slate-500 max-w-xs">Enter a tech role or location above to discover junior-friendly IT opportunities.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {setQuery('React Developer'); setLocation('Remote');}}>Try 'React Developer'</Button>
                <Button variant="ghost" size="sm" onClick={() => {setQuery('QA Engineer'); setLocation('Manila');}}>Try 'QA Engineer'</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterTag = ({ label, active, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
      active 
        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 ring-2 ring-primary-500/20' 
        : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 shadow-sm'
    }`}
  >
    <Icon className={`h-3 w-3 ${active ? 'text-white' : 'text-slate-400'}`} />
    {label}
  </button>
);

const JobCard = ({ job, onApply, isApplying }: { job: JuniorJob, onApply: (j: JuniorJob) => void, isApplying: boolean }) => (
  <div className="group h-full relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5">
    {/* Floating IT Score */}
    <div className="absolute right-6 top-6 flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-black text-primary-700 border border-primary-100">
        <Cpu className="h-3 w-3" />
        IT: {job.it_relevance_score}%
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 border border-emerald-100">
        <ShieldCheck className="h-3 w-3" />
        Grad: {job.junior_friendliness_score}%
      </div>
    </div>

    <div className="flex-1 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="pr-16">
          <h3 className="text-lg font-bold leading-tight text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{job.position}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">{job.company}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </div>
        <div className="flex items-center gap-1">
          <ExternalLink className="h-3.5 w-3.5" />
          {job.source}
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-2">
        {job.description_summary}
      </p>

      <div className="flex flex-wrap gap-2">
        {job.tags.map(tag => (
          <span key={tag} className="inline-flex rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-100 uppercase tracking-tighter">
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="mt-6 flex items-center gap-3">
      <Button 
        className="flex-1 bg-slate-900 hover:bg-black shadow-lg" 
        onClick={() => onApply(job)}
        isLoading={isApplying}
      >
        Track & Apply
      </Button>
      <a 
        href={job.link} 
        target="_blank" 
        rel="noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary-600 transition-all shadow-sm"
      >
        <ExternalLink className="h-5 w-5" />
      </a>
    </div>
  </div>
);

const JobSkeleton = () => (
  <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/4 rounded bg-slate-200" />
      </div>
    </div>
    <div className="mt-8 space-y-3">
      <div className="h-3 w-full rounded bg-slate-200" />
      <div className="h-3 w-5/6 rounded bg-slate-200" />
    </div>
    <div className="mt-8 flex gap-3">
      <div className="h-10 flex-1 rounded-xl bg-slate-200" />
      <div className="h-10 w-10 rounded-xl bg-slate-200" />
    </div>
  </div>
);
