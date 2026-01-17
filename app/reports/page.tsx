'use client';

import { useStore } from '@/lib/store';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { sales } = useStore();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500">Analyze your shop's performance</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Download size={20} />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <TrendingUp size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
          <div className="mt-4 text-sm bg-blue-500/50 inline-block px-2 py-1 rounded">
            +14.5% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <BarChart3 size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Avg. Order Value</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">${avgOrderValue.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <Calendar size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Total Orders</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{sales.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 font-bold text-slate-900">
          Transaction History
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(sale.timestamp, 'PPP HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      sale.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sale.items.length} items
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ${sale.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No data available for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
