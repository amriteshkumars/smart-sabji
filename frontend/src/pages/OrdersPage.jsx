import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrders } from '../features/orders/orderSlice'
import { PageSpinner, EmptyState, StatusBadge, Pagination } from '../components/common'
import { FiEye } from 'react-icons/fi'

export default function OrdersPage() {
  const dispatch = useDispatch()
  const { orders, pagination, loading } = useSelector(s => s.orders)

  useEffect(() => { dispatch(fetchMyOrders()) }, [dispatch])

  const handlePageChange = (page) => { dispatch(fetchMyOrders({ page })) }

  if (loading) return <PageSpinner />

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">📦 My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="Place your first order to see it here"
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900 font-mono text-sm">
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-700">₹{order.totalPrice?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100">
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <span className="text-xs text-gray-400 px-2 py-1">+{order.orderItems.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-xs text-gray-400">{order.paymentMethod} · {order.isPaid ? '✅ Paid' : '⏳ Pending'}</span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <FiEye className="w-4 h-4" /> View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}
