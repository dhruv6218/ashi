import React, { useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { ClipboardCheck, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLaunchStore } from '../../store/useLaunchStore';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const ReviewsDue = () => {
  const { activeWorkspace } = useWorkspace();
  const { launches, fetchLaunches } = useLaunchStore();

  useEffect(() => {
    if (activeWorkspace) {
      fetchLaunches(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchLaunches]);

  const pendingReviews = launches.filter(l => l.status === 'pending_review');

  return (
    <AppLayout 
      title="Reviews Due" 
      subtitle="Post-launch accountability and impact tracking."
    >
      <div className="bg-astrix-teal/5 border border-astrix-teal/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
          <ClipboardCheck className="w-6 h-6 text-astrix-teal" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Accountability Checkpoints</h3>
          <p className="text-sm text-gray-600 font-medium">
            These launches have passed their measurement window. Review the impact against your original hypothesis to close the loop and improve future AI scoring.
          </p>
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-2xl shadow-sm text-center p-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">All caught up!</h3>
          <p className="text-sm text-gray-500 font-medium max-w-sm">There are no launches currently pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map(launch => (
            <div key={launch.id} className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    Review Overdue
                  </span>
                  <span className="text-xs font-mono text-gray-500">Launched {new Date(launch.launched_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-1">{launch.title}</h3>
                <p className="text-sm text-gray-600 font-medium line-clamp-1">Expected: {launch.expected_outcome || 'No hypothesis recorded.'}</p>
              </div>
              <Link to={`/app/launches/${launch.id}`} className="bg-astrix-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-astrix-darkTeal transition-colors shadow-sm flex items-center gap-2 shrink-0">
                Submit Verdict <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};
