/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Building } from 'lucide-react';
import api from 'app/lib/api';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDept, setNewDept]         = useState('');
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage]         = useState({ text: '', type: '' });


  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);


  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await api.post('/departments/add', { name: newDept.trim() });
      setMessage({ text: 'Department added successfully!', type: 'success' });
      setNewDept('');
      await fetchDepartments();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to add', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };


  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.delete('/delete', { data: { name } });
      setMessage({ text: 'Department removed successfully!', type: 'success' });
      await fetchDepartments();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete', type: 'error' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading departments...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Building size={24} className="text-blue-600" />
          Manage Departments
        </h1>

        {/* নতুন ডিপার্টমেন্ট অ্যাড করার ফর্ম */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g., Civil Engineering"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              disabled={actionLoading}
            />
            <button
              type="submit"
              disabled={actionLoading || !newDept.trim()}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Plus size={16} />
              {actionLoading ? 'Adding...' : 'Add'}
            </button>
          </form>

          {/* সাকসেস বা এরর মেসেজ */}
          {message.text && (
            <p className={`text-xs font-medium mt-3 text-center ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.text}
            </p>
          )}
        </div>

        {/* ডিপার্টমেন্টের লিস্ট */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Departments ({departments.length})
            </p>
          </div>

          <ul className="divide-y divide-gray-100">
            {departments.length === 0 ? (
              <li className="p-5 text-center text-sm text-gray-400">No departments found.</li>
            ) : (
              departments.map((dept) => (
                <li key={dept} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-700">{dept}</span>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}