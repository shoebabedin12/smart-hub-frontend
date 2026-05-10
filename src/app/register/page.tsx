'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from 'app/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    role: 'student',
    department: '',
    batch: '2024-25'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // DB থেকে departments load করো
  useEffect(() => {
    api.get('/departments').then(({ data }) => {
      setDepartments(data);
      if (data.length > 0) setForm(f => ({ ...f, department: data[0].name }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', form);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Arif Hossain' },
            { label: 'Email',     key: 'email',     type: 'email', placeholder: 'you@cust.edu.bd' },
            { label: 'Password',  key: 'password',  type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <input
                type={type} required placeholder={placeholder}
                value={(form as any)[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          ))}

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Department — DB থেকে */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Department</label>
            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500">
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Batch</label>
            <select value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500">
              {['2021-22','2022-23','2023-24','2024-25','2025-26'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}