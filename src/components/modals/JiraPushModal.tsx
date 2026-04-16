import React, { useState, useEffect } from 'react';
import { X, Loader2, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useIntegrationStore } from '../../store/useIntegrationStore';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface JiraPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSummary: string;
  defaultDescription: string;
}

export const JiraPushModal: React.FC<JiraPushModalProps> = ({ isOpen, onClose, defaultSummary, defaultDescription }) => {
  const { activeWorkspace } = useWorkspace();
  const { integrations } = useIntegrationStore();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<any[]>([{ id: 'PROJ-1', name: 'Frontend App' }, { id: 'PROJ-2', name: 'Backend API' }]);
  const [issueTypes, setIssueTypes] = useState<any[]>([{ id: '10001', name: 'Epic' }, { id: '10002', name: 'Task' }]);
  
  const [selectedProject, setSelectedProject] = useState('PROJ-1');
  const [selectedIssueType, setSelectedIssueType] = useState('10001');
  const [summary, setSummary] = useState(defaultSummary);
  const [description, setDescription] = useState(defaultDescription);

  const jiraIntegration = integrations.find(i => i.provider === 'jira');

  useEffect(() => {
    if (isOpen) setSuccessUrl(null);
  }, [isOpen]);

  const handlePush = async () => {
    if (!activeWorkspace || !selectedProject || !selectedIssueType || !summary) return;
    setIsPushing(true);
    
    // Simulate Jira API Call
    setTimeout(() => {
      setIsPushing(false);
      addToast("Successfully pushed to Jira", "success");
      setSuccessUrl("https://jira.com/browse/AST-123");
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isPushing && onClose()}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" /> Push to Jira
          </h2>
          <button onClick={() => !isPushing && onClose()} className="text-gray-400 hover:text-gray-900 focus-visible:outline-none rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-astrix-teal" /></div>
          ) : !jiraIntegration || jiraIntegration.status !== 'connected' ? (
            <div className="text-center py-8">
              <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Jira is not connected</h3>
              <p className="text-sm text-gray-500 mb-6">Connect Jira in the Integrations Hub to push artifacts directly to your backlog.</p>
              <Link to="/app/integrations" onClick={onClose} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-blue transition-colors">
                Go to Integrations
              </Link>
            </div>
          ) : successUrl ? (
            <div className="text-center py-8 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">Issue Created!</h3>
              <p className="text-gray-500 font-medium mb-6 text-sm">Your artifact has been pushed to the Jira backlog.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={onClose} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                  Close
                </button>
                <a href={successUrl} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                  View in Jira
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Project</label>
                  <select 
                    value={selectedProject}
                    onChange={(e) => { setSelectedProject(e.target.value); setSelectedIssueType(''); }}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-astrix-teal"
                  >
                    <option value="">Select...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Issue Type</label>
                  <select 
                    value={selectedIssueType}
                    onChange={(e) => setSelectedIssueType(e.target.value)}
                    disabled={!selectedProject || issueTypes.length === 0}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-astrix-teal disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {issueTypes.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Summary</label>
                <input 
                  type="text" 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-astrix-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description (Markdown)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-astrix-teal min-h-[150px] resize-y font-mono"
                />
              </div>
            </div>
          )}
        </div>
        
        {!successUrl && jiraIntegration?.status === 'connected' && !isLoading && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900">Cancel</button>
            <button 
              onClick={handlePush}
              disabled={isPushing || !selectedProject || !selectedIssueType || !summary}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
            >
              {isPushing ? <Loader2 className="w-4 h-4 animate-spin"/> : <LayoutGrid className="w-4 h-4"/>} Create Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
