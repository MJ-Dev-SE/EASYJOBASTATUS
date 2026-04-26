import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FileSearch, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lightbulb, 
  Target,
  ChevronRight,
  BookOpen,
  Award,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
// @ts-expect-error - Vite handles ?url suffix
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { ai } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface AnalysisResult {
  compatibility_score: number;
  matching_skills: string[];
  missing_skills: string[];
  weak_areas: string[];
  keyword_suggestions: string[];
  skill_gap_recommendations: string[];
  summary: string;
}

export const AIFitAnalyzer: React.FC = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialContext = location.state as { company?: string; position?: string } | undefined;

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const extractTextFromPDF = async (file: File) => {
    setExtracting(true);
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText);
      toast.success('Resume text extracted successfully');
    } catch (error) {
      console.error('PDF Extraction Error:', error);
      toast.error('Failed to extract text from PDF. You can still paste it manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      extractTextFromPDF(file);
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
        setFileName(file.name);
        toast.success('Text file loaded');
      };
      reader.readAsText(file);
    } else {
      toast.error('Only PDF and TXT files are supported for upload');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      toast.error('Please provide both resume and job description');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following resume against the job description.
        Resume: ${resumeText}
        Job Description: ${jobDescription}`,
        config: {
          systemInstruction: `You are an expert resume analyst. Analyze the resume against the job description provided. 
          Return a detailed compatibility analysis in JSON format with the following keys:
          - compatibility_score (number 0-100)
          - matching_skills (array of strings)
          - missing_skills (array of strings)
          - weak_areas (array of strings)
          - keyword_suggestions (array of strings)
          - skill_gap_recommendations (array of strings)
          - summary (2-3 sentence string)`,
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const parsedResult = JSON.parse(text);
      setResult(parsedResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Analysis failed. Please check your API key and network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-xl">
          <FileSearch className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">AI Fit Analyzer</h1>
          <p className="text-slate-500">Compare your resume to any job description using artificial intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Input Areas */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary-500" />
                  Your Resume
                </div>
                <div className="flex gap-2">
                   <input
                     type="file"
                     className="hidden"
                     ref={fileInputRef}
                     accept=".pdf,.txt"
                     onChange={handleFileUpload}
                   />
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="h-8 text-xs gap-1.5"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={extracting}
                   >
                     {extracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                     Upload PDF/TXT
                   </Button>
                   {resumeText && (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 text-xs text-red-500 hover:bg-red-50"
                       onClick={() => {
                         setResumeText('');
                         setFileName(null);
                       }}
                     >
                       Clear
                     </Button>
                   )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {fileName && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-primary-700 border border-primary-100 animate-in fade-in zoom-in duration-300">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-bold truncate">{fileName}</span>
                  {extracting && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                </div>
              )}
              
              <div className="relative">
                {resumeText ? (
                  <div className="h-64 overflow-y-auto rounded-xl border border-dashed border-primary-200 bg-primary-50/20 p-6 transition-all">
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Resume Loaded</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                          Successfully extracted {resumeText.split(' ').length} words from your document.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs border-primary-200 text-primary-700 hover:bg-primary-100"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-64 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary-400 transition-all flex flex-col items-center justify-center group"
                  >
                    <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:scale-110 transition-all">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-bold text-slate-600">Click to upload resume</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or TXT files supported</p>
                    </div>
                  </div>
                )}

                {extracting && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-20">
                      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
                         <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                         <span className="text-sm font-bold text-slate-800 font-serif">Deep Scanning...</span>
                      </div>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-500" />
                Target Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="h-64 w-full rounded-xl border border-slate-200 bg-slate-50/30 p-4 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                placeholder="Paste the job requirements and description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 px-2">
                   <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0">1</div>
                   <div className={`h-0.5 flex-1 ${resumeText ? 'bg-primary-500' : 'bg-slate-100'}`} />
                   <div className={`flex h-6 w-6 items-center justify-center rounded-full ${resumeText ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'} shrink-0`}>2</div>
                   <div className={`h-0.5 flex-1 ${jobDescription ? 'bg-primary-500' : 'bg-slate-100'}`} />
                   <div className={`flex h-6 w-6 items-center justify-center rounded-full ${jobDescription ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'} shrink-0`}>3</div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary-500/20" 
                  onClick={handleAnalyze} 
                  isLoading={loading}
                  disabled={!resumeText || !jobDescription || extracting}
                >
                  <RefreshCw className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Run AI Fit Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {!result && !loading && (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <div className="mb-4 rounded-full bg-white p-6 shadow-sm">
                <FileSearch className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Ready for Analysis</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400 font-medium leading-relaxed">
                Provide your resume and a job description to see how well you match. 
                {initialContext && ` Analyzing for ${initialContext.position} at ${initialContext.company}.`}
              </p>
            </div>
          )}

          {loading && (
            <Card className="flex h-[400px] flex-col items-center justify-center py-12 text-center animate-pulse">
              <div className="relative mb-6">
                 <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary-100 opacity-75"></div>
                 <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                    <FileSearch className="h-8 w-8 text-primary-600" />
                 </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">AI Is Analyzing...</h3>
              <p className="mt-2 text-sm font-medium text-slate-400">Comparing skills, keywords, and qualifications.</p>
            </Card>
          )}

          {result && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <Card className="border-t-8 border-primary-500 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">Compatibility Score</h2>
                        <p className="text-slate-500 text-sm font-medium">Based on your skills vs job requirements</p>
                     </div>
                     <div className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black shadow-inner ring-4 ring-white ${
                        result.compatibility_score >= 80 ? 'bg-emerald-50 text-emerald-600' :
                        result.compatibility_score >= 50 ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                     }`}>
                        {result.compatibility_score}%
                     </div>
                  </div>
                  <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 shadow-sm italic text-slate-600 leading-relaxed">
                     "{result.summary}"
                  </div>
               </Card>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResultList 
                    title="Matching Skills" 
                    items={result.matching_skills} 
                    icon={CheckCircle2} 
                    color="emerald" 
                  />
                  <ResultList 
                    title="Missing Skills" 
                    items={result.missing_skills} 
                    icon={XCircle} 
                    color="red" 
                  />
               </div>

               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Weak Areas & Keyword Suggestions
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Areas to improve</p>
                        <div className="flex flex-wrap gap-2">
                           {result.weak_areas.map((area, i) => (
                             <span key={i} className="rounded-lg bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 border border-orange-100">
                                {area}
                             </span>
                           ))}
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recommended Keywords</p>
                        <div className="flex flex-wrap gap-2">
                           {result.keyword_suggestions.map((kw, i) => (
                             <span key={i} className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-100">
                                {kw}
                             </span>
                           ))}
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="bg-primary-600 text-white">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-white">
                        <BookOpen className="h-5 w-5" />
                        Skill Gap Recommendations
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <ul className="space-y-3">
                        {result.skill_gap_recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-medium text-primary-50">
                             <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 opacity-60" />
                             {rec}
                          </li>
                        ))}
                     </ul>
                     <div className="mt-8 border-t border-primary-500 pt-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-200 mb-4">Official Training Partners</p>
                        <Button 
                          className="w-full bg-white text-primary-600 hover:bg-white/90 shadow-lg disabled:opacity-80"
                          disabled
                        >
                          <Award className="mr-2 h-5 w-5" />
                          Explore on READYSKILLED — Coming Soon
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultList = ({ title, items, icon: Icon, color }: any) => {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
         <Icon className={`h-5 w-5 ${colors[color].split(' ')[0]}`} />
         <h4 className="font-bold text-slate-800">{title}</h4>
      </div>
      <ul className="space-y-2">
         {items.map((item: string, i: number) => (
           <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600 group">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-primary-400 transition-colors" />
              {item}
           </li>
         ))}
      </ul>
    </Card>
  );
};
