import React, { useState } from 'react';
import { SyllabusItem } from '../types';
import { BookMarked, Plus, Trash2, Layers, Award } from 'lucide-react';

interface SyllabusViewProps {
  syllabusList: SyllabusItem[];
  onAddSyllabus: (item: SyllabusItem) => void;
  onDeleteSyllabus: (id: string) => void;
}

export default function SyllabusView({ syllabusList, onAddSyllabus, onDeleteSyllabus }: SyllabusViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [classGroup, setClassGroup] = useState('VII');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [basicCompetency, setBasicCompetency] = useState('');
  const [allocatedTime, setAllocatedTime] = useState(10); // Jam pelajaran (JP)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newItem: SyllabusItem = {
      id: crypto.randomUUID(),
      classGroup,
      topic: topic.trim(),
      description: description.trim(),
      basicCompetency: basicCompetency.trim(),
      allocatedTime: Number(allocatedTime),
    };

    onAddSyllabus(newItem);
    setTopic('');
    setDescription('');
    setBasicCompetency('');
    setAllocatedTime(10);
    setShowAddForm(false);
  };

  // Filter syllabus list based on Class Group (VII, VIII, IX)
  const syllabusVII = syllabusList.filter(s => s.classGroup === 'VII');
  const syllabusVIII = syllabusList.filter(s => s.classGroup === 'VIII');
  const syllabusIX = syllabusList.filter(s => s.classGroup === 'IX');

  const renderSyllabusSection = (title: string, items: SyllabusItem[]) => {
    return (
      <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
          <span>Silabus Matematika Kelas {title}</span>
        </h4>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada rincian silabus yang didaftarkan untuk Kelas {title}.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 relative hover:border-blue-100 transition-all text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{item.topic}</h5>
                    <p className="text-xs text-blue-600 font-medium bg-blue-50/70 inline-block px-2.5 py-0.5 rounded-full mt-1.5">
                      Alokasi: {item.allocatedTime} JP (Jam Pelajaran)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteSyllabus(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/50 pt-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">
                      Kompetensi Dasar (KD) / Tujuan
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {item.basicCompetency || 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">
                      Materi Pembelajaran / Deskripsi
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {item.description || 'Belum diisi'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="syllabus-container" className="space-y-6">
      <div id="syllabus-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-blue-600" />
            <span>Format Silabus Kurikulum</span>
          </h3>
          <p className="text-xs text-slate-500">Sesuaikan perataan kurikulum matematika tingkat SMP di tiap jenjang kelas</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Form' : 'Daftarkan Capaian/Bab'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50/55 rounded-2xl border border-blue-100 p-6 space-y-4 max-w-3xl">
          <h4 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-2">Form Tambah Materi Silabus / Bab Baru</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tingkatan Jenjang Kelas</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="VII">Kelas VII (Tujuh)</option>
                <option value="VIII">Kelas VIII (Delapan)</option>
                <option value="IX">Kelas IX (Sembilan)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Judul Bab / Topik Utama</label>
              <input
                required
                type="text"
                placeholder="Contoh: Bab 1 - Pola Bilangan dan Deret"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tujuan Pembelajaran / Kompetensi Dasar (KD)</label>
              <textarea
                rows={3}
                placeholder="Deskripsikan kompetensi atau target capaian kognitif esensial..."
                value={basicCompetency}
                onChange={(e) => setBasicCompetency(e.target.value)}
                className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Materi Esensial / Lingkup Deskripsi</label>
              <textarea
                rows={3}
                placeholder="Uraian bab esensial, penugasan, teknik penilaian dan pemahaman..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Alokasi Waktu (JP - Jam Pelajaran)</label>
            <input
              required
              type="number"
              min={1}
              max={100}
              value={allocatedTime}
              onChange={(e) => setAllocatedTime(Number(e.target.value))}
              className="w-32 text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm font-medium transition-all cursor-pointer"
            >
              Daftarkan Silabus
            </button>
          </div>
        </form>
      )}

      {syllabusList.length === 0 ? (
        <div id="syllabus-empty" className="bg-white rounded-2xl border border-dashed border-blue-200 p-12 text-center">
          <BookMarked className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h4 className="text-slate-700 font-bold mb-1">Silabus Masih Kosong</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
            Portal ini bersifat data riil guru. Silakan daftarkan rincian silabus Matematika Anda per jenjang kelas.
          </p>
        </div>
      ) : (
        <div id="syllabus-grid" className="space-y-6">
          {renderSyllabusSection('VII', syllabusVII)}
          {renderSyllabusSection('VIII', syllabusVIII)}
          {renderSyllabusSection('IX', syllabusIX)}
        </div>
      )}
    </div>
  );
}
