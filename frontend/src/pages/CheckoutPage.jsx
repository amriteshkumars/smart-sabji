import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../features/orders/orderSlice'
import { FiMapPin, FiCreditCard, FiPackage, FiTruck } from 'react-icons/fi'

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal, deliveryFee, total } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)
  const { loading } = useSelector(s => s.orders)

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [notes, setNotes] = useState('')

  if (items.length === 0) {
    return (
      <div className="page-container py-16 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(createOrder({
      shippingAddress: address,
      paymentMethod,
      notes,
    }))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(`/order-success/${result.payload._id}`)
    }
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Address + Payment */}
          <div className="flex-1 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FiMapPin className="text-primary-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input type="text" required value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} className="input-field" placeholder="Recipient's name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label>
                  <input type="tel" required value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="input-field" placeholder="10-digit number" pattern="[0-9]{10}" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address *</label>
                  <input type="text" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="input-field" placeholder="House no., street, locality" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                  <input type="text" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="input-field" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                  <input type="text" required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="input-field" placeholder="State" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode *</label>
                  <input type="text" required value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} className="input-field" placeholder="6-digit pincode" pattern="[0-9]{6}" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FiCreditCard className="text-primary-600" /> Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                  { value: 'Online', label: 'Online Payment', desc: 'UPI, Cards, Net Banking (demo)', icon: '💳' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="mt-1 accent-primary-600" />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <span>{opt.icon}</span> {opt.label}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-gray-900 mb-3">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Any special instructions for your delivery..."
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="card p-6 sticky top-20">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiPackage className="text-primary-600" /> Order Summary
              </h2>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium ml-2 shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><FiTruck className="w-4 h-4" /> Delivery</span>
                  {deliveryFee === 0 ? <span className="text-primary-600 font-semibold">FREE</span> : <span>₹{deliveryFee}</span>}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-primary-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                onClick={handleSubmit}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                By placing this order you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
