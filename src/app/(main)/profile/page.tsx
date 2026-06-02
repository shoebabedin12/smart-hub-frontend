'use client';
import { useEffect, useState, useRef } from 'react';
import { User, Camera, Save } from 'lucide-react';
import api from 'app/lib/api';

const BATCHES = ['2021-22','2022-23','2023-24','2024-25','2025-26'];

interface Profile {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
  batch: string;
  profile_photo: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [form, setForm]               = useState({ full_name: '', department: '', batch: '' });
  const [photo, setPhoto]             = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState(false);
  const fileRef                       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get('/profile'),
      api.get('/departments')
    ])
    .then(([profileRes, deptRes]) => {
      const profileData = profileRes.data;
      const deptData = deptRes.data;

      setProfile(profileData);
      setDepartments(deptData);
      
      setForm({
        full_name:  profileData.full_name  || '',
        department: profileData.department || deptData || '',
        batch: profileData.batch || BATCHES[0],
      });
      setLoading(false);
    })
    .catch(err => {
      console.error("Data loading error:", err);
      setLoading(false);
    });
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const fd = new FormData();
    fd.append('full_name',  form.full_name);
    fd.append('department', form.department);
    fd.append('batch',      form.batch);
    if (photo) fd.append('photo', photo);
    try {
      const { data } = await api.put('/profile', fd);
      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <p className="text-center text-gray-400 mt-20 text-sm">Loading...</p>
    </div>
  );

const photoUrl =
  preview ||
  (profile?.profile_photo
    ? profile.profile_photo
    : null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300
                         flex items-center justify-center cursor-pointer overflow-hidden
                         hover:border-blue-400 transition-colors relative group"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="photo" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Click to change photo</p>
            <input ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handlePhoto} />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm
                            text-gray-400 bg-gray-50">
              {profile?.email}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         outline-none focus:border-blue-500"
            />
          </div>

          {/* Department (Dynamic Dropdown) */}
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Department</label>
            <select
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         outline-none focus:border-blue-500"
            >
              {Array.isArray(departments) && departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          {profile?.role !== "admin" && <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Batch</label>
            <select
              value={form.batch}
              onChange={e => setForm({ ...form, batch: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                         outline-none focus:border-blue-500"
            >
              {BATCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>}

          {/* Save button */}
          {success && (
            <p className="text-green-600 text-sm text-center">✓ Profile updated!</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm
                       hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}