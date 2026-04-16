import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Search, Hash, MessageCircle, Github, AlertCircle, X, FileSpreadsheet, Database, UploadCloud } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useSignalStore, Signal } from '../../store/useSignalStore';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { AIBadge } from '../../components/ui/AIBadge';
import { useToast } from '../../contexts/ToastContext';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

export const SignalExplorer = () => {
  const { activeWorkspace } = useWorkspace();
  const { signals, isLoading, fetchSignals } = useSignalStore();
  const { addToast } = useToast();
  
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (activeWorkspace) {
      fetchSignals(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchSignals]);

  const activeSignal = signals.find(s => s.id === selectedSignalId);

  const getSourceIcon = (source: string) => {
    switch(source?.toLowerCase()) {
      case 'slack': return <Hash className="w-5 h-5 text-pink-600" />;
      case 'discord': return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'github': return <Github className="w-5 h-5 text-gray-900" />;
      default: return <FileSpreadsheet className="w-5 h-5 text-gray-700" />;
    }
  };

  const columnHelper = createColumnHelper<Signal>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="accent-astrix-teal cursor-pointer w-4 h-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          className="accent-astrix-teal cursor-pointer w-4 h-4"
        />
      ),
    }),
    columnHelper.accessor('source_type', {
      header: 'Source',
      cell: info => <div className="flex justify-center">{getSourceIcon(info.getValue())}</div>,
    }),
    columnHelper.accessor('raw_text', {
      header: 'Preview Text',
      cell: info => <div className="truncate max-w-[200px] md:max-w-[300px] text-gray-900 font-medium">{info.getValue()}</div>,
    }),
    columnHelper.accessor('severity_label', {
      header: 'Severity',
      cell: info => {
        const val = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${val === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
            {val === 'Critical' && <AlertCircle className="w-3 h-3" />} {val || 'Unrated'}
          </span>
        );
      }
    }),
    columnHelper.accessor('product_area', {
      header: 'Area',
      cell: info => <span className="text-gray-600 font-medium">{info.getValue() || 'Unknown'}</span>,
    }),
    columnHelper.accessor(row => row.accounts?.name, {
      id: 'account',
      header: 'Account',
      cell: info => <span className="text-gray-900 font-bold">{info.getValue() || 'Unknown'}</span>,
    }),
  ], []);

  const table = useReactTable({
    data: signals,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleBulkAction = (action: string) => {
    addToast(`${Object.keys(rowSelection).length} signals marked as ${action}`, "success");
    setRowSelection({});
  };

  return (
    <AppLayout 
      title="Signal Explorer" 
      subtitle={`${signals.length} total signals ingested`}
      actions={
        <div className="flex gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Import CSV
          </button>
        </div>
      }
    >
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-6 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-astrix-teal transition-all">
        <Search className="w-5 h-5 text-gray-400 ml-2 mr-3 shrink-0" />
        <input 
          type="text" 
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search all signals by keyword, account, or category..." 
          className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 py-1"
        />
      </div>

      {Object.keys(rowSelection).length > 0 && (
        <div className="bg-astrix-teal/10 border border-astrix-teal/20 rounded-xl p-3 mb-6 flex items-center justify-between animate-[fadeIn_0.2s_ease-out]">
          <span className="text-sm font-bold text-astrix-teal">{Object.keys(rowSelection).length} selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('Noise')} className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50">Mark as Noise</button>
            <button onClick={() => handleBulkAction('Linked')} className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50">Link to Problem</button>
          </div>
        </div>
      )}

      <div className="flex gap-6 relative min-h-[400px]">
        
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 transition-all duration-300 ${selectedSignalId ? 'md:mr-[420px]' : ''}`}>
          
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : signals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-6 text-center">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No signals found</h3>
              <p className="font-medium text-sm mb-4">Try adjusting your search or upload a CSV to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 font-mono text-xs text-gray-500 uppercase tracking-wider">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      onClick={() => setSelectedSignalId(row.original.id)}
                      className={`cursor-pointer transition-colors ${selectedSignalId === row.original.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Drawer */}
        <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full sm:w-[400px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 overflow-y-auto ${selectedSignalId ? 'translate-x-0' : 'translate-x-full'}`}>
          {activeSignal && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-lg font-bold text-gray-900">Signal Details</h3>
                <button onClick={() => setSelectedSignalId(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <div className="text-xs font-mono font-bold text-gray-500 uppercase mb-2">Raw Text</div>
                <p className="text-gray-900 text-sm leading-relaxed font-medium">"{activeSignal.raw_text}"</p>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-mono font-bold text-gray-500 uppercase">Normalized Text</div>
                  <AIBadge />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed font-medium italic">
                  {activeSignal.normalized_text || "User is requesting SAML SSO integration to comply with internal security policies."}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Override Classification</h4>
                    <AIBadge />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Severity</label>
                      <select className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-astrix-teal outline-none" defaultValue={activeSignal.severity_label || ''}>
                        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Sentiment</label>
                      <select className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-astrix-teal outline-none" defaultValue={activeSignal.sentiment_label || ''}>
                        <option>Negative</option><option>Neutral</option><option>Positive</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Product Area</label>
                      <select className="w-full text-sm border border-gray-200 rounded p-2 focus:ring-2 focus:ring-astrix-teal outline-none" defaultValue={activeSignal.product_area || ''}>
                        <option>Authentication</option><option>Core UI</option><option>Billing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
};
