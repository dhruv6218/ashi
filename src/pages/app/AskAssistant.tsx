import React, { useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const AskAssistant = () => {
  const { activeWorkspace } = useWorkspace();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [response, setResponse] = useState<{ answer: string, sources: string[], count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = presetQuery || query;
    if (!finalQuery.trim() || !activeWorkspace) return;
    
    if (presetQuery) setQuery(presetQuery);
    setHasSearched(true);
    setIsTyping(true);
    setError(null);
    setResponse(null);

    // Simulate AI Processing Delay for Frontend Prototype
    setTimeout(() => {
      setIsTyping(false);
      setResponse({
        answer: "Based on the signals in your workspace, the most critical issue is **SAML SSO Integration Missing**, affecting $2.04M in ARR across Enterprise accounts like CloudScale Inc. \n\nUsers are explicitly stating they cannot renew contracts without Okta/Azure AD support.",
        sources: ['Semantic Vector Search'],
        count: 3
      });
    }, 1500);
  };

  const suggestions = [
    "What are my top 3 problems right now?",
    "Show evidence for Onboarding Friction",
    "List recent decisions and their linked opportunities."
  ];

  return (
    <AppLayout 
      title="Ask Assistant" 
      subtitle="Talk to your workspace data."
    >
      <div className="max-w-3xl mx-auto h-[calc(100vh-160px)] flex flex-col relative">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
          {!hasSearched ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out]">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-blue/20">
                <Sparkles className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">How can I help you build?</h2>
              <p className="text-gray-500 text-sm font-medium mb-8 max-w-md">
                Ask any question about your signals, problems, or past decisions. Every answer is backed by exact citations.
              </p>
              
              <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
                {suggestions.map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSearch(undefined, s)}
                    className="bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium text-gray-700 hover:border-brand-blue hover:shadow-md transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 pt-4">
              {/* User Message */}
              <div className="flex justify-end animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-brand-blue text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md font-medium text-sm">
                  {query}
                </div>
              </div>

              {/* AI Response */}
              {isTyping ? (
                <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                  <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : response || error ? (
                <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                  <div className="bg-white border border-gray-200 p-6 rounded-2xl rounded-tl-sm shadow-sm max-w-[90%]">
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {response && (
                      <div className="text-gray-900 text-sm leading-relaxed font-medium mb-6 whitespace-pre-wrap">
                        <span className="text-[10px] font-mono text-brand-blue uppercase tracking-widest font-bold block mb-3 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> Answer generated from {response.count} sources
                        </span>
                        {response.answer}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gray-50 pt-4 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your product data..." 
              className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl pl-5 pr-14 py-4 shadow-lg shadow-gray-200/50 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
            />
            <button 
              type="submit"
              disabled={!query.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
          <div className="text-center mt-3 text-[10px] text-gray-400 font-medium">
            AI can make mistakes. Always verify citations before making decisions.
          </div>
        </div>

      </div>
    </AppLayout>
  );
};
