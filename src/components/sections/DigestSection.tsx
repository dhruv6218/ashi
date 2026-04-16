import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { Mail, Bell } from 'lucide-react';

export const DigestSection = () => {
  const { ref, isVisible } = useScrollReveal(0.2);
  const parallaxRef = useMouseParallax(8);

  return (
    <section className="py-24 md:py-40 bg-white relative overflow-hidden border-t border-gray-100" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        
        {/* Left: Narrative */}
        <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          <div className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6 flex items-center gap-4 font-bold">
            <span className="w-8 h-[2px] bg-gray-300"></span> Phase 13: The Habit
          </div>
          <h2 className="font-heading text-fluid-2 leading-[0.9] tracking-tighter text-gray-900 mb-6 md:mb-8">
            Monday 9AM. <br/>
            <span className="text-brand-blue">Total Clarity.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium mb-8">
            Astrix isn't just a tool; it's a ritual. Every Monday morning, receive the Build Next Brief directly in your inbox or Slack.
          </p>
        </div>

        {/* Right: Email/Notification Mockup */}
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center" ref={parallaxRef as React.RefObject<HTMLDivElement>}>
          
          {/* Background Elements */}
          <div className="absolute inset-0 bg-brand-blue/5 blur-[100px] rounded-full"></div>

          {/* Main Email Card */}
          <div className={`relative z-20 w-full md:w-[90%] bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-gray-200/60 border border-gray-200 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100 rotate-[-2deg]' : 'translate-y-20 opacity-0 rotate-0'}`}>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className="font-mono text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">Your Weekly Build Next Brief</span>
            </div>
            <h3 className="font-heading text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Top Opportunities This Week</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="bg-gray-50 p-3 md:p-4 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="text-xs md:text-sm text-gray-700 font-bold">1. Onboarding Friction</span>
                <span className="text-brand-blue font-black text-sm md:text-base">Score: 92</span>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="text-xs md:text-sm text-gray-700 font-bold">2. API Rate Limits</span>
                <span className="text-yellow-600 font-black text-sm md:text-base">Score: 78</span>
              </div>
            </div>
          </div>

          {/* Floating Slack Notification */}
          <div className={`absolute -right-2 md:-right-4 bottom-10 md:bottom-20 z-30 w-64 md:w-72 bg-white rounded-2xl p-3 md:p-4 shadow-2xl shadow-gray-300/50 border border-gray-200 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100 rotate-[5deg]' : 'translate-x-20 opacity-0 rotate-0'}`}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-brand-blue" />
              </div>
              <div>
                <div className="text-gray-900 text-xs md:text-sm font-bold">Astrix Bot</div>
                <div className="text-gray-600 text-[10px] md:text-xs mt-1 font-medium leading-relaxed">New critical signal detected affecting $150k ARR.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
