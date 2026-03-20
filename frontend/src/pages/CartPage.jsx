import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../features/cart/cartSlice'
import { PageSpinner, EmptyState } from '../components/common'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTruck } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal, deliveryFee, total, loading } = useSelector(s => s.cart)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleQtyChange = (productId, newQty) => {
    if (newQty < 1) return
    dispatch(updateCartItem({ productId, quantity: newQty }))
  }

  const handleRemove = (productId, name) => {
    if (window.confirm(`Remove ${name} from cart?`)) {
      dispatch(removeFromCart(productId))
    }
  }

  const handleClear = () => {
    if (window.confirm('Clear entire cart?')) dispatch(clearCart())
  }

  if (loading) return <PageSpinner />

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">🛒 Your Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add some fresh vegetables to get started!"
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
              <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                <FiTrash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            </div>

            {items.map(item => {
              const product = item.product
              if (!product) return null
              return (
                <div key={item._id} className="card p-4 flex gap-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-50 shrink-0"
                    onError={e => { e.target.src = 'https://via.placeholder.com/80x80?text=🥦' }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500">₹{item.price}/{product.unit}</p>
                    {!product.isAvailable && (
                      <span className="badge badge-red mt-1">Unavailable</span>
                    )}
                  </div>

                  {/* Qty Control */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity - 1)}
                      className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-semibold text-sm min-w-[36px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock}
                      className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="card p-6 sticky top-20">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <FiTruck className="w-4 h-4" /> Delivery
                  </span>
                  {deliveryFee === 0 ? (
                    <span className="text-primary-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-medium">₹{deliveryFee}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-orange-500">
                    Add ₹{(200 - subtotal).toFixed(0)} more for free delivery
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-primary-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <Link to="/products" className="block text-center mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
