'use client';
import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import { getUser } from 'app/lib/auth';
import api from 'app/lib/api';

interface Result {
  id: string; semester: string; subject: string;
  subject_code: string; credit: number; grade: string;
  grade_point: number; student_name: string;
}
interface Student { id: number; full_name: string; email: string; batch: string; }

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-700', 'A': 'bg-green-100 text-green-600',
  'A-': 'bg-blue-100 text-blue-700',   'B+': 'bg-yellow-100 text-yellow-700',
  'B':  'bg-yellow-100 text-yellow-600','B-': 'bg-orange-100 text-orange-700',
  'F':  'bg-red-100 text-red-700',
};

export default function ResultsPage() {
  const user    = getUser();
  const isAdmin = user?.role !== 'student';

  const [results, setResults]       = useState<Result[]>([]);
  const [departments, setDepts]     = useState<string[]>([]);
  const [batches, setBatches]       = useState<string[]>([]);
  const [students, setStudents]     = useState<Student[]>([]);

  const [selDept, setSelDept]       = useState('');
  const [selBatch, setSelBatch]     = useState('');
  const [selStudent, setSelStudent] = useState('');
  const [semester, setSemester]     = useState('all');
  const [loading, setLoading]       = useState(false);

  // Student: load own results
  useEffect(() => {
    if (!isAdmin) {
      setLoading(true);
      api.get('/results').then(({ data }) => {
        setResults(data.results || []);
        setLoading(false);
      });
    } else {
      // Admin: load departments
      api.get('/results').then(({ data }) => {
        setDepts(data.departments || []);
      });
    }
  }, []);

  // Department select → load batches
  const handleDeptSelect = async (dept: string) => {
    setSelDept(dept);
    setSelBatch('');
    setSelStudent('');
    setStudents([]);
    setResults([]);
    setBatches([]);
    const { data } = await api.get(`/results?department=${encodeURIComponent(dept)}`);
    setBatches(data.batches || []);
  };

  // Batch select → load students
  const handleBatchSelect = async (batch: string) => {
    setSelBatch(batch);
    setSelStudent('');
    setResults([]);
    setStudents([]);
    const { data } = await api.get(
      `/results?department=${encodeURIComponent(selDept)}&batch=${encodeURIComponent(batch)}`
    );
    setStudents(data.students || []);
  };

  // Student select → load results
  const handleStudentSelect = async (id: string) => {
    setSelStudent(id);
    setSemester('all');
    setLoading(true);
    const { data } = await api.get(`/results?student_id=${id}`);
    setResults(data.results || []);
    setLoading(false);
  };

  const semesters = ['all', ...Array.from(new Set(results.map(r => r.semester)))];
  const filtered  = semester === 'all' ? results : results.filter(r => r.semester === semester);

  const calcCGPA = (rows: Result[]) => {
    const tc = rows.reduce((s, r) => s + Number(r.credit), 0);
    const tp = rows.reduce((s, r) => s + Number(r.grade_point) * Number(r.credit), 0);
    return tc ? (tp / tc).toFixed(2) : '0.00';
  };

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.semester]) acc[r.semester] = [];
    acc[r.semester].push(r);
    return acc;
  }, {} as Record<string, Result[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {isAdmin ? 'Student Results' : 'My Results'}
          </h1>
          {results.length > 0 && (
            <div className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">CGPA: {calcCGPA(results)}</span>
            </div>
          )}
        </div>

        {/* Admin filters */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">

            {/* Department */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Department</label>
              <select value={selDept} onChange={e => handleDeptSelect(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">— Department select করো —</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Batch */}
            {batches.length > 0 && (
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Batch</label>
                  <select value={selBatch} onChange={e => handleBatchSelect(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="">— Batch select করো —</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Student */}
            {students.length > 0 && (
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Student</label>
                  <select value={selStudent} onChange={e => handleStudentSelect(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="">— Student select করো —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Semester filter */}
        {results.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {semesters.map(s => (
              <button key={s} onClick={() => setSemester(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${semester === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {s === 'all' ? 'All Semesters' : `${s} Semester`}
              </button>
            ))}
          </div>
        )}

        {/* Empty states */}
        {!loading && results.length === 0 && (
          <div className="text-center py-16 text-gray-300">
            <BookOpen size={40} className="mx-auto mb-3" />
            <p className="text-sm">
              {isAdmin && !selDept ? 'Department select করো'
                : isAdmin && !selBatch ? 'Batch select করো'
                : isAdmin && !selStudent ? 'Student select করো'
                : 'কোনো result পাওয়া যায়নি'}
            </p>
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-6">
            {Object.entries(grouped).map(([sem, rows]) => (
              <div key={sem} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-blue-600" />
                    <span className="font-semibold text-gray-800 text-sm">{sem} Semester</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    GPA: <span className="font-semibold text-blue-600">{calcCGPA(rows)}</span>
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <th className="text-left px-5 py-2 font-medium">Subject</th>
                      <th className="text-center px-3 py-2 font-medium">Code</th>
                      <th className="text-center px-3 py-2 font-medium">Credit</th>
                      <th className="text-center px-3 py-2 font-medium">Grade</th>
                      <th className="text-center px-3 py-2 font-medium">Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-800">{r.subject}</td>
                        <td className="px-3 py-3 text-center text-gray-500 text-xs">{r.subject_code}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{r.credit}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${GRADE_COLORS[r.grade] || 'bg-gray-100 text-gray-600'}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{r.grade_point}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}