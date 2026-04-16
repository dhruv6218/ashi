import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Filter, ArrowRight, Loader2, Database, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useProblemStore } from '../../store/useProblemStore';
import { useToast } from '../../contexts/ToastContext';

export const ProblemsList = () => {
  const [activeTab, setActiveTab] = useState('Active');
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { problems, isLoading, fetchProblems } = useProblemStore();
  const { addToast } = useToast();
  
  const [isClustering, setIsClustering] = useState(false);
  const [clusterResult, setClusterResult] = useState<{success: boolean} | null>(null);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProblems(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchProblems]);

  const filteredProblems = problems.filter(p => activeTab === 'All' || p.status === activeTab);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const handleRunClustering = async () => {
    if (!activeWorkspace) return;
    
    setIsClustering(true);
    setClusterResult(null);

    // Simulate AI Clustering Delay
    setTimeout(() => {
      setIsClustering(false);
      setClusterResult({ success: true });
      addToast("Signals clustered and scored successfully via AI", "success");
    }, 2000);
  };

  return (
    <AppLayout 
      title="Problems" 
      subtitle="Canonical problems clustered by AI."
      actions={
        <button 
          onClick={handleRunClustering}
          disabled={isClustering}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-brand-blue/70 transition-colors shadow-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          {isClustering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
          {isClustering ? 'AI is analyzing...' : 'Run AI Clustering'}
        </button>
      }
    >
      
      {clusterResult && (
        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">
              Successfully processed unassigned signals and updated opportunity scores.
            </span>
          </div>
          <button onClick={() => setClusterResult(null)} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'Active', 'Deferred', 'Solved'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
          <p className="font-medium text-sm">Loading problems...</p>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <Database className="w-12 h-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No problems found</h3>
          <p className="font-medium text-sm mb-4">Run AI clustering to group your signals into problems.</p>
          <button 
            onClick={handleRunClustering}
            disabled={isClustering}
            className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            {isClustering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
            Run AI Clustering
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((prob) => (
            <div 
              key={prob.id} 
              onClick={() => navigate(`/app/problems/${prob.id}`)}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-apple hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              tabIndex={0}
              role="button"
            >
              <div className={`absolute left-0 top-0 w-1 h-full ${prob.severity === 'Critical' ? 'bg-brand-red' : prob.severity === 'High' ? 'bg-orange-500' : 'bg-brand-yellow'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors">{prob.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1 line-clamp-2">{prob.description}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold shrink-0 ${
                  prob.severity === 'Critical' ? 'bg-red-100 text-red-700' : 
                  prob.severity === 'High' ? 'bg-orange-100 text-orange-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {prob.severity === 'Critical' && <AlertCircle className="w-3 h-3" />}
                  {prob.severity || 'Unrated'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-4">
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Signals</div>
                  <div className="font-bold text-gray-900">{prob.evidence_count}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Affected ARR</div>
                  <div className="font-bold text-gray-900">{formatCurrency(prob.affected_arr)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Trend</div>
                  <div className="flex items-center gap-1">
                    {prob.trend === 'Rising' ? <><TrendingUp className="w-4 h-4 text-brand-red" /><span className="font-bold text-brand-red">Rising</span></> : 
                     prob.trend === 'Declining' ? <><TrendingDown className="w-4 h-4 text-green-500" /><span className="font-bold text-green-500">Declining</span></> : 
                     <><div className="w-3 h-[2px] bg-gray-400"></div><span className="font-bold text-gray-500">Stable</span></>}
                  </div>
                </div>
              </div>

              <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-brand-blue" />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};
