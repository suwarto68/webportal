import React, { useState, useEffect } from 'react';
import { ClassGroup, Student, AttendanceSession, AttendanceRecord } from '../types';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Save, 
  History, 
  UserPlus, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  X,
  Sparkles,
  Copy,
  Send,
  ExternalLink,
  Database,
  RefreshCw,
  Home
} from 'lucide-react';

interface AttendanceViewProps {
  classes: ClassGroup[];
  onAddClass: (newCls: ClassGroup) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (classId: string, student: Student) => void;
  onDeleteStudent: (classId: string, studentId: string) => void;
  attendanceSessions: AttendanceSession[];
  onSaveAttendance: (session: AttendanceSession) => void;
  onResetClasses?: (newClasses: ClassGroup[]) => void;
  defaultRombelData?: ClassGroup[];
  onBackToHome?: () => void;
}

const CLASS_OPTIONS = ['7A', '7B', '8A', '8B', '9A', '9B'];

export default function AttendanceView({
  classes,
  onAddClass,
  onDeleteClass,
  onAddStudent,
  onDeleteStudent,
  attendanceSessions,
  onSaveAttendance,
  onResetClasses,
  defaultRombelData,
  onBackToHome,
}: AttendanceViewProps) {
  // Navigation tab within attendance state ('absen' | 'kelola' | 'riwayat' | 'sheets')
  const [activeSubTab, setActiveSubTab] = useState<'absen' | 'kelola' | 'riwayat' | 'sheets'>('absen');

  // Shared active filters inside Attendance View
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance states
  const [attRecords, setAttRecords] = useState<Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpha'>>({});

  // Student management states inside tab 'kelola'
  const [kelolaClassId, setKelolaClassId] = useState<string>('7A');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');

  // Modals for success and failure notifications
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [lastSavedRows, setLastSavedRows] = useState<Array<{ no: number; nama: string; kelas: string; status: string; tanggal: string }>>([]);

  // Google Sheets integration state
  const [sheetsUrl, setSheetsUrl] = useState<string>(() => localStorage.getItem('smp_guru_sheets_url') || '');
  const [hasCopied, setHasCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('smp_guru_sheets_url', sheetsUrl);
  }, [sheetsUrl]);

  // Send rows logic to Google Sheets
  const handleSyncToSheets = async (customData?: typeof lastSavedRows) => {
    const dataToSync = customData || lastSavedRows;
    if (dataToSync.length === 0) {
      setSyncStatus('error');
      setSyncMessage('Tidak ada data presensi yang siap untuk disinkronisasi.');
      return;
    }
    if (!sheetsUrl.trim()) {
      setSyncStatus('error');
      setSyncMessage('Silakan konfigurasi URL Web App Google Apps Script Anda terlebih dahulu di tab "Integrasi Sheets".');
      return;
    }

    setSyncStatus('loading');
    setSyncMessage('Menghubungkan & mengirim data ke Google Sheets...');

    try {
      const response = await fetch(sheetsUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // Avoid complex CORS preflights natively
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSync),
      });

      // Since we use 'no-cors', response type might be opaque. 
      // If we got here without throwing, Apps Script received the transmission normally.
      setSyncStatus('success');
      setSyncMessage('Data presensi berhasil disinkronkan ke file Google Sheets Anda!');
    } catch (error: any) {
      console.error('Error during Sheets sync:', error);
      setSyncStatus('error');
      setSyncMessage(`Terjadi kendala jaringan saat menghubungkan ke Google Sheets: ${error?.message || error}`);
    }
  };

  // Helper code for copyable Google Apps Script
  const googleAppsScriptCode = `/**
 * GOOGLE APPS SCRIPT: Sinkronisasi Presensi Portal Guru SMP
 * 
 * Script ini otomatis memetakan data presensi sekolah ke dalam sheet masing-masing:
 * - "Kelas 7A", "Kelas 7B", "Kelas 8A", "Kelas 8B" (atau "Kelas 8 B"), "Kelas 9A", "Kelas 9B"
 * Serta otomatis membuat Header ("No", "Nama Siswa", "Kelas", "Status", "Tanggal") 
 * jika sheet terkait masih kosong atau baru dibuat.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Menghindari tabrakan penulisan data paralel dengan kunci tunggu maksimal 10 detik
    lock.waitLock(10000); 
    
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({
        "status": "error",
        "message": "Tidak ada data payload yang dikirimkan."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var recordsAdded = 0;
    var targetSheetNameUsed = "";
    
    // Ubah data tunggal menjadi array jika format objek tunggal
    var records = Array.isArray(data) ? data : [data];
    
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      
      // Ambil nilai properti yang dikirimkan
      var no = record.no || record.No || (i + 1);
      var nama = record.nama || record["Nama Siswa"] || record.NamaSiswa || "";
      var kelas = record.kelas || record.Kelas || "";
      var status = record.status || record.Status || "Hadir";
      var tanggal = record.tanggal || record.Tanggal || "";
      
      if (!kelas) continue; // Lewati jika tidak ada informasi kelas
      
      // Standarisasi & pemetaan nama sheet agar tepat sesuai rumpun kelas resmi:
      var classKey = kelas.toString().toUpperCase().replace(/\\s+/g, ""); // "8B", "7A", dll
      var sheetName = "";
      
      if (classKey === "7A" || classKey === "KELAS7A") {
        sheetName = "Kelas 7A";
      } else if (classKey === "7B" || classKey === "KELAS7B") {
        sheetName = "Kelas 7B";
      } else if (classKey === "8A" || classKey === "KELAS8A") {
        sheetName = "Kelas 8A";
      } else if (classKey === "8B" || classKey === "KELAS8B" || classKey === "8" || classKey === "KELAS8B") {
        sheetName = "Kelas 8B"; // Default target
      } else if (classKey === "9A" || classKey === "KELAS9A") {
        sheetName = "Kelas 9A";
      } else if (classKey === "9B" || classKey === "KELAS9B") {
        sheetName = "Kelas 9B";
      } else {
        // Fallback dinamis jika ada kelas kustom lainnya
        sheetName = kelas.toString().trim();
        if (!sheetName.toUpperCase().startsWith("KELAS ")) {
          sheetName = "Kelas " + sheetName;
        }
      }
      
      // Cek variasi nama sheet yang ada di spreadsheet untuk menghindari tab duplikat
      // Jika mencari "Kelas 8B", namun yang sudah ada di sheet adalah "Kelas 8 B", gunakan yang sudah ada.
      var sheet = activeSpreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        if (sheetName === "Kelas 8B") {
          var altSheet = activeSpreadsheet.getSheetByName("Kelas 8 B");
          if (altSheet) {
            sheet = altSheet;
            sheetName = "Kelas 8 B";
          }
        } else if (sheetName === "Kelas 8 B") {
          var altSheetName = activeSpreadsheet.getSheetByName("Kelas 8B");
          if (altSheetName) {
            sheet = altSheetName;
            sheetName = "Kelas 8B";
          }
        }
      }
      
      // Ambil sheet tujuan, buat baru jika belum tersedia
      if (!sheet) {
        sheet = activeSpreadsheet.insertSheet(sheetName);
      }
      
      targetSheetNameUsed = sheetName;
      
      // Pasang Header baris pertama secara otomatis jika lembar masih kosong
      if (sheet.getLastRow() === 0) {
        var headers = ["No", "Nama Siswa", "Kelas", "Status", "Tanggal"];
        sheet.appendRow(headers);
        
        // Desain Header agar rapi, berlatar belakang Biru Indah, teks Putih Tebal
        var headerRange = sheet.getRange(1, 1, 1, 5);
        headerRange.setBackground("#2563EB") // Biru Royal (blue-600)
                   .setFontColor("#FFFFFF")
                   .setFontWeight("bold")
                   .setHorizontalAlignment("center")
                   .setFontFamily("Arial");
        
        // Atur lebar kolom yang ideal secara presisi
        sheet.setColumnWidth(1, 60);   // No
        sheet.setColumnWidth(2, 260);  // Nama Siswa
        sheet.setColumnWidth(3, 100);  // Kelas
        sheet.setColumnWidth(4, 100);  // Status
        sheet.setColumnWidth(5, 130);  // Tanggal
      }
      
      // Tambahkan bodi baris berisi data presensi guru
      sheet.appendRow([no, nama, kelas, status, tanggal]);
      recordsAdded++;
    }
    
    // Format pengembalian respons sukses CORS-safe
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Sinkronisasi selesai! Berhasil menambahkan " + recordsAdded + " baris data ke sheet " + targetSheetNameUsed + ".",
      "recordsAdded": recordsAdded
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": "Terjadi kesalahan internal: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}`;

  // Find class group by name
  const currentClassGroup = classes.find((c) => c.name === selectedClass);
  const currentStudents = currentClassGroup ? currentClassGroup.students : [];

  // Whenever class changes or students list updates, initialize status map
  useEffect(() => {
    if (currentClassGroup) {
      const records: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpha'> = {};
      currentClassGroup.students.forEach((student) => {
        // preserve existing keys, or default to Hadir if not yet initialized
        records[student.id] = attRecords[student.id] || 'Hadir';
      });
      setAttRecords(records);
    }
  }, [selectedClass, classes]);

  // Command to mark all as Present
  const handleMarkAllPresent = () => {
    if (currentStudents.length === 0) return;
    const updated: Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpha'> = {};
    currentStudents.forEach((student) => {
      updated[student.id] = 'Hadir';
    });
    setAttRecords(updated);
  };

  const handleRecordChange = (studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha') => {
    setAttRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Save Attendance to Storage & Simulate Spreadsheet Preparation
  const handleSaveAttendance = () => {
    if (!currentClassGroup || currentStudents.length === 0) {
      setFailureReason('Rombongan belajar tidak memiliki siswa terdaftar. Tambahkan siswa terlebih dahulu!');
      setShowFailureModal(true);
      return;
    }

    try {
      const recordsArray: AttendanceRecord[] = currentStudents.map((student) => ({
        studentId: student.id,
        status: attRecords[student.id] || 'Hadir',
      }));

      const session: AttendanceSession = {
        id: crypto.randomUUID(),
        classGroupId: currentClassGroup.id,
        date: attDate,
        records: recordsArray,
      };

      // Push state
      onSaveAttendance(session);

      // Map spreadsheet preview rows formatted as: No, Nama siswa, Kelas, Status, Tanggal
      const spreadsheetData = currentStudents.map((student, idx) => ({
        no: idx + 1,
        nama: student.name,
        kelas: selectedClass,
        status: attRecords[student.id] || 'Hadir',
        tanggal: attDate,
      }));

      setLastSavedRows(spreadsheetData);
      setSyncStatus('idle'); // Reset Sheets sync state for the new session
      setShowSuccessModal(true);
    } catch (e) {
      setFailureReason('Mengalami kendala internal sistem saat menyimpan data.');
      setShowFailureModal(true);
    }
  };

  // Add student from the helper inline widget
  const handleAddStudentFast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !currentClassGroup) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      nisn: newStudentNisn.trim() || '-',
    };

    onAddStudent(currentClassGroup.id, newStudent);
    
    // Auto populate status to Hadir in state
    setAttRecords((prev) => ({
      ...prev,
      [newStudent.id]: 'Hadir',
    }));

    setNewStudentName('');
    setNewStudentNisn('');
  };

  // Manage view student creation
  const handleAddNewStudentInKelola = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.name === kelolaClassId);
    if (!cls || !newStudentName.trim()) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: newStudentName.trim(),
      nisn: newStudentNisn.trim() || '-',
    };

    onAddStudent(cls.id, newStudent);
    setNewStudentName('');
    setNewStudentNisn('');
  };

  return (
    <div id="attendance-section" className="space-y-6">
      {/* Tab Navigation header */}
      <div id="attendance-header-nav" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Presensi Siswa Tingkat SMP</span>
          </h3>
          <p className="text-xs text-slate-500">Isi, saring, dan monitor data absen harian ke Google Sheets secara responsif</p>
        </div>

        <div className="flex bg-slate-150 p-1.5 rounded-xl bg-slate-100 w-full overflow-x-auto md:w-auto gap-1">
          <button
            onClick={() => setActiveSubTab('absen')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'absen' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulir Absen
          </button>
          <button
            onClick={() => setActiveSubTab('kelola')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'kelola' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Atur Daftar Siswa ({classes.reduce((sum, c) => sum + c.students.length, 0)} Siswa)
          </button>
          <button
            onClick={() => setActiveSubTab('riwayat')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'riwayat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Presensi
          </button>
          <button
            onClick={() => setActiveSubTab('sheets')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeSubTab === 'sheets' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>Integrasi G-Sheets</span>
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <h4 className="font-extrabold text-base">Absensi berhasil disimpan!</h4>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="p-1 hover:bg-emerald-700 rounded-lg transition-all text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Sinkronisasi administratif selesai. Data presensi **Kelas {selectedClass}** tanggal **{attDate}** telah tersimpan dengan aman pada basis lokal, dan telah dikonfigurasi siap diekspor menggunakan baris berikut ke spreadsheet tujuan:
              </p>

              {/* Simulated Spreadsheet Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
                  <div className="col-span-1">No</div>
                  <div className="col-span-4">Nama Siswa</div>
                  <div className="col-span-2">Kelas</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2">Tanggal</div>
                </div>
                <div className="divide-y divide-slate-150 max-h-60 overflow-y-auto">
                  {lastSavedRows.map((row) => (
                    <div key={row.no} className="px-4 py-2 text-xs font-medium text-slate-700 grid grid-cols-12 gap-2 hover:bg-white transition-all">
                      <div className="col-span-1 font-mono">{row.no}</div>
                      <div className="col-span-4 truncate font-bold">{row.nama}</div>
                      <div className="col-span-2">{row.kelas}</div>
                      <div className="col-span-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'Hadir' ? 'bg-emerald-50 text-emerald-800' :
                          row.status === 'Sakit' ? 'bg-blue-50 text-blue-800' :
                          row.status === 'Izin' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                      <div className="col-span-2 font-mono text-slate-400">{row.tanggal}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex bg-blue-50/50 p-3 rounded-xl items-center space-x-2 text-xs text-blue-800 border border-blue-100">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Format kolom terpetakan permanen kelas rill: **No, Nama siswa, Kelas, Status, Tanggal**.</span>
              </div>

              {/* Live Google Sheets Synchronization trigger panel */}
              {sheetsUrl.trim() ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 animate-in slide-in-from-bottom duration-350">
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                        <Database className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kirim Langsung ke Google Sheets Resmi</span>
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium">Kirimkan {lastSavedRows.length} baris siswa harian langsung sekarang.</p>
                    </div>

                    <button
                      type="button"
                      disabled={syncStatus === 'loading'}
                      onClick={() => handleSyncToSheets()}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm shrink-0 font-sans"
                    >
                      {syncStatus === 'loading' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Sinkronisasikan Sekarang</span>
                    </button>
                  </div>

                  {syncStatus !== 'idle' && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl text-[11px] leading-relaxed font-semibold ${
                        syncStatus === 'loading' ? 'bg-blue-50 border border-blue-100 text-blue-700' :
                        syncStatus === 'success' ? 'bg-emerald-50 border border-emerald-150 text-emerald-800 font-bold' :
                        'bg-rose-50 border border-rose-150 text-rose-800'
                      }`}>
                        <span>{syncMessage}</span>
                      </div>

                      {syncStatus === 'success' && onBackToHome && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowSuccessModal(false);
                            onBackToHome();
                          }}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm animate-in fade-in duration-200"
                        >
                          <Home className="w-4 h-4" />
                          <span>Kembali ke Halaman Home</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  <div className="space-y-0.5 text-slate-700 font-medium">
                    <p className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
                      <span>Ingin otomatis mengirim ke Google Sheets?</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Hubungkan file Google Sheets pribadi/sekolah Anda dalam hitungan menit lewat sekali jembatan.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccessModal(false);
                      setActiveSubTab('sheets');
                    }}
                    className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center whitespace-nowrap"
                  >
                    Atur Jembatan Sheets &gt;
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAILURE MODAL POPUP */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-rose-600 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-extrabold text-base">Gagal menyimpan data, coba lagi!</h4>
              </div>
              <button 
                onClick={() => setShowFailureModal(false)}
                className="p-1 hover:bg-rose-700 rounded-lg transition-all text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {failureReason || 'Terjadi kesalahan sewaktu memproses rekap absensi. Mohon periksa kelengkapan siswa Anda.'}
              </p>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500">
                Tips: Pastikan kelas yang Anda pilih sudah terisi daftar nama siswa di tab <strong>"Atur Daftar Siswa"</strong>.
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowFailureModal(false)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULIR ABSEN SUB-VIEW */}
      {activeSubTab === 'absen' && (
        <div id="attendance-form-view" className="space-y-6">
          {/* Main Filter Panel inside Absen */}
          <div className="bg-white rounded-2xl border border-blue-100/70 p-6 shadow-sm space-y-5">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-sm"></span>
              <span>Saring Berdasarkan Rombel & Tanggal Aktual</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Class Filter pills */}
              <div className="lg:col-span-8 space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  Saring Kelas SMP
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CLASS_OPTIONS.map((cls) => {
                    const group = classes.find((c) => c.name === cls);
                    const isSelected = selectedClass === cls;
                    const studentCount = group ? group.students.length : 0;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/10'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50/50 hover:text-blue-700'
                        }`}
                      >
                        <span>Kelas {cls}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 bg-slate-100'
                        }`}>
                          {studentCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tanggal Input */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  Tanggal Presensi
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full text-xs font-bold px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary dashboard & Top Control buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Stat Brief */}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-105">
                  <span>Hadir:</span>
                  <span className="text-emerald-600">{currentStudents.filter(s => (attRecords[s.id] || 'Hadir') === 'Hadir').length}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-105">
                  <span>Sakit:</span>
                  <span className="text-blue-600">{currentStudents.filter(s => attRecords[s.id] === 'Sakit').length}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-105">
                  <span>Izin:</span>
                  <span className="text-amber-600">{currentStudents.filter(s => attRecords[s.id] === 'Izin').length}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-105">
                  <span>Alpa:</span>
                  <span className="text-rose-600">{currentStudents.filter(s => attRecords[s.id] === 'Alpha').length}</span>
                </div>
              </div>

              {/* Hadir Semua & Simpan Absen buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={currentStudents.length === 0}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-4 py-2 border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 rounded-xl transition-all font-bold text-xs cursor-pointer disabled:opacity-40"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Hadir Semua</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-bold text-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Simpan Absen</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Friendly Student grid under filters */}
          {currentStudents.length === 0 ? (
            <div id="empty-state-attendance" className="bg-white rounded-2xl border border-dashed border-blue-200 p-10 text-center shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h5 className="font-extrabold text-slate-700 text-sm">Belum Ada Siswa di Kelas {selectedClass}</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Tidak ada data sampel. Mari mudahkan pencatatan dengan mendaftarkan siswa pertama Anda di kelas ini secara instan di bawah ini.
              </p>

              {/* Fast inline student addition */}
              <form onSubmit={handleAddStudentFast} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-150">
                <input
                  required
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="NISN (Opsional)"
                  value={newStudentNisn}
                  onChange={(e) => setNewStudentNisn(e.target.value)}
                  className="w-full sm:w-28 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Daftar Siswa Kelas {selectedClass} ({currentStudents.length} Mahasiswa)
                </span>
                
                <span className="text-[11px] font-medium text-slate-400 italic">
                  *Klik baris siswa untuk mengubah status presensi masing-masing
                </span>
              </div>

              {/* STUNNING GRID OF STUDENTS */}
              <div id="student-attendance-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentStudents.map((student) => {
                  const studentStatus = attRecords[student.id] || 'Hadir';

                  return (
                    <div
                      key={student.id}
                      className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all duration-250 ${
                        studentStatus === 'Hadir' ? 'border-emerald-100 hover:border-emerald-300 ring-1 ring-emerald-500/5' :
                        studentStatus === 'Sakit' ? 'border-blue-100 hover:border-blue-300 ring-1 ring-blue-500/5' :
                        studentStatus === 'Izin' ? 'border-amber-100 hover:border-amber-300 ring-1 ring-amber-500/5' :
                        'border-rose-100 hover:border-rose-300 ring-1 ring-rose-500/5'
                      }`}
                    >
                      {/* Name and class tag */}
                      <div className="pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                          NISN: {student.nisn || '-'}
                        </span>
                        <h5 className="font-extrabold text-slate-900 text-sm mt-0.5 truncate" title={student.name}>
                          {student.name}
                        </h5>
                        <div className="flex items-center space-x-1.5 mt-1.5">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                            Kelas {selectedClass}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            studentStatus === 'Hadir' ? 'bg-emerald-50 text-emerald-800' :
                            studentStatus === 'Sakit' ? 'bg-blue-50 text-blue-800' :
                            studentStatus === 'Izin' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-rose-800'
                          }`}>
                            {studentStatus === 'Alpha' ? 'Alpa' : studentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Responsive small status buttons bar */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                        <button
                          type="button"
                          onClick={() => handleRecordChange(student.id, 'Hadir')}
                          className={`px-1 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 cursor-pointer truncate ${
                            studentStatus === 'Hadir'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">Hadir ⬛</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRecordChange(student.id, 'Sakit')}
                          className={`px-1 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 cursor-pointer truncate ${
                            studentStatus === 'Sakit'
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">Sakit ·● ´˘·´·¨ ⁄</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRecordChange(student.id, 'Izin')}
                          className={`px-1 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 cursor-pointer truncate ${
                            studentStatus === 'Izin'
                              ? 'bg-amber-600 border-amber-600 text-white shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">Izin )•¸ ‘</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRecordChange(student.id, 'Alpha')}
                          className={`px-1 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center space-x-1 cursor-pointer truncate ${
                            studentStatus === 'Alpha'
                              ? 'bg-rose-600 border-rose-600 text-white shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">Alpa +</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fast Addition Tray alongside student grid */}
              <div className="bg-white rounded-2xl border border-slate-205 p-4 shadow-sm">
                <form onSubmit={handleAddStudentFast} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Ada Siswa Baru Masuk? Daftarkan ke Kelas {selectedClass} Secara Instan:</span>
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input
                      required
                      type="text"
                      placeholder="Nama Lengkap Siswa"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="NISN (Opsional)"
                      value={newStudentNisn}
                      onChange={(e) => setNewStudentNisn(e.target.value)}
                      className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 w-full sm:w-28"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Daftarkan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED STUDENT ROSTER SETUP SUB-VIEW */}
      {activeSubTab === 'kelola' && (
        <div id="attendance-setup-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Create and Selected class info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Pilih Rombongan Belajar (Rombel)</h4>
              <p className="text-xs text-slate-400 mb-4 font-medium">Klik untuk mengelola daftar nama siswa yang terdaftar</p>
              
              <div className="space-y-2">
                {CLASS_OPTIONS.map((name) => {
                  const c = classes.find(g => g.name === name);
                  const isCur = kelolaClassId === name;
                  const count = c ? c.students.length : 0;
                  
                  return (
                    <button
                      key={name}
                      onClick={() => setKelolaClassId(name)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isCur
                          ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                          : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">Kelas {name}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100/70 text-blue-800 rounded font-bold">
                        {count} Siswa
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roster Auto Sync & Master Load Trigger */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 animate-pulse animate-duration-1000" />
                <span>Roster Sekolah Resmi</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Butuh memuat ulang list data siswa rill Kelas 7A, 7B, 8A, 8B, 9A, dan 9B dari daftar pendaftaran utama sekolah?
              </p>
              
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2.5 px-4 bg-blue-50/70 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 border border-blue-100"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Muat Ulang Roster Asli</span>
                </button>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2.5 animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold text-amber-800 leading-normal flex items-start gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Perhatian: Tindakan ini akan mengatur ulang roster siswa semua kelas ke data bawaan awal. Lanjutkan?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onResetClasses && defaultRombelData) {
                          onResetClasses(defaultRombelData);
                        }
                        setShowResetConfirm(false);
                      }}
                      className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-black transition-all cursor-pointer text-center"
                    >
                      Ya, Muat Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Roster Lists of Selected Class */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Pengelolaan Siswa Aktif: Kelas {kelolaClassId}
                </h4>
                <p className="text-xs text-slate-500">
                  Daftarkan nama-nama siswa rill Anda di jenjang kelas {kelolaClassId} di bawah ini:
                </p>
              </div>

              {/* Form inside panel */}
              <form onSubmit={handleAddNewStudentInKelola} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Daftarkan Siswa Baru di Kelas {kelolaClassId}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Nama Lengkap Siswa"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="NISN Nomor Induk Siswa"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Siswa</span>
                  </button>
                </div>
              </form>

              {/* Grid or table layout of loaded rosters */}
              {classes.find(c => c.name === kelolaClassId)?.students.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-150 rounded-xl text-center text-slate-400 text-xs">
                  Kelas {kelolaClassId} tidak memiliki data siswa. Tambahkan rincian nama siswa di atas.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Nama Lengkap Siswa</th>
                        <th className="px-4 py-3 font-mono">NISN</th>
                        <th className="px-4 py-3 text-center">Aksi Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {classes
                        .find((c) => c.name === kelolaClassId)
                        ?.students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/40">
                            <td className="px-4 py-3 font-bold">{student.name}</td>
                            <td className="px-4 py-3 text-slate-400 font-mono">{student.nisn || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const targetGroup = classes.find(c => c.name === kelolaClassId);
                                  if (targetGroup) {
                                    onDeleteStudent(targetGroup.id, student.id);
                                  }
                                }}
                                className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIWAYAT PRESENSI SUB-VIEW */}
      {activeSubTab === 'riwayat' && (
        <div id="attendance-history-view" className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div>
            <h4 className="text-base font-bold text-slate-800">Riwayat Catatan Presensi Kelas</h4>
            <p className="text-xs text-slate-500">Daftar rekaman jurnal presensi mengajar yang baru dideklarasikan</p>
          </div>

          {attendanceSessions.length === 0 ? (
            <div className="border border-dashed border-blue-200 p-10 rounded-xl text-center text-slate-400 text-xs">
              <History className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <span>Belum ada catatan Jurnal Absensi dikirim.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceSessions.map((session) => {
                const cls = classes.find((c) => c.id === session.classGroupId);
                
                // Count presence statistics
                const stats = session.records.reduce(
                  (acc, rec) => {
                    acc[rec.status]++;
                    return acc;
                  },
                  { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 }
                );

                return (
                  <div key={session.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-extrabold text-slate-800">{session.date}</span>
                        <span className="bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded text-[10px]">
                          Kelas {cls?.name || 'SMP'}
                        </span>
                      </div>
                      <p className="text-slate-400 font-mono text-[10px]">ID: {session.id}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="text-emerald-700">Hadir: {stats.Hadir}</span>
                      <span className="text-blue-700">Sakit: {stats.Sakit}</span>
                      <span className="text-amber-700">Izin: {stats.Izin}</span>
                      <span className="text-rose-700">Alpa: {stats.Alpha}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GOOGLE SHEETS INTEGRATION VIEW */}
      {activeSubTab === 'sheets' && (
        <div id="attendance-sheets-sync-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Instructions and connection test */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Petunjuk Pengaturan Google Sheets</h4>
                  <p className="text-xs text-slate-500">Ikuti langkah-langkah di bawah untuk menghubungkan Portal dengan Google Sheets Resmi</p>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="text-xs space-y-4">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">1</span>
                  <p className="text-slate-600 leading-normal">
                    Buka Google Sheet Anda. Buat spreadsheet baru atau gunakan spreadsheet yang sudah ada untuk presensi ini.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">2</span>
                  <p className="text-slate-600 leading-normal">
                    Di bar menu atas, klik <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>. Ambil kode skrip siap pakai di panel kanan, salin seluruh isi kodenya.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">3</span>
                  <p className="text-slate-600 leading-normal">
                    Hapus semua isi bawaan di editor Apps Script Anda (misal <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">function myFunction() ...</code>), lalu <strong>tempel (paste)</strong> kode skrip yang sudah Anda salin. Klik ikon <strong>Simpan (Save)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">4</span>
                  <p className="text-slate-600 leading-normal">
                    Klik tombol <strong>Terapkan (Deploy)</strong> &gt; pilih <strong>Penerapan baru (New deployment)</strong>. Di menu setelan, pilih jenis <strong>Aplikasi Web (Web App)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">5</span>
                  <div className="text-slate-600 leading-normal">
                    Konfigurasikan akses sebagai berikut:
                    <ul className="list-disc ml-4 mt-1 space-y-1 font-semibold text-slate-700">
                      <li>Jalankan sebagai (Execute as): <strong>"Saya" (Me)</strong></li>
                      <li>Siapa yang memiliki akses (Who has access): <strong>"Siapa saja" (Anyone)</strong></li>
                    </ul>
                    Klik tombol <strong>Terapkan (Deploy)</strong> dan izinkan hak akses jika muncul jendela konfirmasi akun Google pribadi/belajar Anda.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">6</span>
                  <p className="text-slate-600 leading-normal">
                    Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang didapatkan (biasanya berakhiran <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">/exec</code>), lalu masukkan pada formulir di bawah ini.
                  </p>
                </div>
              </div>
            </div>

            {/* Input URL Web App */}
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm space-y-4 font-sans">
              <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>URL Web App Akses Google Sheets</span>
              </h4>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 text-xs px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                  />
                  {sheetsUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setSheetsUrl('')}
                      className="px-3 border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Mengatur Ulang
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  * URL Web App di atas disimpan secara lokal di browser Anda untuk keperluan sinkronisasi otomatis sewaktu mengirim presensi harian siswa.
                </p>
              </div>

              {/* Dev Test Block */}
              {sheetsUrl.trim() && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Uji Koneksi Sinkronisasi</span>
                  <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      disabled={syncStatus === 'loading'}
                      onClick={() => handleSyncToSheets([
                        { no: 1, nama: 'SISWA TESTING KONEKSI', kelas: '7A', status: 'Hadir', tanggal: new Date().toISOString().split('T')[0] }
                      ])}
                      className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border border-blue-100 shrink-0"
                    >
                      {syncStatus === 'loading' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Kirim Data Uji Coba</span>
                    </button>
                    
                    <span className="text-[11px] font-medium text-slate-500">
                      Mengirim 1 baris baris sampel untuk menguji integrasi sheet "Kelas 7A"
                    </span>
                  </div>

                  {syncStatus !== 'idle' && (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 font-medium ${
                        syncStatus === 'loading' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        syncStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                        'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        <div className="flex gap-1.5 items-start">
                          {syncStatus === 'success' ? (
                            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                          ) : syncStatus === 'error' ? (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                          ) : (
                            <RefreshCw className="w-4 h-4 shrink-0 text-blue-500 animate-spin mt-0.5" />
                          )}
                          <span>{syncMessage}</span>
                        </div>
                      </div>

                      {syncStatus === 'success' && onBackToHome && (
                        <button
                          type="button"
                          onClick={onBackToHome}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm animate-in fade-in duration-200"
                        >
                          <Home className="w-4 h-4" />
                          <span>Kembali ke Halaman Home</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Copyable script container */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 text-white space-y-4 flex flex-col h-[650px]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-blue-400 tracking-wider uppercase font-mono">Kode GScript Pendukung</h5>
                  <h4 className="text-sm font-extrabold tracking-tight">naskah_skrip.gs</h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(googleAppsScriptCode);
                    setHasCopied(true);
                    setTimeout(() => setHasCopied(false), 2000);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Skrip</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded-xl bg-slate-950 p-4 border border-slate-850 font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre select-all">
                {googleAppsScriptCode}
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl text-[11px] text-blue-300 leading-normal">
                💡 <strong>Informasi Kelas:</strong> Skrip ini mendukung penamaan tab lembar kerja secara otomatis untuk <strong>Kelas 7A, 7B, 8A, 8 B, 9A, 9B</strong> berdasarkan pengiriman Anda.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
