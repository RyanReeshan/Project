'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CreditCard,
  Banknote,
  Plus
} from 'lucide-react';
import { getSales, getProducts, getCustomers } from '@/lib/actions';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    salesCount: 0,
    productCount: 0,
    customerCount: 0,
    recentSales: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [sales, products, customers] = await Promise.all([
        getSales(),
        getProducts(),
        getCustomers()
      ]);

      const activeSales = sales.filter((s: any) => s.status !== 'REFUNDED');
      const revenue = activeSales.reduce((sum: number, s: any) => sum + s.total, 0);

      setStats({
        revenue,
        salesCount: activeSales.length,
        productCount: products.length,
        customerCount: customers.length,
        recentSales: sales.slice(0, 5)
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="text-blue-600" />}
          trend="+12% from yesterday"
          positive={true}
        />
        <StatCard
          title="Total Sales"
          value={stats.salesCount.toString()}
          icon={<ShoppingCart className="text-purple-600" />}
          trend="+5% from yesterday"
          positive={true}
        />
        <StatCard
          title="Total Products"
          value={stats.productCount.toString()}
          icon={<Package className="text-orange-600" />}
          trend="In stock items"
          positive={true}
        />
        <StatCard
          title="Total Customers"
          value={stats.customerCount.toString()}
          icon={<Users className="text-green-600" />}
          trend="Loyalty members"
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentSales.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No transactions yet.</div>
            ) : (
              stats.recentSales.map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${sale.paymentMethod === 'Cash' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {sale.paymentMethod === 'Cash' ? <Banknote size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{sale.customer?.name || 'Guest Customer'}</p>
                      <p className="text-xs text-slate-500">{format(new Date(sale.timestamp), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${sale.status === 'REFUNDED' ? 'text-red-500 line-through' : 'text-slate-900'}`}>
                      Rs. {sale.total.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Stock Alert */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
            <Plus className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">New Sale</h3>
            <p className="text-blue-100 text-sm mb-6">Start a new checkout session and process orders quickly.</p>
            <a href="/pos" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Open POS
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              Inventory Alert
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Following items are running low on stock.</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Blue Denim Jeans (M)</span>
                  <span className="font-bold text-red-600">2 left</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">White Cotton T-Shirt (L)</span>
                  <span className="font-bold text-orange-600">5 left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, positive }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <ArrowUpRight size={20} className="text-slate-300" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <div className="mt-2 flex items-center gap-1">
          {positive ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
          <span className={`text-xs font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
        </div>
      </div>
    </div>
  );
}
