import React, { useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { TrendingUp, ArrowRight, UploadCloud, Activity, Database, CheckCircle2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useOpportunityStore } from '../../store/useOpportunityStore';
import { useSignalStore } from '../../store/useSignalStore';
import { useProblemStore } from '../../store/useProblemStore';
import { useDecisionStore } from '../../store/useDecisionStore';
import { Skeleton } from '../../components/ui/Skeleton';
import { AIBadge } from '../../components/ui/AIBadge';

export const Dashboard = () => {
  const { activeWorkspace } = useWorkspace();
  const { opportunities, isLoading: oppLoading, fetchOpportunities } = useOpportunityStore();
  const { signals, fetchSignals } = useSignalStore();
  const { problems, fetchProblems } = useProblemStore();
  const { decisions, fetchDecisions } = useDecisionStore();

  useEffect(() => {
    if (activeWorkspace) {
      fetchOpportunities(activeWorkspace.id);
      fetchSignals(activeWorkspace.id);
      fetchProblems(activeWorkspace.id);
      fetchDecisions(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchOpportunities, fetchSignals, fetchProblems, fetchDecisions]);

  const topOpportunities = opportunities.slice(0, 5);
  const recentDecisions = decisions.slice(0, 3);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <AppLayout 
      title="Home" 
      subtitle="Your workspace overview."
    >
      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Database className="w-4 h-4 text-brand-blue" /></div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Signals</div>
          </div>
          <div className="text-3xl font-heading font-black text-gray-900">{signals.length}</div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg"><Layers className="w-4 h-4 text-orange-600" /></div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Open Problems</div>
          </div>
          <div className="text-3xl font-heading font-black text-gray-900">{problems.length}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-50 rounded-lg"><Activity className="w-4 h-4 text-astrix-teal" /></div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top Opp Score</div>
          </div>
          <div className="text-3xl font-heading font-black text-astrix-teal">{opportunities[0]?.opportunity_score || 0}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decisions Made</div>
          </div>
          <div className="text-3xl font-heading font-black text-gray-900">{decisions.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        {/* Top Opportunities */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-gray-900">Top Opportunities</h2>
            <Link to="/app/opportunities" className="text-sm font-bold text-astrix-teal hover:underline">View all</Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {oppLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            ) : topOpportunities.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium">
                No opportunities scored yet. Upload signals and run AI clustering.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topOpportunities.map((opp, i) => (
                  <div key={opp.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-8 text-center font-mono font-bold text-gray-400">#{i + 1}</div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-heading font-black text-xl ${opp.opportunity_score >= 80 ? 'bg-astrix-teal text-white shadow-md' : opp.opportunity_score >= 60 ? 'bg-astrix-gold text-gray-900' : 'bg-gray-200 text-gray-600'}`}>
                        {opp.opportunity_score}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
                          {opp.problems?.title || 'Unknown Problem'} <AIBadge />
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs font-mono font-medium text-gray-500">
                          <span className={`px-2 py-0.5 rounded uppercase tracking-wider font-bold ${opp.recommended_action === 'Build' ? 'bg-blue-100 text-blue-700' : opp.recommended_action === 'Fix' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                            {opp.recommended_action || 'Review'}
                          </span>
                          <span className="text-gray-900 font-bold">{formatCurrency(opp.problems?.affected_arr || 0)} ARR</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/app/opportunities/${opp.id}`} className="hidden md:flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:border-astrix-teal hover:text-astrix-teal transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
                      View <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-gray-900">Recent Decisions</h2>
            <Link to="/app/decisions" className="text-sm font-bold text-astrix-teal hover:underline">View all</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
            {recentDecisions.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No decisions logged yet.</div>
            ) : (
              recentDecisions.map(dec => (
                <div key={dec.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${dec.action === 'Build' ? 'bg-blue-100 text-blue-700' : dec.action === 'Fix' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {dec.action}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{new Date(dec.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{dec.title}</div>
                  <Link to={`/app/decisions/${dec.id}`} className="text-xs font-bold text-astrix-teal hover:underline">View Details →</Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Upload Button */}
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
        className="fixed bottom-8 right-8 bg-astrix-teal text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-astrix-teal z-40 group"
        title="Upload Signals (N)"
      >
        <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

    </AppLayout>
  );
};
