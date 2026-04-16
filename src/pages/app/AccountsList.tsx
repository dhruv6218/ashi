import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Building2, Search, Plus, Loader2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAccountStore } from '../../store/useAccountStore';
import { Link } from 'react-router-dom';

export const AccountsList = () => {
  const { activeWorkspace } = useWorkspace();
  const { accounts, isLoading, fetchAccounts } = useAccountStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeWorkspace) {
      fetchAccounts(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchAccounts]);

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(search.toLowerCase()) || 
    (acc.domain && acc.domain.toLowerCase().includes(search.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <AppLayout 
      title="Accounts" 
      subtitle="Manage your customer accounts and ARR."
      actions={
        <div className="flex gap-2">
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))} className="text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm">
            Import CSV
          </button>
        </div>
      }
    >
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-2 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-brand-blue transition-all">
          <Search className="w-5 h-5 text-gray-400 ml-2 mr-3" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by name or domain..." 
            className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 py-1"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
          <p className="font-medium text-sm">Loading accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <Building2 className="w-12 h-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No accounts found</h3>
          <p className="font-medium text-sm mb-4">Upload your customer list to map signals to ARR.</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            Upload CSV
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 font-mono text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Account Name</th>
                  <th className="p-4 font-semibold">ARR</th>
                  <th className="p-4 font-semibold">Plan</th>
                  <th className="p-4 font-semibold">Health Score</th>
                  <th className="p-4 font-semibold">Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <Link to={`/app/accounts/${acc.id}`} className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                        {acc.name}
                      </Link>
                      {acc.domain && <div className="text-xs text-gray-500 mt-0.5">{acc.domain}</div>}
                    </td>
                    <td className="p-4 font-mono font-bold text-brand-blue">{formatCurrency(acc.arr)}</td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold">{acc.plan || 'Standard'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${acc.health_score === 'High' ? 'bg-green-100 text-green-700' : acc.health_score === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {acc.health_score || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-700">{acc.signal_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
