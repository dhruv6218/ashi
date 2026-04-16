import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Hash, MessageCircle, FileSpreadsheet, LayoutGrid, Loader2, Lock, Settings, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useIntegrationStore } from '../../store/useIntegrationStore';
import { JiraConfigModal } from '../../components/modals/JiraConfigModal';
import { Link } from 'react-router-dom';

export const IntegrationsHub = () => {
  const { addToast } = useToast();
  const { activeWorkspace } = useWorkspace();
  const { integrations, fetchIntegrations, connectJira, disconnectJira } = useIntegrationStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPaidPlan, setIsPaidPlan] = useState(true); // Mocked as paid for demo
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (activeWorkspace) {
        await fetchIntegrations(activeWorkspace.id);
        setIsLoading(false);
      }
    };
    init();
  }, [activeWorkspace, fetchIntegrations]);

  const jiraIntegration = integrations.find(i => i.provider === 'jira');

  const handleConnectJira = async () => {
    if (!activeWorkspace) return;
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(async () => {
      await connectJira(activeWorkspace.id);
      addToast("Jira connected successfully!", "success");
      setIsConfigModalOpen(true); 
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnectJira = async () => {
    if (!activeWorkspace) return;
    if (confirm("Are you sure you want to disconnect Jira?")) {
      await disconnectJira(activeWorkspace.id);
      addToast("Jira disconnected.", "info");
    }
  };

  const handleTestConnection = async () => {
    addToast("Testing connection...", "info");
    setTimeout(() => {
      addToast("Connection successful!", "success");
    }, 1000);
  };

  const otherIntegrations = [
    { id: 'slack', name: 'Slack Bot', icon: Hash, color: 'text-pink-600', bg: 'bg-pink-50', desc: 'Ingest feature requests directly from your internal channels.' },
    { id: 'intercom', name: 'Intercom', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'Sync customer conversations and support tickets automatically.' },
    { id: 'notion', name: 'Notion', icon: FileSpreadsheet, color: 'text-gray-900', bg: 'bg-gray-100', desc: 'Import raw user interview notes and feedback documents.' },
  ];

  return (
    <AppLayout title="Integrations Hub" subtitle="Connect your tools to ingest signals and push artifacts.">
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-astrix-teal" /></div>
      ) : (
        <div className="space-y-10">
          
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-4">Execution & Delivery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              <div className={`bg-white border rounded-2xl p-6 shadow-sm transition-all flex flex-col ${jiraIntegration ? 'border-astrix-teal shadow-md' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
                    <LayoutGrid className="w-6 h-6 text-blue-600" />
                  </div>
                  {!isPaidPlan ? (
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><Lock className="w-3 h-3"/> Paid Plan</span>
                  ) : jiraIntegration ? (
                    <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Connected</span>
                  ) : null}
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-2">Jira Cloud</h4>
                <p className="text-sm text-gray-500 mb-6 flex-1">Push decisions and generated artifacts directly to your engineering backlog as Epics or Tasks.</p>
                
                {!isPaidPlan ? (
                  <Link to="/app/settings?tab=billing" className="w-full bg-gray-900 text-white text-center text-sm font-bold py-2.5 rounded-xl shadow-sm hover:bg-brand-blue transition-colors">
                    Upgrade to Connect
                  </Link>
                ) : !jiraIntegration ? (
                  <button onClick={handleConnectJira} disabled={isConnecting} className="w-full bg-astrix-teal text-white text-sm font-bold py-2.5 rounded-xl shadow-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                    {isConnecting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Connect Jira'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button onClick={() => setIsConfigModalOpen(true)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2">
                        <Settings className="w-4 h-4"/> Configure
                      </button>
                      <button onClick={handleTestConnection} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold py-2 rounded-lg shadow-sm flex items-center justify-center gap-2" title="Test Connection">
                        <RefreshCw className="w-4 h-4"/> Test
                      </button>
                    </div>
                    <button onClick={handleDisconnectJira} className="w-full text-red-600 hover:bg-red-50 text-xs font-bold py-2 rounded-lg transition-colors">
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900">Ingestion Sources</h3>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Rolling out in phases</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherIntegrations.map((int) => (
                <div key={int.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm opacity-80 filter grayscale-[20%]">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.bg}`}>
                      <int.icon className={`w-6 h-6 ${int.color}`} />
                    </div>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-md">Coming Soon</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{int.name}</h4>
                  <p className="text-sm text-gray-500 mb-6 flex-1">{int.desc}</p>
                  <button disabled className="w-full bg-gray-50 text-gray-400 text-sm font-bold py-2.5 rounded-xl cursor-not-allowed border border-gray-100">
                    Planned
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {isConfigModalOpen && (
        <JiraConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
      )}
    </AppLayout>
  );
};
