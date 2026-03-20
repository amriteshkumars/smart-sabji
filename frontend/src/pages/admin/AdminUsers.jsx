import { useEffect, useState } from 'react'
import API from '../../utils/api'
import { PageSpinner, Pagination } from '../../components/common'
import { FiToggleLeft, FiToggleRight, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [toggling, setToggling] = useState(null)

  const fetchUsers = async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await API.get('/admin/users', { params: { page: p, limit: 20 } })
      setUsers(data.users)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers(page) }, [page])

  const handleToggle = async (userId, name) => {
    setToggling(userId)
    try {
      const { data } = await API.put(`/admin/users/${userId}/toggle`)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u))
      toast.success(`${name} ${data.user.isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update user')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{pagination?.total || 0} registered customers</p>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(user._id, user.name)}
                        disabled={toggling === user._id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                          user.isActive
                            ? 'text-red-500 hover:bg-red-50 border border-red-100'
                            : 'text-green-600 hover:bg-green-50 border border-green-100'
                        } disabled:opacity-50`}
                      >
                        {user.isActive ? (
                          <><FiToggleRight className="w-4 h-4" /> Deactivate</>
                        ) : (
                          <><FiToggleLeft className="w-4 h-4" /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={p => { setPage(p); fetchUsers(p) }} />
    </div>
  )
}
