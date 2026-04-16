import React, { useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { TrendingUp, ArrowRight, UploadCloud, Activity, Database, CheckCircle2, Layers, AlertCircle, Rocket, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useOpportunityStore } from '../../store/useOpportunityStore';
import { useSignalStore } from '../../store/useSignalStore';
import { useProblemStore } from '../../store/useProblemStore';
import { useDecisionStore } from '../../store/useDecisionStore';
import { useLaunchStore } from '../../store/useLaunchStore';
import { Skeleton } from '../../components/ui/Skeleton';
import { AIBadge } from '../../components/ui/AIBadge';

export const Dashboard = () => {
  const { activeWorkspace } = useWorkspace();
  const { opportunities, isLoading: oppLoading, fetchOpportunities } = useOpportunityStore();
  const { signals, fetchSignals } = useSignalStore();
  const { problems, fetchProblems } = useProblemStore();
  const { decisions, fetchDecisions } = useDecisionStore();
  const { launches, fetchLaunches } = useLaunchStore();

  useEffect(() => {
    if (activeWorkspace) {
      fetchOpportunities(activeWorkspace.id);
      fetchSignals(activeWorkspace.id);
      fetchProblems(activeWorkspace.id);
      fetchDecisions(activeWorkspace.id);
      fetchLaunches(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchOpportunities, fetchSignals, fetchProblems, fetchDecisions, fetchLaunches]);

  const topOpportunities = opportunities.slice(0, 5);
  const recentDecisions = decisions.slice(0, 3);
  const activeLaunches = launches.filter(l => l.status === 'active').slice(0, 3);
  const reviewsDue = launches.filter(l => l.status === 'pending_review').slice(0, 3);
  const unmatchedSignals = signals.filter(s => !s.category).length; // Mock unmatched logic
  
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
      {unmatchedSignals > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm">
              You have {unmatchedSignals} unmatched signals. Run AI clustering to assign them to problems.
            </span>
          </div>
          <Link to="/app/problems" className="text-sm font-bold text-yellow-700 hover:text-yellow-900 underline">Run Clustering</Link>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Signal Trend Chart (Mock) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-bold text-gray-900">Signal Ingestion Trend</h2>
            <select className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-48 w-full flex items-end justify-between gap-2">
            {/* Mock Bars */}
            {[12, 19, 15, 25, 22, 30, 45, 38, 50, 42, 60, 55].map((val, i) => (
              <div key={i} className="w-full bg-brand-blue/20 rounded-t-sm hover:bg-brand-blue transition-colors relative group" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Due */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-astrix-terra" /> Reviews Due</h2>
            <Link to="/app/reviews-due" className="text-xs font-bold text-astrix-teal hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {reviewsDue.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No reviews pending.</div>
            ) : (
              reviewsDue.map(review => (
                <div key={review.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-xs font-bold text-amber-800 mb-1 line-clamp-1">{review.title}</div>
                  <div className="text-[10px] text-amber-600 font-mono">Launched {new Date(review.launched_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
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

        {/* Right Column: Active Launches & Recent Decisions */}
        <div className="lg:col-span-1 space-y-8">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2"><Rocket className="w-5 h-5 text-brand-blue" /> Active Launches</h2>
              <Link to="/app/launches" className="text-sm font-bold text-astrix-teal hover:underline">View all</Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
              {activeLaunches.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No active launches.</div>
              ) : (
                activeLaunches.map(launch => (
                  <div key={launch.id} className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-xs font-bold text-blue-900 mb-1 line-clamp-1">{launch.title}</div>
                    <div className="text-[10px] text-blue-600 font-mono">Tracking day 14 of 30</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
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
