import React, { useState } from 'react';
import { 
  UserSearch, 
  Linkedin, 
  Mail, 
  Globe, 
  Search, 
  AlertCircle, 
  ShieldAlert,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ai } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

interface ContactGuidance {
  hr_email_search: string;
  linkedin_search_tips: string[];
  contact_page_hint: string;
  professional_outreach_advice: string;
}

export const ContactFinder: React.FC = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContactGuidance | null>(null);

  const handleFind = async () => {
    if (!company || !role) {
      toast.error('Please enter both company and job role');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional recruiting assistant. Help the user find contact information for "${role}" at "${company}". Respond ONLY in valid JSON with no markdown, using exactly these keys:
{
  "hr_email_search": "Guide on how to find their official HR email",
  "linkedin_search_tips": ["Exact search queries for LinkedIn"],
  "contact_page_hint": "Likely URL pattern for their careers/contact page",
  "professional_outreach_advice": "Tips for first outreach"
}`
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      setResult(JSON.parse(cleanedText));
      toast.success('Search guidance generated!');
    } catch (error) {
       toast.error('Failed to generate search guidance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
          <UserSearch className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Contact Finder</h1>
          <p className="text-slate-500">Smart guidance to find official recruitment contacts without scraping.</p>
        </div>
      </div>

      <Card className="border-t-4 border-red-500">
         <CardContent className="pt-6">
            <div className="flex items-start gap-4 rounded-xl bg-red-50 p-4 border border-red-100">
               <ShieldAlert className="mt-1 h-6 w-6 text-red-500 flex-shrink-0" />
               <div>
                  <h4 className="text-sm font-bold text-red-700 uppercase tracking-widest mb-1">Privacy & Safety Enforcement</h4>
                  <p className="text-sm text-red-600/80 font-medium">
                     We never guess, scrape, or expose private personal data. We only guide you toward publicly available official channels and professional networking search strategies. Do not harvest emails for spam.
                  </p>
               </div>
            </div>
         </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              placeholder="Company (e.g. Meta)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 transition-all focus:border-primary-500 focus:bg-white focus:outline-none"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              type="text"
              placeholder="Target Role (e.g. Recruiter)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 transition-all focus:border-primary-500 focus:bg-white focus:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Button size="lg" onClick={handleFind} isLoading={loading} className="w-full">
              Find Search Guidance
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-500" />
                HR Email Search Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {result.hr_email_search}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                LinkedIn Search Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.linkedin_search_tips.map((tip, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-700 border border-slate-100">
                    {tip}
                    <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(tip);
                        toast.success('Copied query');
                    }}>
                       Copy
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Globe className="h-5 w-5 text-teal-500" />
                Contact Page Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <span className="text-sm font-bold text-teal-800">{result.contact_page_hint}</span>
                  <ExternalLink className="h-4 w-4 text-teal-400" />
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary-500" />
                Outreach Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-primary-200 pl-4 py-1">
                "{result.professional_outreach_advice}"
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
