'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { getSales } from '@/lib/actions';

export default function ReportsPage() {
  const { sales, setSales } = useStore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Today');

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    setLoading(true);
    const data = await getSales();
    setSales(data as any);
    setLoading(false);
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesCount = sales.length;
  const averageOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500">Analyze your shop's performance (Real Database)</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[150px]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp size={16} className="mr-1" />
            <span>+12.5% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Sales</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalSalesCount}</h3>
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp size={16} className="mr-1" />
            <span>+5.2% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-slate-900">${averageOrderValue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="flex items-center text-red-600 text-sm font-medium">
            <TrendingUp size={16} className="mr-1 rotate-180" />
            <span>-2.1% vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">New Customers</p>
              <h3 className="text-2xl font-bold text-slate-900">48</h3>
            </div>
          </div>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp size={16} className="mr-1" />
            <span>+18.3% vs last period</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h2 className="font-bold text-slate-900">Recent Transactions</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
                <tr>
                  <th className="p-4 border-b">Transaction ID</th>
                  <th className="p-4 border-b">Date & Time</th>
                  <th className="p-4 border-b">Customer</th>
                  <th className="p-4 border-b">Items</th>
                  <th className="p-4 border-b">Method</th>
                  <th className="p-4 border-b">Amount</th>
                  <th className="p-4 border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-blue-600 font-medium">{sale.id}</td>
                    <td className="p-4 text-slate-600">{format(new Date(sale.timestamp), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="p-4 text-slate-600">{(sale as any).customer?.name || 'Guest'}</td>
                    <td className="p-4 text-slate-600">{(sale as any).items?.length || 0} items</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">${sale.total.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-medium">View Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && sales.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No transactions found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
