/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp, Users, Trash2, X } from 'lucide-react';
import api from 'app/lib/api';

interface Assignment {
  id: number;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  department_name: string;
  batch: string;
  teacher_name: string;
  submission_count: number;
}

interface Submission {
  id: number;
  full_name: string;
  email: string;
  batch: string;
  submitted_at: string;
}

interface Department {
  id: number;
  name: string;
}

export default function ManageAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Record<number, Submission[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    department_id: '',
    batch: '',
    subject: '',
    title: '',
    description: '',
    deadline: '',
  });
  const [saving, setSaving] = useState(false);

  // Generate dynamic batches based on current year
 const generateDynamicBatches = useCallback(() => {
  const currentYear = new Date().getFullYear();

  const generated = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year - 1}-${String(year).slice(-2)}`;
  });

  setBatches(generated);

  return generated || '';
}, []);

  // Wrap inside useCallback to solve ESLint dependency warnings
const loadInitialData = useCallback(async () => {
  try {
    const generatedBatches = generateDynamicBatches();

    const { data: deptData } = await api.get('/departments');

    setDepartments(Array.isArray(deptData) ? deptData : []);

    if (Array.isArray(deptData) && deptData.length > 0) {
      setForm(prev => ({
        ...prev,
        department_id: String(deptData[0].id),
        batch: generatedBatches[0] || '',
      }));
    }

    const { data: assignData } = await api.get('/assignments/manage');

    setAssignments(Array.isArray(assignData) ? assignData : []);

  } catch (err) {
    console.error('Initialization Error:', err);
  } finally {
    setLoading(false);
  }
}, [generateDynamicBatches]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadAssignmentsOnly = () => {
    api.get('/assignments/manage').then(({ data }) => setAssignments(data));
  };

  const toggleExpand = async (id: number) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!submissions[id]) {
      const { data } = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(prev => ({ ...prev, [id]: data }));
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.subject || !form.deadline || !form.department_id) return;
    setSaving(true);
    try {
      await api.post('/assignments', {
        ...form,
        department_id: Number(form.department_id)
      });
      setShowForm(false);
      setForm(prev => ({
        ...prev,
        subject: '',
        title: '',
        description: '',
        deadline: ''
      }));
      loadAssignmentsOnly();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Manage Assignments</h1>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
            <Plus size={15} /> New Assignment
          </button>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">New Assignment</h2>
                <button onClick={() => setShowForm(false)} className="cursor-pointer">
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Dynamic Department Dropdown */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Department</label>
                  <select value={form.department_id}
                    onChange={e => setForm({ ...form, department_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                {/* Dynamic Batch Dropdown */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Batch</label>
                  <select value={form.batch}
                    onChange={e => setForm({ ...form, batch: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                  <input type="text" placeholder="e.g. Machine Learning"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
                  <input type="text" placeholder="Assignment title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                  <textarea placeholder="Assignment details..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Deadline</label>
                  <input type="datetime-local"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <button onClick={handleCreate} disabled={saving}
                className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                {saving ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        )}

        {/* Assignment List */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <p className="text-sm">No assignments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Assignment header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {a.subject}
                      </span>
                      <span className="text-xs text-gray-400">
                        {a.department_name} · Batch {a.batch}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Deadline: {new Date(a.deadline).toLocaleDateString('en-BD', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Submission count */}
                    <button onClick={() => toggleExpand(a.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer">
                      <Users size={12} />
                      {a.submission_count} submitted
                      {expanded === a.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Delete */}
                    <button onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Submissions list */}
                {expanded === a.id && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                    {submissions[a.id]?.length === 0 ? (
                      <p className="text-xs text-gray-400">No submissions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {submissions[a.id]?.map(s => (
                          <div key={s.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">{s.full_name}</p>
                              <p className="text-xs text-gray-400">{s.email} · Batch {s.batch}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(s.submitted_at).toLocaleDateString('en-BD', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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