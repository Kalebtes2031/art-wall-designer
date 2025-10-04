// src/components/admin/UsersTab.tsx
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import { FiLoader, FiUser, FiMail, FiShield, FiTrash2 } from 'react-icons/fi'
import { motion } from 'framer-motion'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'seller' | 'customer'
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  seller: 'bg-amber-100 text-amber-800',
  customer: 'bg-blue-100 text-blue-800'
}

const roleIcons = {
  admin: <FiShield className="w-4 h-4 text-purple-800" />,
  seller: <FiUser className="w-4 h-4 text-amber-800" />,
  customer: <FiUser className="w-4 h-4 text-blue-800" />
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await api.get<User[]>('/admins/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(userId: string, newRole: User['role']) {
    setUpdatingId(userId)
    try {
      await api.patch(`/admins/users/${userId}/role`, { role: newRole })
      setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x))
      toast.success('Role updated successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    setDeletingId(userId)
    try {
      await api.delete(`/admins/users/${userId}`)
      setUsers(u => u.filter(x => x.id !== userId))
      toast.success('User deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <FiLoader className="animate-spin text-indigo-600 w-8 h-8" />
    </div>
  )
  
  if (users.length === 0) return (
    <div className="text-center py-12">
      <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
        <FiUser className="text-gray-400 w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
      <p className="text-gray-500">Create your first user to get started</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <motion.tr 
                key={u.id} 
                className="hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500 font-mono">#{u.id.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <FiMail className="text-gray-400 mr-2" />
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={e => changeRole(u.id, e.target.value as User['role'])}
                      className={`appearance-none pl-8 pr-10 py-1.5 text-sm rounded-full border ${roleColors[u.role]} transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                    >
                      {['admin','seller','customer'].map(r => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {roleIcons[u.role]}
                    </div>
                    {updatingId === u.id && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <FiLoader className="animate-spin text-gray-500 w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={deletingId === u.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center transition-colors"
                  >
                    {deletingId === u.id ? (
                      <FiLoader className="animate-spin mr-1" />
                    ) : (
                      <FiTrash2 className="mr-1" />
                    )}
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}