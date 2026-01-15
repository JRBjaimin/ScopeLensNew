
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Copy, 
  FileDown, 
  Menu, 
  X,
  ChevronRight,
  Layers,
  CheckCircle2,
  Pin, 
  PinOff,
  AlertTriangle,
  Ban,
  Target,
  FileSpreadsheet,
  Calendar,
  Zap,
  Library,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ProjectData, MilestoneEntry, SortOption } from '../types';
import { Button } from '../components/Button';
import jsPDF from 'jspdf';

const ProjectPage: React.FC = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.ORDER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem('project_data');
    if (!savedData) {
      navigate('/');
      return;
    }
    const parsed = JSON.parse(savedData) as ProjectData;
    setData(parsed);
    if (parsed.milestones.length > 0) {
      setSelectedId(parsed.milestones[0].id);
    }

    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsSidebarPinned(isLarge);
      if (isLarge) setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const filteredAndSortedMilestones = useMemo(() => {
    if (!data) return [];
    
    let result = [...data.milestones].filter(m => 
      m.milestone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOption === SortOption.HOURS) {
      result.sort((a, b) => b.estimatedHours - a.estimatedHours);
    } else if (sortOption === SortOption.PRICE) {
      result.sort((a, b) => b.priceEstimate - a.priceEstimate);
    }

    return result;
  }, [data, searchTerm, sortOption]);

  const selectedMilestone = useMemo(() => {
    return data?.milestones.find(m => m.id === selectedId) || null;
  }, [data, selectedId]);

  const togglePin = () => {
    const nextPinned = !isSidebarPinned;
    setIsSidebarPinned(nextPinned);
    if (!nextPinned) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  };

  const handleCopySummary = () => {
    if (!selectedMilestone) return;
    const text = `
Milestone: ${selectedMilestone.milestone}
Title: ${selectedMilestone.title}
SCOPE:
${selectedMilestone.scope}

TASKS:
${selectedMilestone.tasks.map(t => `- ${t}`).join('\n')}

ESTIMATED HOURS: ${selectedMilestone.estimatedHours}
PRICE ESTIMATE: $${selectedMilestone.priceEstimate.toLocaleString()}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToPDF = () => {
    if (!selectedMilestone) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text(selectedMilestone.title, 20, y);
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`Milestone: ${selectedMilestone.milestone}`, 20, y);
    y += 10;
    const scopeLines = doc.splitTextToSize(selectedMilestone.scope, 170);
    doc.setFontSize(10);
    doc.text(scopeLines, 20, y);
    doc.save(`${selectedMilestone.milestone.replace(/\s+/g, '_')}_Analysis.pdf`);
  };

  const exportFullToPDF = () => {
    if (!data || !data.milestones.length) return;
    const doc = new jsPDF();
    doc.setFontSize(28);
    doc.setTextColor(79, 70, 229);
    doc.text("Project Scope Analysis", 20, 40);
    doc.save(`${data.fileName.replace(/\s+/g, '_')}_Full_Report.pdf`);
  };

  const confirmUploadNew = () => {
    localStorage.removeItem('project_data');
    navigate('/');
  };

  if (!data) return null;

  return (
    <div className="flex h-screen bg-[#fdfdff] overflow-hidden font-sans">
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
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
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
        .card-glow {
          position: relative;
        }
        .card-glow::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), transparent, rgba(14, 165, 233, 0.1));
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .card-glow:hover::after {
          opacity: 1;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* Sidebar Overlay */}
      {isSidebarOpen && !isSidebarPinned && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-opacity duration-300" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 transform transition-all animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Switching Project?</h3>
              <p className="text-slate-500 mt-3 font-medium">The current analysis will be cleared.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full py-4" onClick={confirmUploadNew}>Yes, New Session</Button>
              <Button variant="ghost" className="w-full py-4" onClick={() => setShowConfirmModal(false)}>Go Back</Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <aside className={`
        ${isSidebarPinned ? 'relative' : 'fixed inset-y-0 left-0 z-50 shadow-2xl'}
        w-[340px] bg-white/95 backdrop-blur-md border-r border-slate-100 transform transition-all duration-500 ease-in-out flex-shrink-0 flex flex-col
        ${(isSidebarOpen || isSidebarPinned) ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none lg:w-0'}
      `}>
        {/* Compact Sidebar Header */}
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5 group cursor-default">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-5.5 h-5.5 fill-current" />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">ScopeLens</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                title={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                className={`p-2 rounded-xl transition-all ${isSidebarPinned ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`} 
                onClick={togglePin}
              >
                {isSidebarPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
              </button>
              {!isSidebarPinned && (
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative group mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search milestones..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Analysis</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {(['ORDER', 'HOURS', 'PRICE'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortOption(SortOption[opt])}
                  className={`
                    py-1 px-3 rounded-md text-[9px] font-black uppercase tracking-wider transition-all
                    ${sortOption === opt ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Milestone List with bigger text */}
        <div className="flex-1 overflow-y-auto px-4 py-1 space-y-1.5 custom-scrollbar">
          {filteredAndSortedMilestones.map((m, i) => (
            <button
              key={m.id}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => { setSelectedId(m.id); if (!isSidebarPinned) setIsSidebarOpen(false); }}
              className={`w-full text-left py-3 px-4 rounded-xl transition-all relative group animate-in slide-in-from-left-4 duration-300 fill-mode-both ${selectedId === m.id ? 'bg-white shadow-lg ring-1 ring-slate-100 translate-x-1' : 'hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className={`text-[13px] font-black uppercase tracking-wide truncate mr-2 ${selectedId === m.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {m.milestone}
                </span>
                <ChevronRight className={`w-4 h-4 transition-all shrink-0 ${selectedId === m.id ? 'text-indigo-400 translate-x-1' : 'text-slate-200 group-hover:text-slate-400'}`} />
              </div>
              <div className="flex items-center space-x-4">
                 <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                   <Clock className="w-3 h-3 mr-1.5 opacity-70" /> {m.estimatedHours}h
                 </div>
                 <div className="flex items-center text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                   <DollarSign className="w-3 h-3 mr-0.5" /> ${m.priceEstimate.toLocaleString()}
                 </div>
              </div>
              {selectedId === m.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-600 rounded-r-full shadow-[1px_0_6px_rgba(79,70,229,0.3)]" />}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-4">
          <Button variant="secondary" className="w-full py-3 text-xs font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5" onClick={() => setShowConfirmModal(true)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.1),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(217,70,239,0.1),transparent_40%)]"></div>
          <div className="absolute inset-0 dot-pattern"></div>
          <div className="absolute inset-0 bg-noise"></div>
          <div className="absolute top-[-25%] right-[-15%] w-[1200px] h-[1200px] bg-gradient-to-br from-indigo-500/20 via-violet-400/15 to-transparent rounded-full blur-[140px] animate-float-slow mix-blend-multiply"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[1100px] h-[1100px] bg-gradient-to-tr from-cyan-400/20 via-blue-400/15 to-transparent rounded-full blur-[140px] animate-float-reverse mix-blend-multiply"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-[15%] left-[20%] w-96 h-96 bg-fuchsia-400/10 rounded-full blur-[100px] animate-aurora"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] animate-aurora" style={{ animationDirection: 'reverse', animationDuration: '40s' }}></div>
        </div>

        {/* Header */}
        <header className="min-h-[5.5rem] md:min-h-[7rem] bg-white/60 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 md:px-8 lg:px-12 shrink-0 z-30 py-4 md:py-6 relative transition-all">
          <div className="flex items-center space-x-4 md:space-x-6 min-w-0 flex-1">
            {(!isSidebarOpen && !isSidebarPinned) && (
              <button 
                className="p-2 md:p-3 bg-white text-slate-600 rounded-xl md:rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 shadow-sm hover:shadow-md" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-0.5 md:mb-1 animate-in slide-in-from-top duration-700">
                <FileSpreadsheet className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                <span>{data.fileName} • {selectedMilestone?.milestone}</span>
              </div>
              <h1 className="text-slate-900 font-extrabold text-lg md:text-2xl tracking-tight leading-tight block animate-in slide-in-from-left duration-500">
                {selectedMilestone?.title || 'Project Overview'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3 shrink-0 ml-4 animate-in fade-in duration-700">
            <Button variant="ghost" size="sm" onClick={handleCopySummary} className="hidden sm:flex rounded-xl px-4 hover:bg-white hover:shadow-sm">
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2 text-slate-400" />}
              <span className="font-bold text-slate-600">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2 hidden sm:block" />
            <Button variant="outline" size="sm" onClick={exportFullToPDF} className="hidden lg:flex rounded-xl px-4">
              <Library className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-bold text-slate-700">Full Report</span>
            </Button>
            <Button variant="primary" size="sm" onClick={exportToPDF} className="px-4 md:px-6 shadow-indigo-200 shadow-lg py-2.5 md:py-3 text-xs md:text-sm">
              <FileDown className="w-4 h-4 md:mr-2" /> <span className="font-bold hidden md:inline">Export PDF</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 relative z-10 custom-scrollbar pb-16">
          {selectedMilestone ? (
            <div className="max-w-5xl mx-auto flex flex-col min-h-full">
              <div className="flex-1 space-y-12 md:space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { icon: <Clock className="w-6 h-6" />, color: 'indigo', label: 'Effort Estimation', value: `${selectedMilestone.estimatedHours}`, unit: 'HOURS' },
                    { icon: <DollarSign className="w-6 h-6" />, color: 'emerald', label: 'Budget Forecast', value: `${selectedMilestone.priceEstimate.toLocaleString()}`, unit: '$', prefix: true },
                    { icon: <Calendar className="w-6 h-6" />, color: 'sky', label: 'Analysis Date', value: new Date(data.uploadDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      style={{ animationDelay: `${i * 150}ms` }}
                      className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 animate-in slide-in-from-bottom-8 fill-mode-both group card-glow"
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 bg-${stat.color}-50 rounded-xl md:rounded-2xl flex items-center justify-center text-${stat.color}-600 mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        {stat.icon}
                      </div>
                      <p className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-1 md:mb-2 tracking-widest">{stat.label}</p>
                      <div className="flex items-baseline">
                        {stat.prefix && <span className="text-lg md:text-xl font-bold text-slate-300 mr-1">{stat.unit}</span>}
                        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                        {!stat.prefix && stat.unit && <span className="text-xs md:text-sm font-bold text-slate-300 ml-2">{stat.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scope Overview */}
                <section className="animate-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center space-x-3 mb-6 md:mb-8">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Scope Overview</h3>
                  </div>
                  <div className="bg-white/40 glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm leading-relaxed text-slate-600 font-medium space-y-4 md:space-y-6 hover:shadow-lg transition-shadow duration-500 text-sm md:text-base">
                    {selectedMilestone.scope.split('\n').filter(l => l.trim()).map((line, i) => (
                      <p key={i} className="animate-in fade-in duration-1000" style={{ animationDelay: `${500 + i * 100}ms` }}>{line}</p>
                    ))}
                  </div>
                </section>

                {/* Deliverables */}
                <section className="animate-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '600ms' }}>
                  <div className="flex items-center space-x-3 mb-6 md:mb-8">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Deliverables & Tasks</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {selectedMilestone.tasks.map((task, idx) => (
                      <div 
                        key={idx} 
                        style={{ animationDelay: `${700 + idx * 50}ms` }}
                        className="bg-white/60 border border-white px-6 md:px-8 py-4 md:py-6 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center group transition-all duration-300 hover:bg-slate-900 hover:text-white hover:shadow-xl hover:translate-x-1 animate-in fade-in slide-in-from-left-4"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 mr-4 md:mr-5 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm md:text-base group-hover:text-white transition-colors duration-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Explicitly Excluded - Enhanced for visibility */}
                {selectedMilestone.exclusions.length > 0 && (
                  <section className="animate-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '800ms' }}>
                    <div className="flex items-center space-x-3 mb-6 md:mb-8">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                      <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Explicitly Excluded</h3>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl border border-rose-100 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] space-y-5 md:space-y-6 relative overflow-hidden group shadow-[0_10px_30px_-10px_rgba(244,63,94,0.15)]">
                      <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 opacity-[0.03] text-rose-600 group-hover:scale-110 transition-transform duration-700 pointer-events-none group-hover:rotate-12">
                        <Ban className="w-48 md:w-64 h-48 md:h-64" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                        {selectedMilestone.exclusions.map((ex, idx) => (
                          <div key={idx} className="flex items-start relative z-10 animate-in fade-in duration-500" style={{ animationDelay: `${900 + idx * 50}ms` }}>
                            <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 mr-4 mt-0.5 shrink-0 shadow-sm border border-rose-100/50">
                              <Ban className="w-3.5 md:w-4.5 h-3.5 md:h-4.5" />
                            </div>
                            <span className="text-slate-700 font-bold text-sm md:text-base leading-relaxed">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {data.totalBallpark && (
                  <div className="mt-16 md:mt-24 mb-12 md:mb-16 p-8 md:p-12 animate-gradient-xy bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-12 duration-1000 fill-mode-both" style={{ animationDelay: '1000ms' }}>
                    <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
                      <div className="flex items-center space-x-6 md:space-x-8">
                        <div className="hidden sm:flex w-12 h-12 md:w-14 md:h-14 bg-indigo-500/20 rounded-full items-center justify-center text-indigo-400">
                           <Target className="w-6 md:w-8 h-6 md:h-8 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-1">Final Aggregation</p>
                          <p className="text-2xl md:text-3xl font-black leading-tight tracking-tight">Project Grand Total</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-8 md:gap-12 lg:gap-16">
                        <div className="space-y-1">
                          <p className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Total Hours</p>
                          <div className="flex items-baseline group">
                            <span className="text-3xl md:text-4xl font-black group-hover:text-indigo-400 transition-colors duration-300">{data.totalBallpark.hours}</span>
                            <span className="text-base md:text-lg font-bold text-slate-500 ml-2">h</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Investment</p>
                          <div className="flex items-baseline group">
                            <span className="text-lg md:text-xl font-bold text-slate-500 mr-1">$</span>
                            <span className="text-3xl md:text-4xl font-black text-indigo-400 group-hover:text-emerald-400 transition-colors duration-300">{data.totalBallpark.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-inner">
                <Layers className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Ready for analysis</p>
                <p className="text-slate-400 font-bold text-sm md:text-base">Select a milestone from the sidebar to begin</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Attribution */}
        <div className="fixed bottom-3 right-6 z-50 pointer-events-none select-none opacity-[0.03]">
          <span className="text-[7px] font-medium tracking-[0.3em] text-slate-900 uppercase">
            CREATED BY JAIMIN BHARUCHA
          </span>
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
