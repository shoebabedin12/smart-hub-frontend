/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { Pin, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getUser } from 'app/lib/auth';
import api from 'app/lib/api';

interface Notice {
  id: string; title: string; body: string; ai_summary: string;
  category: string; department: string; is_pinned: boolean;
  created_at: string; author_name: string;
}

const CATEGORIES = ['all', 'exam', 'event', 'general', 'holiday', 'assignment'];
const CATEGORY_COLORS: Record<string, string> = {
  exam: 'bg-red-100 text-red-700', event: 'bg-purple-100 text-purple-700',
  general: 'bg-gray-100 text-gray-700', holiday: 'bg-green-100 text-green-700',
  assignment: 'bg-yellow-100 text-yellow-700',
};

export default function NoticesPage() {
  const user = getUser();
  const [notices, setNotices]     = useState<Notice[]>([]);
  const [category, setCategory]   = useState('all');
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title: '', body: '', category: 'general', department: 'all', is_pinned: false });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/notices', { params });
      setNotices(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [category]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/notices', form);
      setShowForm(false);
      setForm({ title: '', body: '', category: 'general', department: 'all', is_pinned: false });
      fetchNotices();
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    await api.delete(`/notices/${id}`);
    fetchNotices();
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
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input required placeholder="Notice title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <textarea required placeholder="Notice body..." rows={4} value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
            <div className="flex gap-3 flex-wrap">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.is_pinned}
                  onChange={e => setForm({ ...form, is_pinned: e.target.checked })} />
                Pin this notice
              </label>
            </div>
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Posting...' : 'Post Notice'}
            </button>
          </form>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Notices list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : notices.length === 0 ? (
          <p className="text-gray-400 text-sm">No notices found.</p>
        ) : (
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {n.is_pinned && <Pin size={13} className="text-blue-600" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[n.category] || 'bg-gray-100 text-gray-600'}`}>
                        {n.category}
                      </span>
                      <span className="text-xs text-gray-400">{n.department}</span>
                    </div>
                    <h2 className="font-semibold text-gray-900 text-sm">{n.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.author_name} · {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {user?.role !== 'student' && (
                    <button onClick={() => handleDelete(n.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* AI Summary */}
                {n.ai_summary && (
                  <p className="text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2 mt-3 border-l-2 border-blue-400">
                    {n.ai_summary}
                  </p>
                )}

                {/* Expand full body */}
                <button
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:underline"
                >
                  {expanded === n.id ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> Read full notice</>}
                </button>
                {expanded === n.id && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{n.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}