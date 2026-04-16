import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Building2, Users, CreditCard, FileEdit, Loader2, Trash2, Plus, X, Copy, Mail, ShieldAlert } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useAccountStore } from '../../store/useAccountStore';
import { useTeamStore } from '../../store/useTeamStore';
import { useAuditStore } from '../../store/useAuditStore';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('workspace');
  const { addToast } = useToast();
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { accounts, fetchAccounts } = useAccountStore();
  const { members, invites, fetchMembers, fetchInvites, inviteMember, revokeInvite, removeMember } = useTeamStore();
  const { logs, fetchLogs } = useAuditStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data States
  const [isLoading, setIsLoading] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsTimezone, setWsTimezone] = useState('');
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  // Modals/Forms State
  const [clTitle, setClTitle] = useState('');
  const [clDesc, setClDesc] = useState('');
  const [clTag, setClTag] = useState('Feature');
  const [isAddingCl, setIsAddingCl] = useState(false);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [accArr, setAccArr] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const [accountSorting, setAccountSorting] = useState<SortingState>([]);

  const tabs = [
    { id: 'workspace', name: 'Workspace', icon: Building2 },
    { id: 'team', name: 'Team Members', icon: Users },
    { id: 'accounts', name: 'Manage Accounts', icon: Building2 },
    { id: 'billing', name: 'Billing & Quotas', icon: CreditCard },
    { id: 'changelog', name: 'Changelog', icon: FileEdit },
    { id: 'audit', name: 'Audit Logs', icon: ShieldAlert },
  ];

  const fetchChangelogs = async () => {
    if (!activeWorkspace) return;
    const { data, error } = await supabase.from('changelogs').select('*').eq('workspace_id', activeWorkspace.id).order('created_at', { ascending: false });
    if (!error && data) setChangelogs(data);
  };

  const fetchSubscription = async () => {
    if (!activeWorkspace) return;
    const { data } = await supabase.from('workspace_subscriptions').select('*').eq('workspace_id', activeWorkspace.id).single();
    if (data) setSubscription(data);
  };

  useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name);
      setWsTimezone(activeWorkspace.timezone);
      fetchAccounts(activeWorkspace.id);
      fetchMembers(activeWorkspace.id);
      fetchInvites(activeWorkspace.id);
      fetchChangelogs();
      fetchSubscription();
      fetchLogs(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchAccounts, fetchMembers, fetchInvites, fetchLogs]);

  // Handle Stripe Checkout Success Redirect
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      addToast("Subscription upgraded successfully!", "success");
      setSearchParams({});
      setActiveTab('billing');
      fetchSubscription();
    }
  }, [searchParams, addToast, setSearchParams]);

  const handleUpdateWorkspace = async () => {
    if (!activeWorkspace) return;
    const { error } = await supabase.from('workspaces').update({ name: wsName, timezone: wsTimezone }).eq('id', activeWorkspace.id);
    if (error) addToast(error.message, "error");
    else { addToast("Workspace updated", "success"); refreshWorkspaces(); }
  };

  const handleAddChangelog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !clTitle) return;
    setIsAddingCl(true);
    const { error } = await supabase.from('changelogs').insert({ workspace_id: activeWorkspace.id, title: clTitle, description: clDesc, tag: clTag });
    setIsAddingCl(false);
    if (error) addToast(error.message, "error");
    else { addToast("Changelog entry added", "success"); setClTitle(''); setClDesc(''); fetchChangelogs(); }
  };

  const handleDeleteChangelog = async (id: string) => {
    const { error } = await supabase.from('changelogs').delete().eq('id', id);
    if (error) addToast(error.message, "error");
    else { addToast("Changelog deleted", "success"); fetchChangelogs(); }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !accName) return;
    setIsSavingAccount(true);
    const { error } = await supabase.from('accounts').insert({ workspace_id: activeWorkspace.id, name: accName, arr: parseFloat(accArr) || 0 });
    setIsSavingAccount(false);
    if (error) addToast(error.message, "error");
    else { addToast(`Account added successfully`, "success"); setIsAccountModalOpen(false); fetchAccounts(activeWorkspace.id); }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail) return;
    setIsSendingInvite(true);
    try {
      await inviteMember(activeWorkspace.id, inviteEmail, inviteRole);
      addToast("Invitation sent successfully", "success");
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (error: any) {
      addToast(error.message || "Failed to send invitation", "error");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    addToast("Invite link copied to clipboard", "success");
  };

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  const columnHelper = createColumnHelper<any>();
  const accountColumns = useMemo(() => [
    columnHelper.accessor('name', { header: 'Name', cell: info => <span className="font-bold text-gray-900">{info.getValue()}</span> }),
    columnHelper.accessor('arr', { header: 'ARR', cell: info => <span className="font-mono font-bold text-astrix-teal">{formatCurrency(info.getValue() || 0)}</span> }),
  ], []);

  const accountTable = useReactTable({
    data: accounts, columns: accountColumns, state: { sorting: accountSorting },
    onSortingChange: setAccountSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  });

  // Calculate granular quota percentages
  const clusteringPct = subscription ? Math.min(100, (subscription.ai_clustering_used / subscription.ai_clustering_limit) * 100) : 0;
  const askPct = subscription ? Math.min(100, (subscription.ai_ask_used / subscription.ai_ask_limit) * 100) : 0;
  const artifactPct = subscription ? Math.min(100, (subscription.ai_artifact_used / subscription.ai_artifact_limit) * 100) : 0;

  return (
    <AppLayout title="Settings">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 flex md:flex-col overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === tab.id ? 'bg-white text-astrix-teal shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 min-h-[600px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-astrix-teal" /></div>
          ) : (
            <>
              {activeTab === 'workspace' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Workspace Details</h3>
                  <div className="space-y-6 max-w-md mb-12">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Workspace Name</label>
                      <input type="text" value={wsName} onChange={e => setWsName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Timezone</label>
                      <select value={wsTimezone} onChange={e => setWsTimezone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      </select>
                    </div>
                    <button onClick={handleUpdateWorkspace} className="bg-astrix-teal text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-700 transition-colors">Save Changes</button>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-heading text-xl font-bold text-gray-900">Team Members</h3>
                    <button onClick={() => setIsInviteModalOpen(true)} className="text-sm font-bold text-white bg-astrix-teal px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="w-4 h-4"/> Invite Member</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Active Members ({members.length})</h4>
                      <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                        {members.map(member => (
                          <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                {member.users?.full_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{member.users?.full_name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{member.users?.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">{member.role}</span>
                              <button onClick={() => removeMember(member.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {invites.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 mt-8">Pending Invites ({invites.length})</h4>
                        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                          {invites.map(invite => (
                            <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">{invite.email}</div>
                                  <div className="text-xs text-gray-500">Expires {new Date(invite.expires_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded mr-2">{invite.role}</span>
                                <button onClick={() => copyInviteLink(invite.token)} className="p-2 text-gray-500 hover:text-brand-blue bg-white border border-gray-200 rounded-md shadow-sm" title="Copy Link"><Copy className="w-4 h-4"/></button>
                                <button onClick={() => revokeInvite(invite.id)} className="p-2 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-md shadow-sm" title="Revoke"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-heading text-xl font-bold text-gray-900">Manage Accounts</h3>
                    <div className="flex gap-2">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))} className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">Upload CSV</button>
                      <button onClick={() => {setAccName(''); setAccArr(''); setIsAccountModalOpen(true);}} className="text-sm font-bold text-white bg-astrix-teal px-3 py-1.5 rounded-lg hover:bg-teal-700 flex items-center gap-1"><Plus className="w-4 h-4"/> Add Account</button>
                    </div>
                  </div>
                  {accounts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No accounts found. Upload a CSV or add one manually.</div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 font-mono text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          {accountTable.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map(header => (
                                <th key={header.id} className="p-4 font-semibold cursor-pointer hover:bg-gray-100" onClick={header.column.getToggleSortingHandler()}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {accountTable.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Billing & Quotas</h3>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-mono text-gray-500 uppercase font-bold mb-1">Current Plan</div>
                      <div className="text-2xl font-heading font-black text-gray-900 flex items-center gap-2 capitalize">
                        {subscription?.plan_type || 'Free'} <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full uppercase tracking-widest font-bold">Active</span>
                      </div>
                    </div>
                    <Link to="/pricing" className="bg-astrix-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-700">Upgrade Plan</Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Clustering Quota */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4">AI Clustering</h4>
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>{subscription?.ai_clustering_used || 0} Used</span>
                        <span>{subscription?.ai_clustering_limit || 10} Limit</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${clusteringPct > 90 ? 'bg-red-500' : 'bg-astrix-teal'}`} style={{ width: `${clusteringPct}%` }}></div>
                      </div>
                    </div>

                    {/* Ask AI Quota */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4">Ask AI Queries</h4>
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>{subscription?.ai_ask_used || 0} Used</span>
                        <span>{subscription?.ai_ask_limit || 50} Limit</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${askPct > 90 ? 'bg-red-500' : 'bg-astrix-teal'}`} style={{ width: `${askPct}%` }}></div>
                      </div>
                    </div>

                    {/* Artifacts Quota */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4">Artifact Generation</h4>
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>{subscription?.ai_artifact_used || 0} Used</span>
                        <span>{subscription?.ai_artifact_limit || 20} Limit</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${artifactPct > 90 ? 'bg-red-500' : 'bg-astrix-teal'}`} style={{ width: `${artifactPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-6 font-medium text-center">Quotas reset on {new Date(subscription?.billing_period_end || Date.now()).toLocaleDateString()}</p>
                </div>
              )}

              {activeTab === 'changelog' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-heading text-xl font-bold text-gray-900">Changelog Admin</h3>
                  </div>
                  <form onSubmit={handleAddChangelog} className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                        <input type="text" required value={clTitle} onChange={e => setClTitle(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-astrix-teal" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tag</label>
                        <select value={clTag} onChange={e => setClTag(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-astrix-teal">
                          <option value="Feature">Feature</option><option value="Fix">Fix</option><option value="Improvement">Improvement</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                      <textarea required value={clDesc} onChange={e => setClDesc(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-astrix-teal min-h-[80px] resize-none"></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={isAddingCl} className="bg-astrix-teal text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-50">
                        {isAddingCl ? 'Adding...' : 'Add Entry'}
                      </button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    {changelogs.map(cl => (
                      <div key={cl.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-start hover:bg-gray-50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${cl.tag === 'Feature' ? 'bg-blue-50 text-blue-700' : cl.tag === 'Fix' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{cl.tag}</span>
                            <span className="text-xs text-gray-400 font-mono">{new Date(cl.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-gray-900">{cl.title}</h4>
                        </div>
                        <button onClick={() => handleDeleteChangelog(cl.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-heading text-xl font-bold text-gray-900">Security & Audit Logs</h3>
                  </div>
                  {logs.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No audit events recorded yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map(log => (
                        <div key={log.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">
                            {log.users?.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              <span className="font-bold">{log.users?.full_name || 'System'}</span> performed <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{log.action_type}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-2">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Account Add Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isSavingAccount && setIsAccountModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-heading text-xl font-bold text-gray-900">Add Account</h2>
              <button onClick={() => !isSavingAccount && setIsAccountModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Account Name *</label>
                <input type="text" required value={accName} onChange={e => setAccName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">ARR ($) *</label>
                <input type="number" required min="0" value={accArr} onChange={e => setAccArr(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal" />
              </div>
              <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={isSavingAccount || !accName} className="bg-astrix-teal text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                  {isSavingAccount && <Loader2 className="w-4 h-4 animate-spin"/>} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isSendingInvite && setIsInviteModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-heading text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button onClick={() => !isSendingInvite && setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Email Address *</label>
                <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-astrix-teal">
                  <option value="member">Member (Can view and edit)</option>
                  <option value="admin">Admin (Can manage settings and billing)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={isSendingInvite || !inviteEmail} className="bg-astrix-teal text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                  {isSendingInvite && <Loader2 className="w-4 h-4 animate-spin"/>} Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
