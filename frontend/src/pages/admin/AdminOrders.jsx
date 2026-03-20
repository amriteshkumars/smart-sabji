import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrders, updateOrderStatus } from '../../features/orders/orderSlice'
import { PageSpinner, StatusBadge, Pagination, Modal } from '../../components/common'
import { FiEye, FiEdit2 } from 'react-icons/fi'

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled']

export default function AdminOrders() {
  const dispatch = useDispatch()
  const { orders, pagination, loading } = useSelector(s => s.orders)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    dispatch(fetchAllOrders({ page, limit: 20, status: filterStatus }))
  }, [page, filterStatus, dispatch])

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    await dispatch(updateOrderStatus({ id: statusModal._id, status: newStatus }))
    setStatusModal(null)
    dispatch(fetchAllOrders({ page, limit: 20, status: filterStatus }))
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination?.total || 0} total orders</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filterStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.phone || order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{order.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-600">{order.paymentMethod}</span>
                        <span className={`block text-xs ${order.isPaid ? 'text-green-500' : 'text-orange-400'}`}>
                          {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setStatusModal(order); setNewStatus(order.status) }}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* View Order Modal */}
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder?._id?.slice(-8).toUpperCase()}`} size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p className="font-semibold">{viewOrder.user?.name}</p>
                <p className="text-gray-500">{viewOrder.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Delivery Address</p>
                <p className="font-semibold">{viewOrder.shippingAddress?.fullName}</p>
                <p className="text-gray-500">{viewOrder.shippingAddress?.phone}</p>
                <p className="text-gray-500">{viewOrder.shippingAddress?.street}, {viewOrder.shippingAddress?.city}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Order Items</p>
              <div className="space-y-2">
                {viewOrder.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.src = 'https://via.placeholder.com/40' }} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price}/{item.unit} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{viewOrder.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{viewOrder.deliveryPrice === 0 ? 'FREE' : `₹${viewOrder.deliveryPrice}`}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1"><span>Total</span><span className="text-primary-700">₹{viewOrder.totalPrice?.toFixed(2)}</span></div>
            </div>

            <div className="flex items-center justify-between">
              <StatusBadge status={viewOrder.status} />
              <span className="text-sm text-gray-500">{viewOrder.paymentMethod} · {viewOrder.isPaid ? '✅ Paid' : '⏳ Pending'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Order: <span className="font-mono font-bold">#{statusModal?._id?.slice(-8).toUpperCase()}</span></p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStatusModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleStatusUpdate} className="btn-primary flex-1">Update</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
