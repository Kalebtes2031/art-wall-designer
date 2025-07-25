// src/components/admin/UsersTab.tsx
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'seller' | 'customer'
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
      toast.success('Role updated')
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
      toast.success('User deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <p className="p-4 text-center">Loading users…</p>
  if (users.length === 0) return <p className="p-4 text-center">No users found.</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-sm text-gray-600">#{u.id.slice(-6)}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{u.name}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{u.email}</td>
              <td className="px-4 py-3 text-sm">
                <select
                  value={u.role}
                  disabled={updatingId === u.id}
                  onChange={e => changeRole(u.id, e.target.value as User['role'])}
                  className="border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {['admin','seller','customer'].map(r => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-sm space-x-2">
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={deletingId === u.id}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
