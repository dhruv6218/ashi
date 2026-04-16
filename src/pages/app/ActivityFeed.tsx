import React, { useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Activity, Database, CheckCircle, Rocket, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuditStore } from '../../store/useAuditStore';

export const ActivityFeed = () => {
  const { activeWorkspace } = useWorkspace();
  const { logs, isLoading, fetchLogs } = useAuditStore();

  useEffect(() => {
    if (activeWorkspace) {
      fetchLogs(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchLogs]);

  const getIconForAction = (action: string) => {
    if (action.includes('decision')) return <CheckCircle className="w-4 h-4 text-brand-blue" />;
    if (action.includes('signal')) return <Database className="w-4 h-4 text-gray-500" />;
    if (action.includes('problem') || action.includes('cluster')) return <Sparkles className="w-4 h-4 text-astrix-teal" />;
    if (action.includes('launch')) return <Rocket className="w-4 h-4 text-astrix-terra" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AppLayout 
      title="Activity Feed" 
      subtitle="Workspace audit log and recent actions."
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading activity...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-gray-900">No activity yet</p>
            <p className="text-sm">Actions taken by your team will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map(log => (
              <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-1">
                  {getIconForAction(log.action_type)}
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">
                    <span className="font-bold">{log.users?.full_name || 'System'}</span> {log.description}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
