'use client';

import { useState, useEffect } from 'react';
import { getSales, refundSale } from '@/lib/actions';
import { Sale } from '@/lib/types';
import { format } from 'date-fns';
import {
  FileText,
  Search,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Banknote,
  CreditCard
} from 'lucide-react';

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refunding, setRefunding] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    setLoading(true);
    const data = await getSales();
    setSales(data as any);
    setLoading(false);
  }

  const handleRefund = async (id: string) => {
    if (!confirm('Are you sure you want to refund this sale? This will restore stock and revert loyalty points.')) return;

    setRefunding(id);
    const result = await refundSale(id);
    setRefunding(null);

    if (result.success) {
      alert('Sale refunded successfully!');
      loadSales();
    } else {
      alert(result.error || 'Failed to refund sale');
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer?.name || 'Guest').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sales
    .filter(s => s.status !== 'REFUNDED')
    .reduce((sum, sale) => sum + sale.total, 0);

  const totalSalesCount = sales.filter(s => s.status !== 'REFUNDED').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500">Track and manage your shop's performance</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors">
            <Calendar size={18} />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-shadow shadow-lg shadow-blue-200">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 flex items-center text-xs text-green-600 font-bold">
            <ChevronRight size={14} className="-rotate-90" />
            <span>+12.5% from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-slate-900">{totalSalesCount}</p>
          <div className="mt-2 flex items-center text-xs text-green-600 font-bold">
            <ChevronRight size={14} className="-rotate-90" />
            <span>+8.2% from last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Average Sale</p>
          <p className="text-3xl font-bold text-slate-900">Rs. {(totalRevenue / (totalSalesCount || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 flex items-center text-xs text-red-600 font-bold">
            <ChevronRight size={14} className="rotate-90" />
            <span>-2.1% from last month</span>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Sale ID</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin inline-block text-blue-600" size={32} />
                    <p className="mt-2 text-slate-500">Loading sales records...</p>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No sales records found</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      {sale.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(sale.timestamp), 'MMM d, yyyy • HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {(sale.customer?.name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{sale.customer?.name || 'Guest'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        {sale.paymentMethod === 'Cash' ? <Banknote size={14} /> : <CreditCard size={14} />}
                        {sale.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        sale.status === 'REFUNDED'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-green-50 text-green-600'
                      }`}>
                        {sale.status === 'REFUNDED' ? <RotateCcw size={12} /> : <CheckCircle2 size={12} />}
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      Rs. {sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sale.status !== 'REFUNDED' ? (
                        <button
                          disabled={refunding === sale.id}
                          onClick={() => handleRefund(sale.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 ml-auto"
                        >
                          {refunding === sale.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                          Refund
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
