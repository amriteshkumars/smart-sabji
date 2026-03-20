import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories, setFilters, clearFilters } from '../features/products/productSlice'
import ProductCard from '../components/common/ProductCard'
import { PageSpinner, EmptyState, Pagination } from '../components/common'
import { FiSearch, FiFilter, FiX, FiSliders } from 'react-icons/fi'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt', order: 'desc' },
  { label: 'Price: Low to High', value: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price', order: 'desc' },
  { label: 'Name A-Z', value: 'name', order: 'asc' },
]

export default function ProductsPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, categories, pagination, loading, filters } = useSelector(s => s.products)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  // Sync URL params → filters on mount
  useEffect(() => {
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') || ''
    if (category) dispatch(setFilters({ category }))
    if (featured) dispatch(setFilters({ featured }))
    dispatch(fetchCategories())
  }, [])

  // Fetch whenever filters/page change
  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page, limit: 12 }))
  }, [filters, page, dispatch])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    dispatch(setFilters({ search: localSearch }))
    setPage(1)
  }, [localSearch, dispatch])

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    setPage(1)
  }

  const handleClear = () => {
    dispatch(clearFilters())
    setLocalSearch('')
    setPage(1)
    setSearchParams({})
  }

  const activeFilterCount = [
    filters.category, filters.search, filters.minPrice, filters.maxPrice
  ].filter(Boolean).length

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ─────────────────────────────────────────────── */}
        <aside className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <FiX className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                    !filters.category ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange('category', cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      filters.category === cat ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={e => handleFilterChange('minPrice', e.target.value)}
                  className="input-field py-2 text-sm"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field py-2 text-sm"
                  min="0"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
              <div className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={`${opt.value}-${opt.order}`}
                    onClick={() => { handleFilterChange('sort', opt.value); handleFilterChange('order', opt.order) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      filters.sort === opt.value && filters.order === opt.order
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vegetables..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  className="input-field pl-10 py-2.5"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 text-sm">Search</button>
            </form>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary-300 transition-all"
            >
              <FiSliders className="w-4 h-4" />
              Filters {activeFilterCount > 0 && <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {filters.category}
                  <button onClick={() => handleFilterChange('category', '')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {filters.search && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  "{filters.search}"
                  <button onClick={() => { handleFilterChange('search', ''); setLocalSearch('') }}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                  <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', '') }}><FiX className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              {pagination?.total || 0} product{pagination?.total !== 1 ? 's' : ''} found
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <PageSpinner />
          ) : items.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description="Try adjusting your search or filters"
              action={<button onClick={handleClear} className="btn-primary">Clear Filters</button>}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}
