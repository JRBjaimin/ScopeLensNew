
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { parseFileWithGemini } from '../services/geminiService';
import { 
  Upload, 
  FileText, 
  File as FileIcon, 
  X, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Search, 
  LayoutDashboard, 
  FileDown,
  Info
} from 'lucide-react';

const AIButtonLoader = () => (
  <div className="flex items-center space-x-3">
    <div className="relative w-6 h-6">
      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
      <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
    <span className="font-bold tracking-wide animate-pulse">PROCESSING...</span>
  </div>
);

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid format. Please upload a PDF or Excel document.');
        setFile(null);
      }
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      const parsedData = await parseFileWithGemini(base64, file.type, file.name);
      localStorage.setItem('project_data', JSON.stringify(parsedData));
      navigate('/project');
    } catch (err: any) {
      setError('Analysis failed. Please check your network or try a different file.');
      setIsLoading(false);
    }
  };

  const howItWorksSteps = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Secure Upload",
      description: "Upload your project scope in PDF or Excel format. Our system supports high-density technical documents."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "AI Semantic Parsing",
      description: "ScopeLens uses Gemini's advanced reasoning to identify milestones, deliverables, and estimated efforts."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Interactive Analysis",
      description: "Explore your project through a structured dashboard with filtered views and detailed breakdowns."
    },
    {
      icon: <FileDown className="w-6 h-6" />,
      title: "Smart Export",
      description: "Generate professionally formatted PDF reports for clients or internal stakeholders in one click."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fdfdff] selection:bg-indigo-100 font-sans flex flex-col">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -80px) scale(1.2); }
          66% { transform: translate(-40px, 40px) scale(0.9); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, 60px) scale(1.3); }
        }
        @keyframes aurora {
          0% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(100px, 50px) rotate(180deg); }
          100% { transform: translate(0,0) rotate(360deg); }
        }
        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 22s ease-in-out infinite;
        }
        .animate-aurora {
          animation: aurora 30s linear infinite;
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3column%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
        }
        .dot-pattern {
          background-image: radial-gradient(#6366f1 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.08;
        }
        @keyframes scan { 
          0% { top: -10%; } 
          100% { top: 110%; } 
        }
      `}</style>
      
      {/* High-Contrast Vibrant Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        {/* Deep Gradient Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.1),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(217,70,239,0.1),transparent_40%)]"></div>
        
        {/* Textures */}
        <div className="absolute inset-0 dot-pattern"></div>
        <div className="absolute inset-0 bg-noise"></div>
        
        {/* Vivid Floating "Aurora" Blobs */}
        <div className="absolute top-[-25%] right-[-15%] w-[1200px] h-[1200px] bg-gradient-to-br from-indigo-500/20 via-violet-400/15 to-transparent rounded-full blur-[140px] animate-float-slow mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[1100px] h-[1100px] bg-gradient-to-tr from-cyan-400/20 via-blue-400/15 to-transparent rounded-full blur-[140px] animate-float-reverse mix-blend-multiply"></div>
        
        {/* Dynamic Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>

        {/* Accent Orbs for Depth */}
        <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-fuchsia-400/10 rounded-full blur-[100px] animate-aurora"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] animate-aurora" style={{ animationDirection: 'reverse', animationDuration: '40s' }}></div>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full p-8 md:p-12 transform transition-all animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Info className="w-3.5 h-3.5" />
                <span>The Engine Behind ScopeLens</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">How It Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {howItWorksSteps.map((step, i) => (
                <div key={i} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    {step.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{step.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button variant="primary" onClick={() => setShowHowItWorks(false)} className="px-10 py-4 rounded-2xl shadow-xl w-full sm:w-auto">
                Got it, let's start
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 flex-1 flex flex-col items-center">
        <nav className="w-full flex justify-between items-center mb-16 md:mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center space-x-2.5 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">ScopeLens</span>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="hover:text-indigo-600 transition-colors uppercase flex items-center"
            >
              <span className="hidden sm:inline">How it works</span>
              <span className="sm:hidden flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-slate-600"><Info className="w-3.5 h-3.5 mr-1.5" /> Info</span>
            </button>
          </div>
        </nav>

        <div className="text-center max-w-4xl mb-12 md:mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in-95 duration-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Analysis Studio</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black text-slate-900 leading-[1.1] md:leading-[0.95] tracking-tight animate-in slide-in-from-bottom-8 duration-700 delay-100">
            Analyze Project Docs <br />
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-sky-500 bg-clip-text text-transparent italic">in Seconds.</span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl mx-auto animate-in fade-in duration-1000 delay-300">
            Elevate your workflow. Instantly transform complex Excel or PDF scope documents into interactive, beautiful breakdowns.
          </p>
        </div>

        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-10 flex flex-col relative overflow-hidden group">
            
            {isLoading && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
                <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent top-0 animate-[scan_2s_linear_infinite] blur-xl opacity-30"></div>
                <div className="absolute inset-x-0 h-1 bg-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,1)] top-0 animate-[scan_2s_linear_infinite]"></div>
              </div>
            )}

            <div 
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-[2rem] p-8 md:p-12 text-center transition-all duration-500 cursor-pointer
                ${file ? 'border-indigo-400 bg-white/95 shadow-inner' : 'border-slate-200/80 bg-white/50 hover:border-indigo-400 hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1'}
                ${isLoading ? 'opacity-50 grayscale pointer-events-none' : ''}
              `}
            >
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.xlsx,.xls" disabled={isLoading} />
              
              {!file ? (
                <div className="space-y-6">
                  <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-white shadow-[0_12px_24px_rgba(79,70,229,0.08)] rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Drop project file here</p>
                    <p className="text-slate-400 font-semibold mt-1 text-sm">Accepts high-res PDF or Excel sheets</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 animate-in slide-in-from-bottom-4">
                    {file.type.includes('pdf') ? <FileText className="w-10 h-10 md:w-12 md:h-12" /> : <FileIcon className="w-10 h-10 md:w-12 md:h-12" />}
                  </div>
                  <div className="flex items-center space-x-3 bg-white px-6 md:px-8 py-3 md:py-4 rounded-2xl shadow-xl border border-slate-50">
                    <span className="text-base md:text-lg font-black text-slate-900 truncate max-w-[180px] md:max-w-[280px]">{file.name}</span>
                    {!isLoading && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                        className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-5 bg-red-50/90 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold tracking-tight">{error}</p>
              </div>
            )}

            <div className="mt-10 relative">
              <Button 
                className={`w-full py-6 text-lg md:text-xl tracking-tight shadow-[0_20px_40px_-10px_rgba(79,70,229,0.35)] transition-all duration-500 rounded-2xl ${isLoading ? 'bg-slate-900 overflow-hidden scale-[0.98]' : 'hover:scale-[1.02]'}`} 
                disabled={!file || isLoading} 
                onClick={handleSubmit}
              >
                {isLoading ? <AIButtonLoader /> : 'Initialize Deep Analysis'}
              </Button>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50">
            <div className="flex items-center space-x-2.5 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-900"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>High-Level Security</span></div>
            <div className="flex items-center space-x-2.5 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-900"><Cpu className="w-4 h-4 text-indigo-500" /><span>Neural Parser</span></div>
            <div className="flex items-center space-x-2.5 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-900"><Zap className="w-4 h-4 text-amber-500" /><span>Real-time Output</span></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 pointer-events-none select-none whitespace-nowrap">
        <span className="text-[7px] font-medium tracking-[0.3em] text-slate-400/10 uppercase">
          CREATED BY JAIMIN BHARUCHA
        </span>
      </div>
    </div>
  );
};

export default UploadPage;
