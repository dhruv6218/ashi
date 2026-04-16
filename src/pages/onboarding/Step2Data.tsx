import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../layouts/OnboardingLayout';
import { UploadCloud, Building2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { processAccountsCsv, processSignalsCsv } from '../../lib/csvParser';

export const Step2Data = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { session } = useAuth();
  
  const [useSampleData, setUseSampleData] = useState(false);
  
  const [signalsStats, setSignalsStats] = useState<{ rows: number } | null>(null);
  const [accountsStats, setAccountsStats] = useState<{ rows: number } | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signalInputRef = useRef<HTMLInputElement>(null);
  const accountInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'signals' | 'accounts') => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace || !session) return;

    setIsUploading(true);
    setError(null);

    try {
      if (type === 'accounts') {
        const rowsInserted = await processAccountsCsv(file, activeWorkspace.id);
        setAccountsStats({ rows: rowsInserted });
      } else if (type === 'signals') {
        const rowsInserted = await processSignalsCsv(file, activeWorkspace.id);
        setSignalsStats({ rows: rowsInserted });
      }
    } catch (err: any) {
      console.error("CSV Processing Error:", err);
      setError(err.message || 'Failed to process CSV. Please check the required headers.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleContinue = async () => {
    if (useSampleData && activeWorkspace) {
      setIsUploading(true);
      // Future: Trigger Edge Function to inject sample data
      await new Promise(r => setTimeout(r, 1000));
      setIsUploading(false);
    }
    navigate('/onboarding/step-3');
  };

  return (
    <OnboardingLayout step={2} totalSteps={3} showSkip onSkip={() => navigate('/onboarding/step-3')}>
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Upload Your First Data</h1>
        <p className="text-gray-500 text-base font-medium max-w-lg mx-auto">Astrix needs signals and account data to find patterns and calculate ARR at risk.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700 font-medium animate-[fadeIn_0.3s_ease-out]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Signals Card */}
        <div className={`bg-white p-6 rounded-3xl border transition-all duration-300 flex flex-col ${signalsStats ? 'border-green-500 shadow-sm' : 'border-gray-200 shadow-apple hover:shadow-apple-hover'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-brand-blue">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Upload Signals</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-1">Import support tickets or feedback. Required header: <code className="bg-gray-100 px-1 py-0.5 rounded">signal_text</code>.</p>
          
          <input type="file" accept=".csv" className="hidden" ref={signalInputRef} onChange={(e) => handleFileUpload(e, 'signals')} />
          
          {signalsStats ? (
            <div className="bg-green-50 text-green-700 font-bold text-sm py-3 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {signalsStats.rows} Signals Imported
            </div>
          ) : (
            <button 
              onClick={() => signalInputRef.current?.click()}
              disabled={useSampleData || isUploading}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Select CSV File'}
            </button>
          )}
        </div>

        {/* Accounts Card */}
        <div className={`bg-white p-6 rounded-3xl border transition-all duration-300 flex flex-col ${accountsStats ? 'border-green-500 shadow-sm' : 'border-gray-200 shadow-apple hover:shadow-apple-hover'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Upload Accounts</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-1">Import customers with ARR. Required: <code className="bg-gray-100 px-1 py-0.5 rounded">account_name</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">arr</code>.</p>
          
          <input type="file" accept=".csv" className="hidden" ref={accountInputRef} onChange={(e) => handleFileUpload(e, 'accounts')} />

          {accountsStats ? (
            <div className="bg-green-50 text-green-700 font-bold text-sm py-3 rounded-xl text-center border border-green-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {accountsStats.rows} Accounts Imported
            </div>
          ) : (
            <button 
              onClick={() => accountInputRef.current?.click()}
              disabled={useSampleData || isUploading}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Select CSV File'}
            </button>
          )}
        </div>

      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-sm">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">Start with sample data</h4>
          <p className="text-xs text-gray-500 mt-1">Explore ASTRIX AI with pre-populated signals and accounts.</p>
        </div>
        <button 
          onClick={() => setUseSampleData(!useSampleData)}
          className={`w-12 h-6 rounded-full relative transition-colors ${useSampleData ? 'bg-brand-blue' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useSampleData ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      <button 
        onClick={handleContinue}
        disabled={(!useSampleData && !signalsStats && !accountsStats) || isUploading}
        className="w-full flex items-center justify-center text-white bg-brand-blue hover:bg-blue-700 disabled:bg-brand-blue/50 focus-visible:ring-4 focus-visible:ring-brand-blue focus-visible:ring-offset-2 font-bold rounded-xl text-base px-5 py-4 transition-all duration-300 shadow-glow-blue btn-shine outline-none h-[56px]"
      >
        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Analysis'}
      </button>
    </OnboardingLayout>
  );
};
