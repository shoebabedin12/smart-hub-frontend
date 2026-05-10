'use client';
import { useEffect, useState } from 'react';
import { Upload, Download, Trash2, File } from 'lucide-react';
import { getUser } from 'app/lib/auth';
import api from 'app/lib/api';
import Navbar from 'app/components/Navbar';

interface Resource {
  id: string; title: string; file_path: string; file_type: string;
  subject: string; semester: string; department: string;
  is_indexed: boolean; created_at: string; uploader_name: string;
}

export default function ResourcesPage() {
  const user = getUser();
  const [resources, setResources]   = useState<Resource[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ title: '', subject: '', semester: '', department: 'Computer Science & Engineering' });
  const [file, setFile]             = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/resources');
      setResources(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.post('/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setFile(null);
      fetchResources();
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    await api.delete(`/resources/${id}`);
    fetchResources();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Resource Library</h1>
          {user?.role !== 'student' && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Upload size={15} /> Upload Resource
            </button>
          )}
        </div>

        {/* Upload form */}
        {showForm && (
          <form onSubmit={handleUpload} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input required placeholder="Resource title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <div className="flex gap-3">
              <input required placeholder="Subject (e.g. Machine Learning)" value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <input placeholder="Semester (e.g. 5th)" value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })}
                className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <input type="file" accept=".pdf,.docx,.txt,.pptx" required
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="text-sm text-gray-600" />
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Uploading...' : 'Upload & Index'}
            </button>
          </form>
        )}

        {/* Resources grid */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-400 text-sm">No resources yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{r.title}</span>
                  </div>
                  {user?.role !== 'student' && (
                    <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.subject}</span>
                  {r.semester && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.semester}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_indexed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.is_indexed ? 'AI Indexed' : 'Indexing...'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{r.uploader_name} · {new Date(r.created_at).toLocaleDateString()}</p>
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${r.file_path.split('/').pop()}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-auto">
                  <Download size={13} /> Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}