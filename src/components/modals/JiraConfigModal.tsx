import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, LayoutGrid } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useIntegrationStore } from '../../store/useIntegrationStore';
import { useToast } from '../../contexts/ToastContext';

interface JiraConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JiraConfigModal: React.FC<JiraConfigModalProps> = ({ isOpen, onClose }) => {
  const { activeWorkspace } = useWorkspace();
  const { integrations, updateConfig } = useIntegrationStore();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [projects] = useState<any[]>([{ id: 'PROJ-1', name: 'Frontend App' }, { id: 'PROJ-2', name: 'Backend API' }]);
  const [issueTypes] = useState<any[]>([{ id: '10001', name: 'Epic' }, { id: '10002', name: 'Task' }]);
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedIssueType, setSelectedIssueType] = useState('');

  const jiraIntegration = integrations.find(i => i.provider === 'jira');

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      if (jiraIntegration?.config) {
        setSelectedProject(jiraIntegration.config.defaultProjectId || '');
        setSelectedIssueType(jiraIntegration.config.defaultIssueTypeId || '');
      }
    }
  }, [isOpen, activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace) return;
    setIsSaving(true);
    
    // Simulate save
    setTimeout(async () => {
      await updateConfig(activeWorkspace.id, 'jira', {
        defaultProjectId: selectedProject,
        defaultIssueTypeId: selectedIssueType
      });
      addToast("Jira defaults saved successfully", "success");
      setIsSaving(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isSaving && onClose()}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-600" /> Jira Configuration
          </h2>
          <button onClick={() => !isSaving && onClose()} className="text-gray-400 hover:text-gray-900 focus-visible:outline-none rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-astrix-teal" /></div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 font-medium mb-4">
                Set default values for when you push decisions or artifacts to Jira. You can always override these at the time of creation.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Default Project</label>
                <select 
                  value={selectedProject}
                  onChange={(e) => { setSelectedProject(e.target.value); setSelectedIssueType(''); }}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Default Issue Type</label>
                <select 
                  value={selectedIssueType}
                  onChange={(e) => setSelectedIssueType(e.target.value)}
                  disabled={!selectedProject || issueTypes.length === 0}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal disabled:opacity-50"
                >
                  <option value="">Select an issue type...</option>
                  {issueTypes.map(it => (
                    <option key={it.id} value={it.id}>{it.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-astrix-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 shadow-sm hover:bg-teal-700 transition-colors"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Save Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
