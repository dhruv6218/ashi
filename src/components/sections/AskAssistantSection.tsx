import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const AskAssistantSection = () => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section className="py-24 md:py-40 bg-gray-50 text-gray-900 relative border-t border-gray-200" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="text-center mb-12 md:mb-20">
          <h2 className="font-heading text-fluid-2 leading-[0.9] tracking-tighter mb-6">
            Talk to <br/><span className="text-brand-blue">Your Data.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Powered by Gemini embeddings. Ask any question, get answers backed by exact citations from your workspace.
          </p>
        </div>

        {/* Minimalist Terminal/Chat Interface (Light Mode) */}
        <div className={`max-w-4xl mx-auto bg-white shadow-2xl shadow-gray-200/60 border border-gray-200 rounded-2xl md:rounded-3xl p-6 md:p-8 font-mono text-xs md:text-sm transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          
          <div className="flex gap-2 mb-6 md:mb-8 border-b border-gray-100 pb-4">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gray-300"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gray-300"></div>
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gray-300"></div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="flex gap-3 md:gap-4">
              <span className="text-brand-blue font-bold">{'>'}</span>
              <span className="text-gray-900 font-medium">Why did we reject SSO last quarter?</span>
            </div>
            
            <div className="flex gap-3 md:gap-4">
              <span className="text-brand-yellow font-bold">~</span>
              <div className="text-gray-600 leading-relaxed font-medium">
                <span className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest block mb-2">Retrieving context from pgvector...</span>
                We rejected SSO because the Opportunity Score was only 42. According to <a href="#" className="text-brand-blue underline cursor-pointer font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-sm">Decision Memo #84</a>, it only affected $120k in ARR, and the engineering effort (3 sprints) outweighed the strategic fit.
              </div>
            </div>
            
            <div className="flex gap-3 md:gap-4 animate-pulse">
              <span className="text-brand-blue font-bold">{'>'}</span>
              <span className="w-2 h-4 md:h-5 bg-gray-400 inline-block"></span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
