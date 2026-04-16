import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '../../layouts/OnboardingLayout';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';

export const Step3Results = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Classifying signals...",
    "Matching accounts...",
    "Clustering problems...",
    "Computing scores..."
  ];

  useEffect(() => {
    const processData = async () => {
      if (!activeWorkspace || !session) return;

      try {
        setStep(0);
        await new Promise(r => setTimeout(r, 800));
        
        setStep(1);
        await new Promise(r => setTimeout(r, 800));

        setStep(2);
        await new Promise(r => setTimeout(r, 800));

        setStep(3);
        await new Promise(r => setTimeout(r, 800));

        navigate('/app');

      } catch (err: any) {
        setError(err.message || "Failed to process data.");
        setTimeout(() => navigate('/app'), 2000);
      }
    };

    processData();
  }, [activeWorkspace, session, navigate]);

  return (
    <OnboardingLayout step={3} totalSteps={3}>
      <div className="text-center flex flex-col items-center justify-center min-h-[40vh]">
        
        <div className="relative mb-10">
          <div className="w-24 h-24 rounded-full bg-white border-2 border-brand-blue flex items-center justify-center relative shadow-[0_0_40px_rgba(26,86,255,0.3)] z-10">
            <Sparkles className="w-10 h-10 text-brand-blue animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-brand-blue/30 animate-[spin_3s_linear_infinite] border-t-transparent"></div>
          <div className="absolute -inset-4 rounded-full border-2 border-brand-blue/10 animate-[spin_4s_linear_infinite_reverse] border-b-transparent"></div>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Analyzing Your Data...
        </h1>
        
        <div className="h-8 flex items-center justify-center">
          {error ? (
            <p className="text-red-500 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</p>
          ) : (
            <p className="text-brand-blue font-mono font-bold text-sm uppercase tracking-widest animate-[fadeIn_0.3s_ease-out]">
              {steps[step]}
            </p>
          )}
        </div>

      </div>
    </OnboardingLayout>
  );
};
