import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById, cancelOrder } from '../features/orders/orderSlice'
import { PageSpinner, StatusBadge } from '../components/common'
import { FiArrowLeft, FiMapPin, FiPackage, FiX } from 'react-icons/fi'

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered']

export default function OrderDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedOrder: order, loading } = useSelector(s => s.orders)

  useEffect(() => { dispatch(fetchOrderById(id)) }, [id, dispatch])

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation (optional):')
    if (reason === null) return
    await dispatch(cancelOrder({ id, reason }))
    dispatch(fetchOrderById(id))
  }

  if (loading || !order) return <PageSpinner />

  const currentStep = order.status === 'Cancelled' ? -1 : STEPS.indexOf(order.status)

  return (
    <div className="page-container py-8 animate-fade-in">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Order #{order._id?.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress Tracker */}
      {order.status !== 'Cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Progress</h2>
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 text-center leading-tight max-w-[60px]">{step}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full ${i < currentStep ? 'bg-primary-600' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="text-primary-600" /> Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" onError={e => { e.target.src = 'https://via.placeholder.com/64' }} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price}/{item.unit} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin className="text-primary-600" /> Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{order.deliveryPrice === 0 ? <span className="text-primary-600 font-medium">FREE</span> : `₹${order.deliveryPrice}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-₹{order.discount}</span></div>}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                <span>Total</span><span className="text-primary-700">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={order.isPaid ? 'text-green-600 font-medium' : 'text-orange-500'}>{order.isPaid ? 'Paid' : 'Pending'}</span></div>
            </div>
          </div>

          {/* Cancel */}
          {!['Delivered', 'Out for Delivery', 'Cancelled'].includes(order.status) && (
            <button onClick={handleCancel} className="btn-danger w-full flex items-center justify-center gap-2">
              <FiX className="w-4 h-4" /> Cancel Order
            </button>
          )}

          {order.status === 'Cancelled' && (
            <div className="card p-4 bg-red-50 border border-red-100">
              <p className="text-sm font-semibold text-red-700 mb-1">Order Cancelled</p>
              {order.cancelReason && <p className="text-xs text-red-500">Reason: {order.cancelReason}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
