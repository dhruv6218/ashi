import React, { useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Building2, ArrowLeft, Loader2, Activity, Database, AlertCircle, Rocket } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAccountStore } from '../../store/useAccountStore';
import { useSignalStore } from '../../store/useSignalStore';
import { useProblemStore } from '../../store/useProblemStore';
import { useLaunchStore } from '../../store/useLaunchStore';

export const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentAccount, isLoading, fetchAccountDetails } = useAccountStore();
  const { signals, fetchSignals } = useSignalStore();
  const { problems, fetchProblems } = useProblemStore();
  const { launches, fetchLaunches } = useLaunchStore();

  useEffect(() => {
    if (id) {
      fetchAccountDetails(id);
      fetchSignals('ws-1'); // Fetching all for mock filtering
      fetchProblems('ws-1');
      fetchLaunches('ws-1');
    }
  }, [id, fetchAccountDetails, fetchSignals, fetchProblems, fetchLaunches]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading Account...">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
      </AppLayout>
    );
  }

  if (!currentAccount) {
    return (
      <AppLayout title="Account Not Found">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Account does not exist or you don't have access.</p>
          <Link to="/app/accounts" className="mt-4 text-brand-blue font-bold hover:underline">← Back to Accounts</Link>
        </div>
      </AppLayout>
    );
  }

  // Filter mock data for this account
  const accountSignals = signals.filter(s => s.account_id === id);
  // Mocking affected problems based on signals
  const affectedProblems = problems.slice(0, 2); 
  const impactingLaunches = launches.slice(0, 1);

  return (
    <AppLayout 
      title={currentAccount.name} 
      subtitle={currentAccount.domain || 'Account Details'}
      actions={
        <Link to="/app/accounts" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Total ARR</div>
          <div className="font-heading font-black text-3xl text-brand-blue">{formatCurrency(currentAccount.arr)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Plan & Segment</div>
          <div className="font-bold text-gray-900 mt-1">{currentAccount.plan || 'Standard'}</div>
          <div className="text-xs text-gray-500 font-mono mt-1">{currentAccount.segment || 'SMB'}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Health Score</div>
          <div className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-md text-sm mt-1 ${currentAccount.health_score === 'High' ? 'bg-green-50 text-green-700' : currentAccount.health_score === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
            {currentAccount.health_score || 'Unknown'}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Total Signals</div>
          <div className="font-heading font-black text-3xl text-gray-900">{currentAccount.signal_count || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8">
          {/* Affected Problems */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-astrix-terra" /> Affected Problems
            </h3>
            <div className="space-y-3">
              {affectedProblems.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No active problems linked to this account.</div>
              ) : (
                affectedProblems.map(prob => (
                  <Link key={prob.id} to={`/app/problems/${prob.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-gray-900 text-sm">{prob.title}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prob.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{prob.severity}</span>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">{prob.description}</div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Impacting Launches */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-brand-blue" /> Impacting Launches
            </h3>
            <div className="space-y-3">
              {impactingLaunches.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">No recent launches affecting this account.</div>
              ) : (
                impactingLaunches.map(launch => (
                  <Link key={launch.id} to={`/app/launches/${launch.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-gray-900 text-sm">{launch.title}</div>
                      <span className="text-[10px] font-mono text-gray-400">{new Date(launch.launched_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-brand-blue font-bold uppercase tracking-wider">{launch.action}</div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Signals */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" /> Recent Signals
          </h3>
          <div className="space-y-4">
            {accountSignals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm font-medium">
                No signals found for this account.
              </div>
            ) : (
              accountSignals.map(sig => (
                <Link key={sig.id} to={`/app/signals/${sig.id}`} className="block p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-800 font-medium mb-2 line-clamp-2">"{sig.raw_text}"</div>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                    <span className="uppercase">{sig.source_type}</span>
                    <span>•</span>
                    <span>{new Date(sig.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
