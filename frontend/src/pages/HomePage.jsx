import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeaturedProducts, fetchCategories } from '../features/products/productSlice'
import ProductCard from '../components/common/ProductCard'
import { PageSpinner } from '../components/common'
import { FiArrowRight, FiTruck, FiShield, FiStar, FiClock } from 'react-icons/fi'

const CATEGORY_EMOJIS = {
  'Leafy Greens': '🥬',
  'Root Vegetables': '🥕',
  'Gourds': '🥒',
  'Exotic Vegetables': '🥦',
  'Herbs & Spices': '🌿',
  'Seasonal': '🌽',
  'Fruits': '🍅',
  'Others': '🧅',
}

const FEATURES = [
  { icon: <FiTruck className="w-6 h-6" />, title: 'Free Delivery', desc: 'On orders above ₹200' },
  { icon: <FiShield className="w-6 h-6" />, title: '100% Fresh', desc: 'Farm-fresh guarantee' },
  { icon: <FiClock className="w-6 h-6" />, title: 'Next Day Delivery', desc: 'Order by midnight' },
  { icon: <FiStar className="w-6 h-6" />, title: 'Best Quality', desc: 'Handpicked vegetables' },
]

export default function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { featured, categories, loading } = useSelector(s => s.products)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="page-container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span>🌱</span> Farm Fresh. Delivered Daily.
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              Fresh Vegetables,<br />
              <span className="text-primary-200">Right at Your Door</span>
            </h1>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed max-w-lg">
              Order fresh, seasonal vegetables sourced directly from local farms. Same-day quality, next-day delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-primary-50 transition-all hover:shadow-lg active:scale-95"
              >
                Shop Now <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all"
              >
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="page-container -mt-6 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="page-container mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {(categories.length ? categories : Object.keys(CATEGORY_EMOJIS)).map(cat => (
            <button
              key={cat}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {CATEGORY_EMOJIS[cat] || '🥗'}
              </span>
              <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight line-clamp-2">
                {cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="page-container mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">⭐ Featured Picks</h2>
          <Link to="/products?featured=true" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            See All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <PageSpinner />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No featured products yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-primary-50 border-y border-primary-100">
        <div className="page-container py-12 text-center">
          <div className="text-4xl mb-4">🚚</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Free Delivery on Orders Above ₹200
          </h2>
          <p className="text-gray-500 mb-6">Order fresh vegetables now and get them delivered tomorrow morning!</p>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  )
}
