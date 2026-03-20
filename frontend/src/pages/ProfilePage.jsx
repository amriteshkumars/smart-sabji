import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../features/auth/authSlice'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.password) delete payload.password
    dispatch(updateProfile(payload))
  }

  return (
    <div className="page-container py-8 animate-fade-in max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-6">👤 My Profile</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-xl font-bold text-gray-900">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'badge-green'}`}>
            {user?.role === 'admin' ? '🛡️ Admin' : '🛒 Customer'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="text-primary-600" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (read-only)</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input type="email" value={user?.email} readOnly className="input-field pl-10 bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" placeholder="10-digit number" pattern="[0-9]{10}" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password (optional)</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field pl-10" placeholder="Leave blank to keep current" minLength={6} />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiMapPin className="text-primary-600" /> Default Delivery Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street</label>
              <input type="text" value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} className="input-field" placeholder="House no., street, locality" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
              <input type="text" value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
              <input type="text" value={form.address.pincode} onChange={e => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} className="input-field" pattern="[0-9]{6}" placeholder="6-digit pincode" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 py-3 px-8">
          <FiSave className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
