'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import api from 'app/lib/api';

interface ClassItem {
  id: number;
  department: string;
  batch: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  subject_code: string;
  teacher: string;
  room: string;
}

const DEPARTMENTS = ['Computer Science & Engineering', 'Business Administration'];
const BATCHES = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];
const DAYS = ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function ManageRoutinePage() {
  const [routine, setRoutine] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState(DEPARTMENTS[0]);
  const [filterBatch, setFilterBatch] = useState(BATCHES[0]);
  const [teachers, setTeachers] = useState<{ id: number, full_name: string }[]>([]);

  const [form, setForm] = useState({
    department: DEPARTMENTS[0],
    batch: BATCHES[0],
    day_of_week: 'Sunday',
    start_time: '08:00',
    end_time: '09:30',
    subject: '',
    subject_code: '',
    teacher: '',
    room: '',
  });

  const loadRoutine = () => {
    setLoading(true);
    api.get(`/routine?department=${encodeURIComponent(filterDept)}&batch=${encodeURIComponent(filterBatch)}`)
      .then(({ data }) => { setRoutine(data); setLoading(false); });
  };

  useEffect(() => { loadRoutine(); }, [filterDept, filterBatch]);

  useEffect(() => {
    // Teachers load করো
    api.get('/users?role=faculty').then(({ data }) => {
      setTeachers(data);
    });
    loadRoutine();
  }, [filterDept, filterBatch]);

  const handleCreate = async () => {
    if (!form.subject || !form.teacher) return;
    setSaving(true);
    try {
      await api.post('/routine', form);
      setShowForm(false);
      setForm({
        department: DEPARTMENTS[0], batch: BATCHES[0],
        day_of_week: 'Sunday', start_time: '08:00', end_time: '09:30',
        subject: '', subject_code: '', teacher: '', room: '',
      });
      loadRoutine();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this class?')) return;
    await api.delete(`/routine/${id}`);
    setRoutine(prev => prev.filter(r => r.id !== id));
  };

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = routine.filter(r => r.day_of_week === day);
    return acc;
  }, {} as Record<string, ClassItem[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Manage Routine</h1>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                       rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={15} /> Add Class
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 block mb-1">Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 block mb-1">Batch</label>
            <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Add New Class</h2>
                <button onClick={() => setShowForm(false)}>
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Department</label>
                    <select value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Batch</label>
                    <select value={form.batch}
                      onChange={e => setForm({ ...form, batch: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Day</label>
                  <select value={form.day_of_week}
                    onChange={e => setForm({ ...form, day_of_week: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Start Time</label>
                    <input type="time" value={form.start_time}
                      onChange={e => setForm({ ...form, start_time: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">End Time</label>
                    <input type="time" value={form.end_time}
                      onChange={e => setForm({ ...form, end_time: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                    <input type="text" placeholder="e.g. Machine Learning"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Subject Code</label>
                    <input type="text" placeholder="e.g. CSE4101"
                      value={form.subject_code}
                      onChange={e => setForm({ ...form, subject_code: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Teacher</label>
                    <select value={form.teacher}
                      onChange={e => setForm({ ...form, teacher: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                      <option value="">— Select Teacher —</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.full_name}>{t.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Room</label>
                    <input type="text" placeholder="e.g. 301"
                      value={form.room}
                      onChange={e => setForm({ ...form, room: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <button onClick={handleCreate} disabled={saving}
                className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg text-sm
                           font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Class'}
              </button>
            </div>
          </div>
        )}

        {/* Routine list grouped by day */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : routine.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <p className="text-sm">এই batch এর কোনো routine নেই</p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.filter(day => grouped[day]?.length > 0).map(day => (
              <div key={day} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="font-semibold text-gray-700 text-sm">{day}</span>
                  <span className="ml-2 text-xs text-gray-400">{grouped[day].length} classes</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {grouped[day].map(cls => (
                    <div key={cls.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{cls.subject}
                          <span className="ml-2 text-xs text-gray-400">{cls.subject_code}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cls.start_time.slice(0, 5)} – {cls.end_time.slice(0, 5)} · {cls.teacher} · Room {cls.room}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(cls.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}