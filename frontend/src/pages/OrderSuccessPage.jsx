// OrderSuccessPage.jsx
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById } from '../features/orders/orderSlice'
import { PageSpinner, StatusBadge } from '../components/common'
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { selectedOrder: order, loading } = useSelector(s => s.orders)

  useEffect(() => { dispatch(fetchOrderById(id)) }, [id, dispatch])

  if (loading) return <PageSpinner />

  return (
    <div className="page-container py-16 text-center animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-7xl mb-4 animate-bounce-in">🎉</div>
        <div className="flex items-center justify-center gap-2 text-primary-600 mb-4">
          <FiCheckCircle className="w-6 h-6" />
          <span className="font-semibold">Order Placed Successfully!</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Thank You!</h1>
        <p className="text-gray-500 mb-2">Your fresh vegetables are on their way.</p>
        {order && (
          <p className="text-sm text-gray-400 mb-8">Order #{order._id?.slice(-8).toUpperCase()}</p>
        )}

        {order && (
          <div className="card p-5 text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 mb-3">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-700">₹{order.totalPrice?.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-secondary flex items-center gap-2">
            <FiPackage className="w-4 h-4" /> My Orders
          </Link>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
