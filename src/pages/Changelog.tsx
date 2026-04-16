import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Sparkles, Wrench, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_CHANGELOGS } from '../lib/mockData';

export const Changelog = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: listRef, isVisible: listVisible } = useScrollReveal(0.1);

  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setChangelogs(MOCK_CHANGELOGS);
      setIsLoading(false);
    }, 800);
  }, []);

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Feature': return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'Fix': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      case 'Improvement': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'Feature': return <Sparkles className="w-3 h-3" />;
      case 'Fix': return <Wrench className="w-3 h-3" />;
      case 'Improvement': return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 pt-24 md:pt-32 pb-24 border-b border-gray-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-noise"></div>
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center relative z-10" ref={headerRef}>
          <h1 className={`font-heading text-fluid-2 leading-[0.9] tracking-tighter text-gray-900 mb-6 transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            What's <span className="text-brand-blue">New.</span>
          </h1>
          <p className={`text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto transition-all duration-700 delay-100 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            A timeline of features, fixes, and improvements we've shipped, directly driven by your feedback.
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 md:px-12 py-24" ref={listRef}>
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
        ) : changelogs.length === 0 ? (
          <div className="text-center py-20 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">Private Beta</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              We are currently in private beta. The public changelog will be populated once we open up to wider access.
            </p>
          </div>
        ) : (
          <div className={`space-y-16 relative before:absolute before:inset-0 before:ml-[23px] md:before:ml-[119px] before:h-full before:w-0.5 before:bg-gray-200 transition-all duration-1000 ${listVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            
            {changelogs.map((log) => {
              const dateStr = new Date(log.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              return (
                <div key={log.id} className="relative flex flex-col md:flex-row gap-8 md:gap-12">
                  
                  {/* Date (Desktop Left) */}
                  <div className="hidden md:block w-24 shrink-0 text-right pt-2">
                    <div className="text-sm font-mono font-bold text-gray-400">{dateStr.split(',')[0]}</div>
                    <div className="text-xs font-mono text-gray-400">{dateStr.split(',')[1]}</div>
                  </div>

                  {/* Timeline Node */}
                  <div className="absolute left-0 md:left-[120px] w-12 h-12 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center -translate-x-1/2 z-10">
                    <div className={`w-3 h-3 rounded-full ${log.tag === 'Feature' ? 'bg-brand-blue' : log.tag === 'Fix' ? 'bg-brand-red' : 'bg-green-500'}`}></div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 ml-12 md:ml-0 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-apple transition-shadow">
                    
                    <div className="md:hidden text-xs font-mono font-bold text-gray-400 mb-4">{dateStr}</div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTagStyle(log.tag)}`}>
                        {getTagIcon(log.tag)} {log.tag}
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">{log.title}</h2>
                    <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>
        )}

        <div className="mt-20 text-center">
          <Link to="/signup" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-sm">
            Want to shape our roadmap? Join Astrix <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};
