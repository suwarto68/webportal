import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { Calendar, Trash2, Plus, Clock, MapPin, Tag } from 'lucide-react';

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  onAddSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
}

const CLASSES = ['VII-A', 'VII-B', 'VII-C', 'VIII-A', 'VIII-B', 'VIII-C', 'IX-A', 'IX-B', 'IX-C'];
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ScheduleView({ schedules, onAddSchedule, onDeleteSchedule }: ScheduleViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [day, setDay] = useState('Senin');
  const [timeStart, setTimeStart] = useState('07:30');
  const [timeEnd, setTimeEnd] = useState('09:00');
  const [classGroup, setClassGroup] = useState('VII-A');
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newItem: ScheduleItem = {
      id: crypto.randomUUID(),
      day,
      timeStart,
      timeEnd,
      classGroup,
      topic: topic.trim(),
    };

    onAddSchedule(newItem);
    setTopic('');
    setShowAddForm(false);
  };

  // Group schedules by Day for beautiful organization
  const groupedSchedules = DAYS.reduce<Record<string, ScheduleItem[]>>((acc, d) => {
    acc[d] = schedules.filter((s) => s.day === d).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
    return acc;
  }, {});

  return (
    <div id="schedule-container" className="space-y-6">
      <div id="schedule-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Jadwal Mengajar Mingguan</span>
          </h3>
          <p className="text-xs text-slate-500">Kelola jam dan kelas tatap muka mata pelajaran matematika</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all font-medium text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Form' : 'Tambah Jadwal'}</span>
        </button>
      </div>

      {/* Add New Schedule Form Overlay/Toggle */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50/55 rounded-2xl border border-blue-100 p-6 space-y-4 max-w-2xl">
          <h4 className="text-sm font-bold text-blue-900 border-b border-blue-100 pb-2">Form Tambah Jadwal Mengajar Baru</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hari Kerja</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Jam Mulai</label>
              <input
                required
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Jam Selesai</label>
              <input
                required
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Rombel / Kelas</label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Topik / Bahasan Pembelajaran</label>
              <input
                required
                type="text"
                placeholder="Contoh: Bilangan Bulat / Persamaan Linear"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              required
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm font-medium transition-all cursor-pointer"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      )}

      {/* Main Schedule Visual Grid */}
      {schedules.length === 0 ? (
        <div id="schedule-empty" className="bg-white rounded-2xl border border-dashed border-blue-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h4 className="text-slate-700 font-bold mb-1">Belum Ada Jadwal Mengajar</h4>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Halaman jadwal ini bersih dari data dummy. Rekam jadwal riil Anda dengan menekan tombol **Tambah Jadwal** di atas.
          </p>
        </div>
      ) : (
        <div id="schedule-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS.map((d) => {
            const daySchedules = groupedSchedules[d] || [];
            if (daySchedules.length === 0) return null;

            return (
              <div key={d} className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-blue-600 px-4 py-3 text-white font-bold flex justify-between items-center text-sm">
                  <span>Hari {d}</span>
                  <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full font-medium">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-3">
                  {daySchedules.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-slate-50 hover:bg-blue-50/40 border border-slate-100 rounded-xl p-3.5 transition-all text-sm flex justify-between items-start"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                        <div className="flex items-center text-xs text-slate-500 space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.timeStart} - {item.timeEnd}</span>
                        </div>

                        <p className="font-bold text-slate-800 leading-tight truncate" title={item.topic}>
                          {item.topic}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            Kelas {item.classGroup}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteSchedule(item.id)}
                        className="p-1 px-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
