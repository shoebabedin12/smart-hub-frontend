'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import api from 'app/lib/api';

interface Assignment {
  id: number;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  teacher_name: string;
  submitted: boolean;
}

function getDeadlineStatus(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);
  const diff = due.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: AlertCircle };
  if (days <= 2) return { label: `${days}d left`, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', icon: Clock };
  return { label: `${days}d left`, color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: Clock };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [studentDept, setStudentDept] = useState('');

  useEffect(() => {
    // ১. প্রথমে স্টুডেন্টের প্রোফাইল থেকে তার ডিপার্টমেন্ট আইডি ও ব্যাচ আনা হচ্ছে
    api.get('/profile')
      .then(({ data: profile }) => {
        const deptId = profile.department_id;
        const batch = profile.batch;
        setStudentDept(profile.department_name || 'Your Department');

        if (!deptId || !batch) {
          setLoading(false);
          return;
        }

        // ২. সঠিক ডিপার্টমেন্ট আইডি এবং ব্যাচ কুয়েরি প্যারামিটার হিসেবে পাঠানো হচ্ছে
        api.get(`/assignments?department_id=${deptId}&batch=${encodeURIComponent(batch)}`)
          .then(({ data }) => {
            const safeData = Array.isArray(data) ? data : [];
            setAssignments(safeData);
            setLoading(false);
          })
          .catch(() => {
            setAssignments([]);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (id: number) => {
    try {
      await api.post(`/assignments/${id}/submit`, {});
      setAssignments(prev =>
        prev.map(a => a.id === id ? { ...a, submitted: true } : a)
      );
    } catch (err) {
      console.error('Error submitting assignment:', err);
    }
  };

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.submitted;
    if (filter === 'submitted') return a.submitted;
    return true;
  });

  const pendingCount = assignments.filter(a => !a.submitted).length;
  const submittedCount = assignments.filter(a => a.submitted).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          <div className="flex gap-3 text-xs">
            <span className="text-orange-500 font-semibold">{pendingCount} pending</span>
            <span className="text-green-600 font-semibold">{submittedCount} submitted</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-6">{studentDept}</p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'submitted'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full cursor-pointer text-xs font-medium border transition-colors capitalize
                ${filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <CheckCircle size={40} className="mx-auto mb-3" />
            <p className="text-sm">কোনো assignment নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => {
              const status = getDeadlineStatus(a.deadline);
              const StatusIcon = status.icon;
              return (
                <div key={a.id}
                  className={`border rounded-xl p-4 bg-white transition-all
                    ${a.submitted ? 'opacity-70' : ''}`}>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {a.subject}
                        </span>
                        {a.submitted && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> Submitted
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800">{a.title}</p>
                      {a.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>by {a.teacher_name || 'Faculty'}</span>
                        <span className={`flex items-center gap-1 font-medium ${status.color}`}>
                          <StatusIcon size={11} />
                          {new Date(a.deadline).toLocaleDateString('en-BD', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })} · {status.label}
                        </span>
                      </div>
                    </div>

                    {!a.submitted && (
                      <button onClick={() => handleSubmit(a.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                        <Circle size={12} />
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}