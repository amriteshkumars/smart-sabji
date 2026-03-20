import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../features/cart/cartSlice'
import { FiShoppingCart, FiStar, FiPlus, FiMinus } from 'react-icons/fi'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { items, loading } = useSelector(s => s.cart)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const cartItem = items.find(i => i.product?._id === product._id)

  const discountedPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) {
      window.location.href = '/login'
      return
    }
    setAdding(true)
    await dispatch(addToCart({ productId: product._id, quantity: qty }))
    setAdding(false)
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="card group hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=🥦' }}
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {product.discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <FiStar className="w-3 h-3" /> Featured
          </span>
        )}
        {!product.isAvailable || product.stock === 0 ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded-lg">Out of Stock</span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{discountedPrice}</span>
            <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
            {product.discount > 0 && (
              <span className="block text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
          {product.stock <= 10 && product.stock > 0 && (
            <span className="text-xs text-orange-500 font-medium">Only {product.stock} left</span>
          )}
        </div>

        {/* Add to Cart */}
        {product.isAvailable && product.stock > 0 && (
          <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
            {/* Qty Selector */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-2 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <FiMinus className="w-3 h-3" />
              </button>
              <span className="px-3 text-sm font-semibold min-w-[30px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="px-2 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <FiPlus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-60"
            >
              <FiShoppingCart className="w-4 h-4" />
              {adding ? 'Adding...' : cartItem ? 'Add More' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
