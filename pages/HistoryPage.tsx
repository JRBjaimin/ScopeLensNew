import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Trash2,
  ArrowLeft,
  Zap,
  Layers,
} from "lucide-react";
import { HistoryProject } from "../types";
import {
  getHistoryProjects,
  deleteProjectFromHistory,
  getProjectFromHistory,
} from "../services/historyService";
import { Button } from "../components/Button";

const HistoryPage: React.FC = () => {
  const [historyProjects, setHistoryProjects] = useState<HistoryProject[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const projects = getHistoryProjects();
    setHistoryProjects(projects);
  };

  const handleViewProject = (projectId: string) => {
    const projectData = getProjectFromHistory(projectId);
    if (projectData) {
      // Save to current project_data and navigate
      localStorage.setItem("project_data", JSON.stringify(projectData));
      // Pass state to indicate coming from history
      navigate("/project", { state: { fromHistory: true } });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectFromHistory(projectId);
    loadHistory(); // Reload history
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTotalHours = (project: HistoryProject) => {
    return project.milestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  };

  const getTotalPrice = (project: HistoryProject) => {
    return project.milestones.reduce((sum, m) => sum + m.priceEstimate, 0);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fdfdff] selection:bg-indigo-100 font-sans">
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
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.1),transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(217,70,239,0.1),transparent_40%)]"></div>
        <div className="absolute inset-0 dot-pattern"></div>
        <div className="absolute inset-0 bg-noise"></div>
        <div className="absolute top-[-25%] right-[-15%] w-[1200px] h-[1200px] bg-gradient-to-br from-indigo-500/20 via-violet-400/15 to-transparent rounded-full blur-[140px] animate-float-slow mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[1100px] h-[1100px] bg-gradient-to-tr from-cyan-400/20 via-blue-400/15 to-transparent rounded-full blur-[140px] animate-float-reverse mix-blend-multiply"></div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 transform transition-all animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Delete Project?
              </h3>
              <p className="text-slate-500 mt-3 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full py-4 bg-red-600 hover:bg-red-700"
                onClick={() => handleDeleteProject(showDeleteConfirm)}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                className="w-full py-4"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-20 w-full">
        {/* Header */}
        <nav className="w-full flex justify-between items-center mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 bg-white text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-2.5 group cursor-default">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
                ScopeLens
              </span>
            </div>
          </div>
        </nav>

        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-4 sm:space-y-6 px-4 sm:px-0">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm">
            <HistoryIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Project History</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
            Your Analyzed Projects
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto px-4 sm:px-0">
            Access and review all your previously analyzed project documents
          </p>
        </div>

        {/* History List */}
        {historyProjects.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-2xl border border-white/90 shadow-xl rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-10 md:p-12 lg:p-16 text-center mx-4 sm:mx-0">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-10 h-10 md:w-12 md:h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              No History Yet
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              Start analyzing projects to build your history
            </p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Analyze New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-0">
            {historyProjects.map((project, index) => (
              <div
                key={project.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="bg-white/70 backdrop-blur-2xl border border-white/90 shadow-xl rounded-[1.5rem] sm:rounded-[1.75rem] md:rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-5 md:p-6 lg:p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-in slide-in-from-bottom-8 w-full"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-900 break-words leading-tight">
                        {project.fileName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(project.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Project Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-slate-600">
                        Milestones
                      </span>
                    </div>
                    <span className="text-lg font-black text-slate-900">
                      {project.milestones.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Hours
                        </span>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        {getTotalHours(project)}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Total
                        </span>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        ${getTotalPrice(project).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <Button
                  variant="primary"
                  className="w-full py-3"
                  onClick={() => handleViewProject(project.id)}
                >
                  View Project
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
