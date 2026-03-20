import { useEffect, useState } from 'react'
import API from '../../utils/api'
import { PageSpinner, StatusBadge } from '../../components/common'
import { FiUsers, FiShoppingCart, FiPackage, FiDollarSign, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const { stats, recentOrders, topProducts, lowStockProducts, ordersByStatus } = data

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers className="w-6 h-6" />, color: 'blue', sub: 'Registered customers' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingCart className="w-6 h-6" />, color: 'orange', sub: `${stats.monthOrders} this month` },
    { label: 'Total Products', value: stats.totalProducts, icon: <FiPackage className="w-6 h-6" />, color: 'green', sub: 'Active listings' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: <FiDollarSign className="w-6 h-6" />, color: 'purple', sub: `₹${stats.monthRevenue?.toLocaleString('en-IN')} this month` },
  ]

  const COLOR_MAP = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-primary-50 text-primary-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl">
          <FiTrendingUp className="w-4 h-4" />
          <span>{stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}% vs last month</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_MAP[card.color]}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 font-medium hover:text-primary-700">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.slice(0, 6).map(order => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-mono">#{order._id?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.user?.name || 'Unknown'}</p>
                </div>
                <StatusBadge status={order.status} />
                <p className="text-sm font-bold text-gray-900">₹{order.totalPrice?.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Orders by Status</h2>
            <div className="space-y-2">
              {ordersByStatus?.map(s => (
                <div key={s._id} className="flex items-center justify-between">
                  <StatusBadge status={s._id} />
                  <span className="font-bold text-sm text-gray-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts?.length > 0 && (
            <div className="card p-5 border border-orange-100 bg-orange-50">
              <h2 className="font-display text-base font-bold text-orange-800 mb-3 flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" /> Low Stock Alert
              </h2>
              <div className="space-y-2">
                {lowStockProducts.map(p => (
                  <div key={p._id} className="flex items-center justify-between">
                    <p className="text-sm text-orange-700 truncate">{p.name}</p>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-lg">
                      {p.stock} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/products" className="block mt-3 text-xs font-semibold text-orange-600 hover:text-orange-800">
                Manage Products →
              </Link>
            </div>
          )}

          {/* Top Selling Products */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3">Top Sellers</h2>
            <div className="space-y-2">
              {topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                  </div>
                  <p className="text-xs font-bold text-primary-600">₹{p.revenue?.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
