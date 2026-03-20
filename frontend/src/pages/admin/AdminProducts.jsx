import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../features/products/productSlice'
import { PageSpinner, Pagination, Modal } from '../../components/common'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../../utils/api'

const CATEGORIES = ['Leafy Greens', 'Root Vegetables', 'Gourds', 'Exotic Vegetables', 'Herbs & Spices', 'Seasonal', 'Fruits', 'Others']
const UNITS = ['kg', 'g', 'piece', 'bunch', 'dozen']

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Leafy Greens', unit: 'kg', stock: '',
  image: '', discount: 0, isFeatured: false, isAvailable: true,
}

export default function AdminProducts() {
  const dispatch = useDispatch()
  const { items, pagination, loading } = useSelector(s => s.products)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 15, search }))
  }, [page, search, dispatch])

  const openCreate = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      unit: product.unit,
      stock: product.stock,
      image: product.image,
      discount: product.discount || 0,
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
    })
    setModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(f => ({ ...f, image: data.url }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      discount: Number(form.discount),
    }
    let result
    if (editProduct) {
      result = await dispatch(updateProduct({ id: editProduct._id, ...payload }))
    } else {
      result = await dispatch(createProduct(payload))
    }
    if (result.meta.requestStatus === 'fulfilled') {
      setModal(false)
      dispatch(fetchProducts({ page, limit: 15, search }))
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteProduct(id))
    if (result.meta.requestStatus === 'fulfilled') {
      setDeleteConfirm(null)
      dispatch(fetchProducts({ page, limit: 15, search }))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination?.total || 0} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100" onError={e => { e.target.src = 'https://via.placeholder.com/40' }} />
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          {p.isFeatured && <span className="text-xs text-amber-500 font-medium">⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">₹{p.price}</span>
                      {p.discount > 0 && <span className="ml-1 text-xs text-accent-500">-{p.discount}%</span>}
                      <span className="text-gray-400 text-xs">/{p.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock <= 10 ? 'text-orange-500' : p.stock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.isAvailable ? (
                        <span className="badge badge-green">Available</span>
                      ) : (
                        <span className="badge badge-red">Unavailable</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Fresh Spinach" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Describe the product..." maxLength={500} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit *</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹) *</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="e.g. 40" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Original Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} className="input-field" placeholder="Optional MRP" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock *</label>
              <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount (%)</label>
              <input type="number" min="0" max="100" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="input-field" placeholder="0-100" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Image</label>
              <div className="flex gap-3 items-center">
                {form.image && (
                  <img src={form.image} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                )}
                <div className="flex-1">
                  <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="input-field mb-2 text-sm" placeholder="Paste image URL..." />
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-primary-600 hover:text-primary-700">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {uploading ? '⏳ Uploading...' : '📤 Or upload image file'}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Product" size="sm">
        <div className="text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <p className="text-gray-700 mb-1">Are you sure you want to delete</p>
          <p className="font-bold text-gray-900 mb-4">"{deleteConfirm?.name}"?</p>
          <p className="text-sm text-red-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
