import React, { useState } from 'react';
import { TeacherProfile } from '../types';
import { User, Mail, Phone, BookOpen, School, Award, Edit3, Check, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  profile: TeacherProfile;
  onChangeProfile: (updatedProfile: TeacherProfile) => void;
}

export default function ProfileView({ profile, onChangeProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TeacherProfile>({ ...profile });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile(formData);
    setIsEditing(false);
    setSuccessMsg('Profil berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReset = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  return (
    <div id="profile-container" className="space-y-6">
      {/* Visual Header Banner */}
      <div id="profile-banner" className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-10">
          <BookOpen className="w-64 h-64 -mr-10 -mb-10 text-white" />
        </div>
      </div>

      <div id="profile-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-16 px-4">
        {/* Profile Card Summary */}
        <div id="profile-card" className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-blue-100 rounded-full border-4 border-white flex items-center justify-center text-blue-600 shadow-sm">
              <User className="w-12 h-12" />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 border-2 border-white rounded-full p-1.5 text-white">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
          <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">
            {profile.subject}
          </p>
          <p className="text-xs text-slate-500 mt-1">{profile.school || 'SMP Belum Diatur'}</p>

          <hr className="w-full my-6 border-slate-100" />

          <div className="w-full space-y-4 text-left">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <School className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 leading-none">NIP</p>
                <p className="font-medium truncate">{profile.nip || 'Belum diisi'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 leading-none">Email Institusi</p>
                <p className="font-medium truncate" title={profile.email}>{profile.email || 'Belum diisi'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 leading-none">No. Telepon / WA</p>
                <p className="font-medium truncate">{profile.phone || 'Belum diisi'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Editing or Info Panels */}
        <div id="profile-details-panel" className="lg:col-span-2 space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center space-x-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Informasi Pendidik</h3>
                <p className="text-xs text-slate-500">Lengkapi data profil utama untuk administrasi portal</p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  id="btn-edit-profile"
                  onClick={() => {
                    setFormData({ ...profile });
                    setIsEditing(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer font-medium text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ubah Profil</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Biografi Singkat</h4>
                  <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl leading-relaxed italic border border-slate-100">
                    {profile.bio || 'Belum ada biografi ditulis.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Mata Pelajaran</h4>
                    <p className="text-slate-800 font-medium text-sm border-b border-slate-100 pb-2">{profile.subject}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Satuan Pendidikan</h4>
                    <p className="text-slate-800 font-medium text-sm border-b border-slate-100 pb-2">{profile.school || 'Belum ditentukan'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">NIP (Nomor Induk Pegawai)</h4>
                    <p className="text-slate-800 font-medium text-sm border-b border-slate-100 pb-2">{profile.nip || 'Belum ditentukan'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Kontak Resmi</h4>
                    <p className="text-slate-800 font-medium text-sm border-b border-slate-100 pb-2">{profile.phone || 'Belum ditentukan'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      required
                      type="text"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Mata Pelajaran Diampu</label>
                    <input
                      required
                      type="text"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">NIP</label>
                    <input
                      type="text"
                      placeholder="19xxxxxxxxxxxxxx"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sekolah / Instansi</label>
                    <input
                      type="text"
                      placeholder="SMP Negeri ..."
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email Sekolah</label>
                    <input
                      type="email"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Telepon</label>
                    <input
                      type="text"
                      placeholder="+62..."
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Biografi & Deskripsi Mengajar</label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan biografi singkat Anda di sini..."
                    className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none leading-relaxed"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center space-x-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all font-medium text-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all font-medium text-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
