import React, { useState } from 'react';
import { MaterialItem, MaterialFormat } from '../types';
import { FileText, Video as VideoIcon, ClipboardList, Award, FileSpreadsheet, Plus, Trash2, ExternalLink, Filter } from 'lucide-react';

interface MaterialsViewProps {
  materials: MaterialItem[];
  onAddMaterial: (item: MaterialItem) => void;
  onDeleteMaterial: (id: string) => void;
}

const FORMATS: MaterialFormat[] = ['PDF', 'Video', 'Lembar Kerja', 'Soal Latihan'];
const CLASSES = ['Kelas VII', 'Kelas VIII', 'Kelas IX', 'Semua Kelas'];

export default function MaterialsView({ materials, onAddMaterial, onDeleteMaterial }: MaterialsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<MaterialFormat>('PDF');
  const [classGroup, setClassGroup] = useState('Kelas VII');
  const [description, setDescription] = useState('');
  const [urlOrFilename, setUrlOrFilename] = useState('');

  // Filtering states
  const [selectedFormat, setSelectedFormat] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: MaterialItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      format,
      classGroup,
      description: description.trim(),
      urlOrFilename: urlOrFilename.trim() || 'Internal Link / File di-upload',
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    onAddMaterial(newItem);
    setTitle('');
    setDescription('');
    setUrlOrFilename('');
    setShowAddForm(false);
  };

  // Filter items based on user choice
  const filteredMaterials = materials.filter((item) => {
    const matchesFormat = selectedFormat === 'Semua' || item.format === selectedFormat;
    const matchesClass = selectedClass === 'Semua' || item.classGroup === selectedClass || selectedClass === 'Semua Kelas';
    return matchesFormat && matchesClass;
  });

  // Unique card styling mapper based on format
  const getFormatStyle = (fmt: MaterialFormat) => {
    switch (fmt) {
      case 'PDF':
        return {
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          badgeClass: 'bg-rose-50 border-rose-100 text-rose-700',
          cardBorder: 'hover:border-rose-300 border-rose-100',
          titleBg: 'bg-rose-50/10 border-rose-100/50',
          headerBg: 'bg-rose-600',
          accentColor: 'rose',
          label: 'Modul PDF'
        };
      case 'Video':
        return {
          icon: <VideoIcon className="w-5 h-5 text-blue-600" />,
          badgeClass: 'bg-blue-50 border-blue-100 text-blue-700',
          cardBorder: 'hover:border-blue-300 border-blue-100',
          titleBg: 'bg-blue-50/10 border-blue-100/50',
          headerBg: 'bg-blue-600',
          accentColor: 'blue',
          label: 'Materi Video'
        };
      case 'Lembar Kerja':
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
          badgeClass: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          cardBorder: 'hover:border-emerald-300 border-emerald-100',
          titleBg: 'bg-emerald-50/10 border-emerald-100/50',
          headerBg: 'bg-emerald-600',
          accentColor: 'emerald',
          label: 'Lembar Kerja (LKS)'
        };
      case 'Soal Latihan':
        return {
          icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
          badgeClass: 'bg-amber-50 border-amber-100 text-amber-700',
          cardBorder: 'hover:border-amber-300 border-amber-100',
          titleBg: 'bg-amber-50/10 border-amber-100/50',
          headerBg: 'bg-amber-600',
          accentColor: 'amber',
          label: 'Soal Latihan / Evaluasi'
        };
    }
  };

  return (
    <div id="materials-container" className="space-y-6">
      {/* Materials Head & Create Trigger */}
      <div id="materials-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Bank Bahan Ajar</span>
          </h3>
          <p className="text-xs text-slate-500">
            Unggah dan susun bahan pembelajaran dengan skema penandaan warna unik per format file
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Form' : 'Unggah Bahan Baru'}</span>
        </button>
      </div>

      {/* Materials Submission Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50/55 rounded-2xl border border-blue-100 p-6 space-y-4 max-w-3xl">
          <h4 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-2">Form Unggah Bahan Ajar Baru</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Judul / Nama Bahan Ajar</label>
              <input
                required
                type="text"
                placeholder="Contoh: Modul Integral & Aljabar Sederhana"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Target Tingkat / Kelas</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Kelas VII">Kelas VII</option>
                <option value="Kelas VIII">Kelas VIII</option>
                <option value="Kelas IX">Kelas IX</option>
                <option value="Semua Kelas">Semua Kelas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Format Pembelajaran (Beda Warna Card)</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as MaterialFormat)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="PDF">Modul PDF (Kartu Merah Muda/Rose)</option>
                <option value="Video">Video Pembelajaran (Kartu Biru Indah)</option>
                <option value="Lembar Kerja">Lembar Kerja / LKS (Kartu Hijau Subur)</option>
                <option value="Soal Latihan">Soal Latihan / Kuis (Kartu Jingga Amber)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Tautan Sumber (Drive / YouTube / Link File)</label>
              <input
                type="text"
                placeholder="Contoh: https://drive.google.com/drive/... atau https://youtu.be/..."
                value={urlOrFilename}
                onChange={(e) => setUrlOrFilename(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Petunjuk Belajar / Deskripsi Singkat</label>
            <textarea
              rows={3}
              placeholder="Berikan petunjuk pengerjaan atau ulasan ringkas mengenai bahan ajar ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm font-medium transition-all cursor-pointer"
            >
              Simpan Bahan Ajar
            </button>
          </div>
        </form>
      )}

      {/* Resource Filtering Controls */}
      <div className="bg-white rounded-2xl border border-blue-50 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-600">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saring / Filter:</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Format Selection Dropdown or Badges */}
          <span className="text-xs text-slate-400">Format:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="Semua">Semua Format</option>
            <option value="PDF">Modul PDF</option>
            <option value="Video">Video Pembelajaran</option>
            <option value="Lembar Kerja">Lembar Kerja (LKS)</option>
            <option value="Soal Latihan">Soal Latihan</option>
          </select>

          <span className="text-xs text-slate-400 ml-2">Tingkat Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="Semua">Semua Tingkat</option>
            <option value="Kelas VII">Kelas VII</option>
            <option value="Kelas VIII">Kelas VIII</option>
            <option value="Kelas IX">Kelas IX</option>
            <option value="Semua Kelas">Gabungan (Semua Kelas)</option>
          </select>
        </div>
      </div>

      {/* Colored Cards Grid Output */}
      {filteredMaterials.length === 0 ? (
        <div id="materials-empty" className="bg-white rounded-2xl border border-dashed border-blue-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-slate-700 font-bold mb-1">Bahan Ajar Masih Kosong</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Halaman media ajar ini bersih dari sample data dummy. Unggah bahan berformat **PDF, Video, Lembar Kerja, atau Soal Latihan** dengan mengklik tombol di kanan atas.
          </p>
        </div>
      ) : (
        <div id="materials-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => {
            const style = getFormatStyle(item.format);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-t-4 border ${style.cardBorder} shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300`}
                style={{ borderTopColor: item.format === 'PDF' ? '#e11d48' : item.format === 'Video' ? '#2563eb' : item.format === 'Lembar Kerja' ? '#059669' : '#d97706' }}
              >
                {/* Header Card Area */}
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badgeClass}`}>
                    {style.icon}
                    <span>{style.label}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {item.classGroup}
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-800 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {item.description || 'Tidak ada petunjuk tambahan dari guru.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Diinput: {item.createdAt}</span>

                    <div className="flex items-center space-x-3">
                      {item.urlOrFilename.startsWith('http') && (
                        <a
                          href={item.urlOrFilename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-all"
                          title="Buka Tautan Eksternal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-all"
                        title="Hapus Bahan Ajar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
