/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { Pin, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getUser } from 'app/lib/auth';
import api from 'app/lib/api';

interface Notice {
  id: string; title: string; body: string; ai_summary: string;
  category: string; department_id: number | null; department_name?: string; 
  is_pinned: number | boolean; created_at: string; author_name: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Exam: 'bg-red-100 text-red-700',
  exam: 'bg-red-100 text-red-700',
  Event: 'bg-purple-100 text-purple-700',
  event: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-700',
  general: 'bg-gray-100 text-gray-700',
  Academic: 'bg-green-100 text-green-700',
  academic: 'bg-green-100 text-green-700',
  Registration: 'bg-yellow-100 text-yellow-700',
  registration: 'bg-yellow-100 text-yellow-700',
};

export default function NoticesPage() {
  const user = getUser();
  const [notices, setNotices] = useState<Notice[]>([]);

  const [categories, setCategories] = useState<string[]>(['all']);
  const [departments, setDepartments] = useState<any[]>([]); // 🛠️ ডিপার্টমেন্ট এখন অবজেক্ট অ্যারে

  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // 🛠️ ফর্ম স্টেট আপডেট: 'department' এর জায়গায় 'department_id' ব্যবহার করা হয়েছে
  const [form, setForm] = useState({ 
    title: '', 
    body: '', 
    category: 'General', 
    department_id: 'all', 
    is_pinned: false 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/notices/categories');
      if (Array.isArray(data)) {
        setCategories(['all', ...data]);
        if (data.length > 0) {
          // 🛠️ টাইপো ফিক্স: ডাটার প্রথম ইনডেক্স পাস করা হয়েছে
          setForm(f => ({ ...f, category: data[0] }));
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/notices/departments');
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (category !== 'all') {
        params.category = category;
      }

      if (user?.role === 'student' && user?.department_id) {
        params.department_id = user.department_id;
      } else {
        params.department_id = 'all';
      }

      console.log("Active Request Params:", params);

      const { data } = await api.get('/notices', { params });
      console.log("Server Response Data:", data);
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Notices Error:", err);
      setNotices([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [category]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ব্যাকএন্ডে সাবমিট করার আগে ডাটা লক
      console.log("Submitting Form Data:", form);
      await api.post('/notices', form);
      setShowForm(false);
      
      // 🛠️ ফর্ম রিসেট লজিক একদম পারফেক্ট করা হলো
      setForm({ 
        title: '', 
        body: '', 
        // pick first non-'all' category or default to 'General'
        category: (categories.filter(c => c !== 'all')[0]) || 'General', 
        department_id: 'all', 
        is_pinned: false 
      });
      
      fetchNotices();
      fetchCategories();
      fetchDepartments();
    } catch (err) {
      console.error("Notice post error:", err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
      fetchCategories();
      fetchDepartments();
    } catch { }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Notice Board</h1>
          {user?.role !== 'student' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={15} /> Post Notice
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3 shadow-sm">
            <input required placeholder="Notice title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />

            <textarea required placeholder="Notice body..." rows={4} value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />

            <div className="flex gap-3 flex-wrap items-center justify-between">
              <div className="flex gap-3 flex-wrap">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white">
                  {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* 🛠️ ডিপার্টমেন্ট সিলেক্ট ড্রপডাউন রিলেশনাল আইডি অনুযায়ী ফিক্স করা হলো */}
                <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}
                  className="border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white max-w-xs">
                  <option value="all">All Departments</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_pinned}
                  onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Pin this notice
              </label>
            </div>

            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Posting...' : 'Post Notice'}
            </button>
          </form>
        )}

        {/* ক্যাটেগরি ফিল্টার বাটন */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize
                ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {c === 'all' ? 'All Notices' : c}
            </button>
          ))}
        </div>

        {/* Notices list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading notices...</p>
        ) : notices.length === 0 ? (
          <p className="text-gray-400 text-sm">No notices found.</p>
        ) : (
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {Boolean(n.is_pinned) && <Pin size={13} className="text-blue-600 fill-blue-600" />}
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${CATEGORY_COLORS[n.category] || 'bg-gray-100 text-gray-600'}`}>
                        {n.category}
                      </span>
                      {/* 🛠️ ডিপার্টমেন্টের নাম ব্যাকএন্ডের JOIN কুয়েরি থেকে সুন্দরভাবে দেখাবে */}
                      <span className="text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                        {n.department_name ? n.department_name : 'All Depts'}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-900 text-sm">{n.title}</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Posted by <span className="font-medium text-gray-600">{n.author_name || 'System'}</span> · {new Date(n.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {user?.role !== 'student' && (
                    <button onClick={() => handleDelete(n.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* AI Summary */}
                {n.ai_summary && (
                  <div className="text-xs text-gray-600 bg-blue-50/70 rounded-lg px-3 py-2 mt-3 border-l-2 border-blue-500">
                    <span className="font-bold text-blue-700 text-[10px] uppercase block mb-0.5 tracking-wider">AI Summary</span>
                    {n.ai_summary}
                  </div>
                )}

                {/* Expand full body */}
                <button
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 mt-3 hover:text-blue-700 transition-colors"
                >
                  {expanded === n.id ? <><ChevronUp size={13} /> Hide Content</> : <><ChevronDown size={13} /> Read Full Notice</>}
                </button>
                {expanded === n.id && (
                  <div className="text-sm text-gray-700 mt-2 pt-2 border-t border-gray-100 whitespace-pre-line leading-relaxed">
                    {n.body}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}