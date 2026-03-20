import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearSelectedProduct } from '../features/products/productSlice'
import { addToCart } from '../features/cart/cartSlice'
import { PageSpinner } from '../components/common'
import { FiShoppingCart, FiPlus, FiMinus, FiArrowLeft, FiTruck, FiShield } from 'react-icons/fi'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedProduct: product, loading } = useSelector(s => s.products)
  const { user } = useSelector(s => s.auth)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    dispatch(fetchProductById(id))
    return () => dispatch(clearSelectedProduct())
  }, [id, dispatch])

  if (loading || !product) return <PageSpinner />

  const discountedPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    await dispatch(addToCart({ productId: product._id, quantity: qty }))
    setAdding(false)
  }

  return (
    <div className="page-container py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://via.placeholder.com/500?text=🥦' }}
          />
        </div>

        {/* Details */}
        <div>
          <span className="badge badge-green mb-3">{product.category}</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary-700">₹{discountedPrice}</span>
            <span className="text-gray-400">/{product.unit}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                <span className="badge bg-accent-100 text-accent-600">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>
              ))}
            </div>
          )}

          {/* Nutrition */}
          {product.nutritionInfo && (
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Nutritional Info (per 100g)</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {Object.entries(product.nutritionInfo).filter(([, v]) => v).map(([key, val]) => (
                  <div key={key} className="bg-white rounded-lg p-2">
                    <p className="font-bold text-gray-900">{val}</p>
                    <p className="text-gray-400 capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          {product.stock > 0 ? (
            <p className="text-sm text-gray-500 mb-4">
              {product.stock <= 10 ? (
                <span className="text-orange-500 font-medium">⚠️ Only {product.stock} {product.unit} left</span>
              ) : (
                <span className="text-primary-600">✅ In Stock ({product.stock} {product.unit} available)</span>
              )}
            </p>
          ) : (
            <p className="text-red-500 font-medium mb-4">❌ Out of Stock</p>
          )}

          {/* Add to Cart */}
          {product.isAvailable && product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors">
                  <FiMinus />
                </button>
                <span className="px-5 font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors">
                  <FiPlus />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-base"
              >
                <FiShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Next Day Delivery</p>
                <p className="text-xs text-gray-400">Order before midnight</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <FiShield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Freshness Guarantee</p>
                <p className="text-xs text-gray-400">100% farm fresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
