import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { FileSpreadsheet, LayoutGrid, ArrowRight, Blocks, Hash, MessageCircle, Github, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const IntegrationsMarketing = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal(0.1);

  // Developer-Friendly & Free to Authenticate Integrations
  const integrations = [
    { name: 'Linear', category: 'Delivery', icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Create projects and issues instantly. Developer-friendly GraphQL API.' },
    { name: 'Jira', category: 'Delivery', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Push generated Epics and sub-tasks directly to your backlog for free.' },
    { name: 'Slack', category: 'Feedback', icon: Hash, color: 'text-pink-600', bg: 'bg-pink-50', desc: 'Ingest feature requests directly from your internal or community channels.' },
    { name: 'Discord', category: 'Community', icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Pull bug reports and user feedback straight from your Discord server.' },
    { name: 'GitHub', category: 'Issues', icon: Github, color: 'text-gray-900', bg: 'bg-gray-100', desc: 'Sync GitHub Issues and Discussions to track developer feedback.' },
    { name: 'Notion', category: 'Knowledge', icon: FileText, color: 'text-gray-700', bg: 'bg-gray-100', desc: 'Import raw user interview notes and feedback documents seamlessly.' },
    { name: 'Zapier & CSV', category: 'Universal', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', desc: 'Connect to any tool via webhooks or upload raw CSV data instantly.' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 pt-24 md:pt-32 pb-24 border-b border-gray-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-noise"></div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center relative z-10" ref={headerRef}>
          <div className={`inline-flex items-center justify-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-6 border border-brand-blue/20 transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Blocks className="w-4 h-4" /> Integrations Ecosystem
          </div>
          <h1 className={`font-heading text-fluid-2 leading-[0.9] tracking-tighter text-gray-900 mb-6 transition-all duration-700 delay-100 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Connect to where <br/>
            <span className="text-brand-blue">truth lives.</span>
          </h1>
          <p className={`text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-12 transition-all duration-700 delay-200 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Astrix integrates seamlessly with modern, developer-friendly tools. Ingest signals from communities, push artifacts to engineering, and map everything to your workflow.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24" ref={gridRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((int, i) => (
            <div 
              key={i} 
              className={`bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-apple hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden ${gridVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${int.bg} shadow-sm`}>
                  <int.icon className={`w-7 h-7 ${int.color}`} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {int.category}
                </span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">{int.name}</h3>
              <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                {int.desc}
              </p>
              <Link to="/signup" className="text-brand-blue font-bold flex items-center gap-2 group-hover:gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-sm w-max">
                Connect {int.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className={`mt-24 bg-gray-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden transition-all duration-1000 delay-500 ${gridVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="absolute inset-0 bg-brand-blue/20 blur-[100px] rounded-full animate-pulse-slow"></div>
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Don't see your tool?</h2>
            <p className="text-gray-400 font-medium max-w-xl mx-auto mb-10 text-lg">
              Our Universal CSV Import and Webhooks let you connect Astrix to literally any data source from day one. Enterprise CRM integrations are coming in Phase 2.
            </p>
            <Link to="/signup" className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-blue hover:text-white transition-all duration-300 shadow-lg hover:shadow-glow-blue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
