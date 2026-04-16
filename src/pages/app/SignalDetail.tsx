import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Quote, Clock, Building2, Hash, AlertCircle } from 'lucide-react';
import { useSignalStore } from '../../store/useSignalStore';
import { AIBadge } from '../../components/ui/AIBadge';

export const SignalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { signals, isLoading, fetchSignals } = useSignalStore();
  const [signal, setSignal] = useState<any>(null);

  useEffect(() => {
    // In a real app, we'd fetch the specific signal. Here we just find it from the store.
    if (signals.length === 0) {
      fetchSignals('ws-1'); // Mock workspace ID
    }
  }, [signals.length, fetchSignals]);

  useEffect(() => {
    if (signals.length > 0 && id) {
      const found = signals.find(s => s.id === id);
      setSignal(found);
    }
  }, [signals, id]);

  if (isLoading || (!signal && signals.length === 0)) {
    return (
      <AppLayout title="Loading Signal...">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
      </AppLayout>
    );
  }

  if (!signal) {
    return (
      <AppLayout title="Signal Not Found">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Signal does not exist or you don't have access.</p>
          <Link to="/app/signals" className="mt-4 text-brand-blue font-bold hover:underline">← Back to Signals</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Signal Detail" 
      subtitle={`Source: ${signal.source_type}`}
      actions={
        <Link to="/app/signals" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Signals
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-100" />
            <div className="text-xs font-mono text-gray-400 uppercase font-bold mb-3">Raw Text</div>
            <p className="text-gray-900 text-lg leading-relaxed font-medium relative z-10">
              "{signal.raw_text}"
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs font-mono text-gray-500 uppercase font-bold">Normalized Summary</div>
              <AIBadge />
            </div>
            <p className="text-gray-700 text-base leading-relaxed font-medium italic">
              {signal.normalized_text || "No normalized text available."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Metadata</h3>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4"/> Account</span>
                <span className="font-bold text-gray-900">{signal.accounts?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 flex items-center gap-2"><Hash className="w-4 h-4"/> Source</span>
                <span className="font-bold text-gray-900">{signal.source_type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Severity</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${signal.severity_label === 'Critical' ? 'bg-red-50 text-brand-red' : signal.severity_label === 'High' ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                  {signal.severity_label || 'Unrated'}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Date</span>
                <span className="font-bold text-gray-900">{new Date(signal.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
