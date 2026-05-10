'use client';
import { useEffect, useState } from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { getUser } from 'app/lib/auth';
import api from 'app/lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_COLORS: Record<string, string> = {
  Sunday: 'bg-red-50 border-red-200',
  Monday: 'bg-blue-50 border-blue-200',
  Tuesday: 'bg-green-50 border-green-200',
  Wednesday: 'bg-yellow-50 border-yellow-200',
  Thursday: 'bg-purple-50 border-purple-200',
};
const DAY_BADGE: Record<string, string> = {
  Sunday: 'bg-red-100 text-red-700',
  Monday: 'bg-blue-100 text-blue-700',
  Tuesday: 'bg-green-100 text-green-700',
  Wednesday: 'bg-yellow-100 text-yellow-700',
  Thursday: 'bg-purple-100 text-purple-700',
};

interface ClassItem {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  subject_code: string;
  teacher: string;
  room: string;
}

export default function RoutinePage() {
  const user = getUser();
  const [routine, setRoutine] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDept, setProfileDept] = useState('');  // ← add
  const [profileBatch, setProfileBatch] = useState(''); // ← add
  const [activeDay, setActiveDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(today) ? today : 'Sunday';
  });

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setProfileDept(data.department || '');   // ← add
      setProfileBatch(data.batch || '');       // ← add
      if (!data.department || !data.batch) { setLoading(false); return; }
      api.get(`/routine?department=${encodeURIComponent(data.department)}&batch=${encodeURIComponent(data.batch)}`)
        .then(({ data: routineData }) => {
          setRoutine(routineData);
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, []);

  const grouped = DAYS.reduce((acc, day) => {
  acc[day] = routine.filter(r => r.day_of_week === day);
  return acc;
}, {} as Record<string, ClassItem[]>);

const todayClasses = grouped[activeDay] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Class Routine</h1>
            {profileDept && (
              <p className="text-xs text-gray-400 mt-0.5">{user.department} — Batch {user.batch}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${DAY_BADGE[activeDay] || 'bg-gray-100 text-gray-600'}`}>
            Today: {activeDay}
          </span>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {DAYS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${activeDay === day
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {day}
              {grouped[day]?.length > 0 && (
                <span className="ml-1.5 bg-white/30 text-current px-1.5 rounded-full">
                  {grouped[day].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Classes */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : !profileDept || !profileBatch ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Profile এ Department ও Batch আপডেট করো</p>
          </div>
        ) : todayClasses.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <Clock size={40} className="mx-auto mb-3" />
            <p className="text-sm">{activeDay} তে কোনো class নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayClasses.map(cls => (
              <div key={cls.id}
                className={`border rounded-xl p-4 ${DAY_COLORS[activeDay]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{cls.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cls.subject_code}</p>
                  </div>
                  <span className="text-xs font-mono bg-white border border-gray-200
                                   px-2 py-1 rounded-lg text-gray-600">
                    {cls.start_time.slice(0, 5)} – {cls.end_time.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={11} /> {cls.teacher}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> Room {cls.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}