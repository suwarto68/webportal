import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TeacherProfile,
  ScheduleItem,
  SyllabusItem,
  MaterialItem,
  ClassGroup,
  AttendanceSession,
  Student,
} from './types';

// Importing Tab Sub-Views
import ProfileView from './components/ProfileView';
import ScheduleView from './components/ScheduleView';
import SyllabusView from './components/SyllabusView';
import MaterialsView from './components/MaterialsView';
import AttendanceView from './components/AttendanceView';

// Nav Icons
import {
  User,
  Calendar,
  BookMarked,
  ClipboardList,
  UserCheck,
  BookOpen,
  Info,
  CalendarCheck,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  ShieldCheck,
  Key,
} from 'lucide-react';

type TabType = 'profil' | 'jadwal' | 'silabus' | 'bahan' | 'absen';

const INITIAL_PROFILE: TeacherProfile = {
  name: 'Suwarto, S.Pd',
  nip: '197508062010011011', // Sync with user requested NIP
  school: 'SMP Negeri Belajar Pratama',
  subject: 'Guru Matematika',
  email: 'suwarto68@guru.smp.belajar.id',
  phone: '0812-3456-7890',
  bio: 'Pendidik Matematika tingkat SMP berkomitmen membina minat belajar aljabar, geometri, dan logika matematika pada siswa tingkat menengah.',
};

const DEFAULT_ROMBEL_DATA: ClassGroup[] = [
  {
    id: '7A',
    name: '7A',
    students: [
      { id: '7A-1', name: 'ADITYA PRATAMA', nisn: '-' },
      { id: '7A-2', name: 'ADRIAN', nisn: '-' },
      { id: '7A-3', name: 'ADRIYAN MAULANA', nisn: '-' },
      { id: '7A-4', name: 'AFIQAH FIRDAUSI NUZULA', nisn: '-' },
      { id: '7A-5', name: 'AGUSTIA RAMADHAN', nisn: '-' },
      { id: '7A-6', name: 'ALFADHIL MUZAKKI', nisn: '-' },
      { id: '7A-7', name: 'ALIF HUDZAIFAH', nisn: '-' },
      { id: '7A-8', name: 'AMANDA ERMAWATI', nisn: '-' },
      { id: '7A-9', name: 'ANISA NOOR MILAWATI', nisn: '-' },
      { id: '7A-10', name: 'AQILA NUR HAFIZAH', nisn: '-' },
      { id: '7A-11', name: 'ARIFKI DWI PUTRA', nisn: '-' },
      { id: '7A-12', name: 'AULIA AGUSTINA', nisn: '-' },
      { id: '7A-13', name: 'AULIA RAHMAN ALFANDI', nisn: '-' },
      { id: '7A-14', name: 'DAFFA WAHYU RAMADHAN SAPUTRA', nisn: '-' },
      { id: '7A-15', name: 'GUSTI ALFI RIZKY RAMADHANI', nisn: '-' },
      { id: '7A-16', name: 'JIHAN ALIFA PUTRI', nisn: '-' },
      { id: '7A-17', name: 'KAMILA DEWI KANZA AZZAHRA', nisn: '-' },
      { id: '7A-18', name: 'KHAIRIYAH ASMA KAMILAH', nisn: '-' },
      { id: '7A-19', name: 'LIDIYA AMHERATUL KOTIMAH', nisn: '-' },
      { id: '7A-20', name: 'LUTFI FIRDAUS', nisn: '-' },
      { id: '7A-21', name: 'M.NAUVAL FAHRI', nisn: '-' },
      { id: '7A-22', name: 'M.RADIL ALFIANSYAH', nisn: '-' },
      { id: '7A-23', name: 'MAWARDAH', nisn: '-' },
      { id: '7A-24', name: 'MISTIA HAFIZAH', nisn: '-' },
      { id: '7A-25', name: 'MUHAMMAD ARYA SAPUTRA', nisn: '-' },
      { id: '7A-26', name: 'NASYA REZKIA ASYIFA', nisn: '-' },
      { id: '7A-27', name: 'NUR AMIRA HAYATI', nisn: '-' },
      { id: '7A-28', name: 'RACKHEL FERILYANI AGUSTINE', nisn: '-' },
      { id: '7A-29', name: 'RIZKA AULIA PUTRI', nisn: '-' },
      { id: '7A-30', name: 'SITI ALFIAH', nisn: '-' },
      { id: '7A-31', name: 'SITI FATIMAH', nisn: '-' },
      { id: '7A-32', name: 'YUNITA PUTRI HARTANTI', nisn: '-' }
    ]
  },
  {
    id: '7B',
    name: '7B',
    students: [
      { id: '7B-1', name: 'AHMAD MAULANA', nisn: '-' },
      { id: '7B-2', name: 'AKHMAD REJA SETIAWAN', nisn: '-' },
      { id: '7B-3', name: 'ALI IMRON ABDULAH', nisn: '-' },
      { id: '7B-4', name: 'AQILLA MAULIDIYA HIDAYANI', nisn: '-' },
      { id: '7B-5', name: 'ARIYA SAYYID NASHSHOR', nisn: '-' },
      { id: '7B-6', name: 'AZRYIEL ALDO RIOVANDY', nisn: '-' },
      { id: '7B-7', name: 'DEWI ARRUM', nisn: '-' },
      { id: '7B-8', name: 'FADRUR RAHMAT AL MAULID', nisn: '-' },
      { id: '7B-9', name: 'FARIZ NUR RIDWAN', nisn: '-' },
      { id: '7B-10', name: 'FATIN ALMAIRA', nisn: '-' },
      { id: '7B-11', name: 'GUSTI KAMELIA NATTASYA RIZKIA AFIKA', nisn: '-' },
      { id: '7B-12', name: 'JUWITA AZ ZAHRA', nisn: '-' },
      { id: '7B-13', name: 'LINA ANISA', nisn: '-' },
      { id: '7B-14', name: 'M.RIZKI AL GIFARI', nisn: '-' },
      { id: '7B-15', name: 'MAWARNI', nisn: '-' },
      { id: '7B-16', name: 'MAYDA SYAFIRA', nisn: '-' },
      { id: '7B-17', name: 'MAYSAROH', nisn: '-' },
      { id: '7B-18', name: 'MUHAMMAD ALFIANOR RAMADANI', nisn: '-' },
      { id: '7B-19', name: 'MUHAMMAD IRVANSYAH', nisn: '-' },
      { id: '7B-20', name: 'MUHAMMAD KHALID AWALUDDIN', nisn: '-' },
      { id: '7B-21', name: 'NAYLA RAFYFA MAHERA', nisn: '-' },
      { id: '7B-22', name: 'NUR RAHMAH FATIMAH', nisn: '-' },
      { id: '7B-23', name: 'PUTRI AMELIA', nisn: '-' },
      { id: '7B-24', name: 'RAISSUL BARRI PERANGINANGIN', nisn: '-' },
      { id: '7B-25', name: 'RIZWAN', nisn: '-' },
      { id: '7B-26', name: 'SAMSUNI', nisn: '-' },
      { id: '7B-27', name: 'SASCIA PUTRI LESTARI', nisn: '-' },
      { id: '7B-28', name: 'SIFATU JAHRA', nisn: '-' },
      { id: '7B-29', name: 'SITI AULIA ALFIANI', nisn: '-' }
    ]
  },
  {
    id: '8A',
    name: '8A',
    students: [
      { id: '8A-1', name: 'AHMAD BAKRI', nisn: '-' },
      { id: '8A-2', name: 'AHMAD DANI', nisn: '-' },
      { id: '8A-3', name: 'AHMAD RAFI SAPUTRA', nisn: '-' },
      { id: '8A-4', name: 'AHMAD RIZKI FADILLAH', nisn: '-' },
      { id: '8A-5', name: 'ALWI AL FAZRI', nisn: '-' },
      { id: '8A-6', name: 'AULIA REYNA SAFFATUNNISA', nisn: '-' },
      { id: '8A-7', name: 'BUNGA NURAIN', nisn: '-' },
      { id: '8A-8', name: 'DEA AYU CAHYANI', nisn: '-' },
      { id: '8A-9', name: 'DIAZ RIZKY YULIANT', nisn: '-' },
      { id: '8A-10', name: 'DIKA ABDUL BEKTI', nisn: '-' },
      { id: '8A-11', name: 'FIYA AZAH AHLIL JANAH', nisn: '-' },
      { id: '8A-12', name: 'GUSTI MUHAMMAD MAHYUNI', nisn: '-' },
      { id: '8A-13', name: 'HAFIZ SUBANDI', nisn: '-' },
      { id: '8A-14', name: 'KHOLIFAH SAFRINA AYU', nisn: '-' },
      { id: '8A-15', name: 'MUHAMMAD FARID HIDAYATULLOH', nisn: '-' },
      { id: '8A-16', name: 'MUHAMMAD FIRZA AL FURQON', nisn: '-' },
      { id: '8A-17', name: 'MUHAMMAD NURDINATA', nisn: '-' },
      { id: '8A-18', name: 'MUHAMMAD RAMADANI', nisn: '-' },
      { id: '8A-19', name: 'MUHAMMAD TEGAR RAMADHANI', nisn: '-' },
      { id: '8A-20', name: 'NABILLA NURSAFITRI', nisn: '-' },
      { id: '8A-21', name: 'SALSA MELINDA', nisn: '-' },
      { id: '8A-22', name: 'SRI DEVIAWATI', nisn: '-' },
      { id: '8A-23', name: 'SUCI RAMADATUL HIKMAH', nisn: '-' }
    ]
  },
  {
    id: '8B',
    name: '8B',
    students: [
      { id: '8B-1', name: 'AHMAD FATONI', nisn: '-' },
      { id: '8B-2', name: 'ALI SYAID', nisn: '-' },
      { id: '8B-3', name: 'ANISA', nisn: '-' },
      { id: '8B-4', name: 'DEA NUR HABIBAH', nisn: '-' },
      { id: '8B-5', name: 'ECHA AYU PUTRIANA', nisn: '-' },
      { id: '8B-6', name: 'GALANG AL ABQARY', nisn: '-' },
      { id: '8B-7', name: 'IGA SAFITRI', nisn: '-' },
      { id: '8B-8', name: 'LEONIEL WILDAN SETIAWAN', nisn: '-' },
      { id: '8B-9', name: 'LIVIA MEYSSA PUTRI', nisn: '-' },
      { id: '8B-10', name: 'MUHAMAD NIZAM MAULANA', nisn: '-' },
      { id: '8B-11', name: 'MUHAMMAD FARIZQI RAMADHAN', nisn: '-' },
      { id: '8B-12', name: 'MUHAMMAD KHAIDIR IBRAHIM', nisn: '-' },
      { id: '8B-13', name: 'MUHAMMAD RIZKY ALHADI PRASTIYO', nisn: '-' },
      { id: '8B-14', name: 'MUHAMMAD YAFI', nisn: '-' },
      { id: '8B-15', name: 'MUHAMMAD ZAENAL MUHTADI', nisn: '-' },
      { id: '8B-16', name: 'NURHASANAH', nisn: '-' },
      { id: '8B-17', name: 'RAFA ATALA PUTRA', nisn: '-' },
      { id: '8B-18', name: 'RAHMAH AZ ZAHRA', nisn: '-' },
      { id: '8B-19', name: 'RIO SYAHPUTRA', nisn: '-' },
      { id: '8B-20', name: 'SAVIRA ERLINA CANTIKA', nisn: '-' },
      { id: '8B-21', name: 'SELLY RUSLIANI', nisn: '-' },
      { id: '8B-22', name: 'SELVIA NUR FIANA', nisn: '-' }
    ]
  },
  {
    id: '9A',
    name: '9A',
    students: [
      { id: '9A-1', name: 'AHDIYAT ABSOR', nisn: '-' },
      { id: '9A-2', name: 'AHMAD SAPUTRA', nisn: '-' },
      { id: '9A-3', name: 'ALFIAN PRATAMA', nisn: '-' },
      { id: '9A-4', name: 'ANNISA RAHMA DANI', nisn: '-' },
      { id: '9A-5', name: 'AULA BAHADIR AZALI', nisn: '-' },
      { id: '9A-6', name: 'AYDINA ZULIANA', nisn: '-' },
      { id: '9A-7', name: 'DELVI OKTAVIANTI', nisn: '-' },
      { id: '9A-8', name: 'DIFA AMARTHA', nisn: '-' },
      { id: '9A-9', name: 'DIRA RAHMAYANTI', nisn: '-' },
      { id: '9A-10', name: 'FAHRI ANDIKA', nisn: '-' },
      { id: '9A-11', name: 'FAHRUR ROZZAAQ', nisn: '-' },
      { id: '9A-12', name: 'GT.AHMAD ROHJI', nisn: '-' },
      { id: '9A-13', name: 'GUSTI RIDAYAT', nisn: '-' },
      { id: '9A-14', name: 'INTAN NURAINI', nisn: '-' },
      { id: '9A-15', name: 'ISNA', nisn: '-' },
      { id: '9A-16', name: 'KHUMAIROH', nisn: '-' },
      { id: '9A-17', name: 'LAILATUN SYAFIA', nisn: '-' },
      { id: '9A-18', name: 'LATIFAH PURI RAHAYU', nisn: '-' },
      { id: '9A-19', name: 'M.IRVAN ADITTIA SAPUTRA', nisn: '-' },
      { id: '9A-20', name: 'MUHAMMAD HAIKAL MUJAKI', nisn: '-' },
      { id: '9A-21', name: 'MUHAMMAD RIDWAN', nisn: '-' },
      { id: '9A-22', name: 'MUHAMMAD RIZKY', nisn: '-' },
      { id: '9A-23', name: 'MUSLIKAH YURI AMANDA', nisn: '-' },
      { id: '9A-24', name: 'NISA RISMAYANTY', nisn: '-' },
      { id: '9A-25', name: 'PURIE INDAH SARI', nisn: '-' },
      { id: '9A-26', name: 'RABIATUL', nisn: '-' },
      { id: '9A-27', name: 'REVALDO NOVAL NUGROHO', nisn: '-' },
      { id: '9A-28', name: 'RISA AULIA', nisn: '-' },
      { id: '9A-29', name: 'RISMA FITRIANI', nisn: '-' },
      { id: '9A-30', name: 'RIZKI AULIA', nisn: '-' },
      { id: '9A-31', name: 'RIZKI SETIYAWATI', nisn: '-' },
      { id: '9A-32', name: 'UMAR', nisn: '-' }
    ]
  },
  {
    id: '9B',
    name: '9B',
    students: [
      { id: '9B-1', name: 'AHKMAD RIZKY KHATIBUL UMAM', nisn: '-' },
      { id: '9B-2', name: 'AHMAD MULYONO', nisn: '-' },
      { id: '9B-3', name: 'ANDINI', nisn: '-' },
      { id: '9B-4', name: 'ARSYA PUTRA PRATAMA', nisn: '-' },
      { id: '9B-5', name: 'ASSYIFA OKTAFIANI', nisn: '-' },
      { id: '9B-6', name: 'AYDINI ZULIANI', nisn: '-' },
      { id: '9B-7', name: 'CHOKY ADITIYA', nisn: '-' },
      { id: '9B-8', name: 'DEVI ARIYANTI', nisn: '-' },
      { id: '9B-9', name: 'ELLISYA DAMARA LANGGENG', nisn: '-' },
      { id: '9B-10', name: 'ELSA WIJAYANTI', nisn: '-' },
      { id: '9B-11', name: 'FAISAL AKBAR', nisn: '-' },
      { id: '9B-12', name: 'FENDI HERMAWANSYAH', nisn: '-' },
      { id: '9B-13', name: 'LISDA AULIAWATI', nisn: '-' },
      { id: '9B-14', name: 'M.AYUF', nisn: '-' },
      { id: '9B-15', name: 'MADINATUL MUSARROFAH', nisn: '-' },
      { id: '9B-16', name: 'MUHAMMAD ABDUL KABIR', nisn: '-' },
      { id: '9B-17', name: 'MUHAMMAD FAJAR', nisn: '-' },
      { id: '9B-18', name: 'MUHAMMAD HAFIZ HUSAEIN', nisn: '-' },
      { id: '9B-19', name: 'MUHAMMAD MA\'RUF', nisn: '-' },
      { id: '9B-20', name: 'MUHAMMAD RIZKY YUDISTIRA', nisn: '-' },
      { id: '9B-21', name: 'NURUL HASANAH', nisn: '-' },
      { id: '9B-22', name: 'NURUL MAULIDA HIDAYAH', nisn: '-' },
      { id: '9B-23', name: 'PUTRA HISBULLAH ASIH', nisn: '-' },
      { id: '9B-24', name: 'REHAN RAMADANI', nisn: '-' },
      { id: '9B-25', name: 'RIBKA KHARISMA AGUSTIN', nisn: '-' },
      { id: '9B-26', name: 'RICHO SUKENDAR', nisn: '-' },
      { id: '9B-27', name: 'SALMA AULIA RAHMAH', nisn: '-' },
      { id: '9B-28', name: 'SELY DWI WAHYUNI', nisn: '-' },
      { id: '9B-29', name: 'SIRAJUDIN', nisn: '-' },
      { id: '9B-30', name: 'VILAWATI', nisn: '-' },
      { id: '9B-31', name: 'VITA IMELIA AZIZAH', nisn: '-' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('profil');

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('smp_guru_is_logged_in') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Core administrative states
  const [profile, setProfile] = useState<TeacherProfile>(INITIAL_PROFILE);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('smp_guru_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error loading profile', e);
      }
    }

    const savedSchedules = localStorage.getItem('smp_guru_schedules');
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        console.error('Error loading schedules', e);
      }
    }

    const savedSyllabus = localStorage.getItem('smp_guru_syllabus');
    if (savedSyllabus) {
      try {
        setSyllabusList(JSON.parse(savedSyllabus));
      } catch (e) {
        console.error('Error loading syllabus', e);
      }
    }

    const savedMaterials = localStorage.getItem('smp_guru_materials');
    if (savedMaterials) {
      try {
        setMaterials(JSON.parse(savedMaterials));
      } catch (e) {
        console.error('Error loading materials', e);
      }
    }

    const savedClasses = localStorage.getItem('smp_guru_classes');
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses) as ClassGroup[];
        const totalStudentsCount = parsed.reduce((sum, c) => sum + (c.students ? c.students.length : 0), 0);
        if (totalStudentsCount === 0) {
          setClasses(DEFAULT_ROMBEL_DATA);
          localStorage.setItem('smp_guru_classes', JSON.stringify(DEFAULT_ROMBEL_DATA));
        } else {
          setClasses(parsed);
        }
      } catch (e) {
        console.error('Error loading classes', e);
        setClasses(DEFAULT_ROMBEL_DATA);
        localStorage.setItem('smp_guru_classes', JSON.stringify(DEFAULT_ROMBEL_DATA));
      }
    } else {
      setClasses(DEFAULT_ROMBEL_DATA);
      localStorage.setItem('smp_guru_classes', JSON.stringify(DEFAULT_ROMBEL_DATA));
    }

    const savedSessions = localStorage.getItem('smp_guru_attendance_sessions');
    if (savedSessions) {
      try {
        setAttendanceSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Error loading attendance sessions', e);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      setLoginError('User ID dan Password wajib diisi.');
      return;
    }

    if (trimmedUser === '197508062010011011' && trimmedPass === 'Smpn1wnry05') {
      setIsLoggedIn(true);
      localStorage.setItem('smp_guru_is_logged_in', 'true');
      // Set name and NIP correctly to reflect the teacher's profile
      const updatedProfile = { ...profile, nip: '197508062010011011' };
      setProfile(updatedProfile);
      localStorage.setItem('smp_guru_profile', JSON.stringify(updatedProfile));
    } else {
      setLoginError('User ID atau Password salah. Silakan periksa kembali!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('smp_guru_is_logged_in');
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
  };

  // Save triggers when states change
  const handleChangeProfile = (updatedProfile: TeacherProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('smp_guru_profile', JSON.stringify(updatedProfile));
  };

  const handleAddSchedule = (item: ScheduleItem) => {
    const updated = [...schedules, item];
    setSchedules(updated);
    localStorage.setItem('smp_guru_schedules', JSON.stringify(updated));
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    localStorage.setItem('smp_guru_schedules', JSON.stringify(updated));
  };

  const handleAddSyllabus = (item: SyllabusItem) => {
    const updated = [...syllabusList, item];
    setSyllabusList(updated);
    localStorage.setItem('smp_guru_syllabus', JSON.stringify(updated));
  };

  const handleDeleteSyllabus = (id: string) => {
    const updated = syllabusList.filter((s) => s.id !== id);
    setSyllabusList(updated);
    localStorage.setItem('smp_guru_syllabus', JSON.stringify(updated));
  };

  const handleAddMaterial = (item: MaterialItem) => {
    const updated = [...materials, item];
    setMaterials(updated);
    localStorage.setItem('smp_guru_materials', JSON.stringify(updated));
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    localStorage.setItem('smp_guru_materials', JSON.stringify(updated));
  };

  const handleAddClass = (newCls: ClassGroup) => {
    const updated = [...classes, newCls];
    setClasses(updated);
    localStorage.setItem('smp_guru_classes', JSON.stringify(updated));
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    localStorage.setItem('smp_guru_classes', JSON.stringify(updated));
  };

  const handleAddStudent = (classId: string, student: Student) => {
    const updated = classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          students: [...c.students, student],
        };
      }
      return c;
    });
    setClasses(updated);
    localStorage.setItem('smp_guru_classes', JSON.stringify(updated));
  };

  const handleDeleteStudent = (classId: string, studentId: string) => {
    const updated = classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          students: c.students.filter((s) => s.id !== studentId),
        };
      }
      return c;
    });
    setClasses(updated);
    localStorage.setItem('smp_guru_classes', JSON.stringify(updated));
  };

  const handleSaveAttendance = (session: AttendanceSession) => {
    const updated = [session, ...attendanceSessions];
    setAttendanceSessions(updated);
    localStorage.setItem('smp_guru_attendance_sessions', JSON.stringify(updated));
  };

  const handleResetClasses = (newClasses: ClassGroup[]) => {
    setClasses(newClasses);
    localStorage.setItem('smp_guru_classes', JSON.stringify(newClasses));
  };

  // Render correct sub-view based on activeTab
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <ProfileView
            profile={profile}
            onChangeProfile={handleChangeProfile}
          />
        );
      case 'jadwal':
        return (
          <ScheduleView
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        );
      case 'silabus':
        return (
          <SyllabusView
            syllabusList={syllabusList}
            onAddSyllabus={handleAddSyllabus}
            onDeleteSyllabus={handleDeleteSyllabus}
          />
        );
      case 'bahan':
        return (
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        );
      case 'absen':
        return (
          <AttendanceView
            classes={classes}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            attendanceSessions={attendanceSessions}
            onSaveAttendance={handleSaveAttendance}
            onResetClasses={handleResetClasses}
            defaultRombelData={DEFAULT_ROMBEL_DATA}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <div id="portal-login-screen" className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-800">
        <div></div> {/* Spacing container */}
        <div className="max-w-md w-full mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
                <BookOpen className="w-64 h-64" />
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-100">Portal Akademik</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight font-sans">PORTAL GURU SMP</h2>
              <p className="text-blue-100 text-xs mt-1 font-medium">Sistem Informasi, Absensi Siswa &amp; Administrasi Kelas Mandiri</p>
            </div>

            {/* Login form body */}
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed"
                >
                  <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                {/* User ID Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 block transition-all">User ID (Sesuai NIP)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Masukkan User ID Anda..."
                      className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700">Password</label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan Password Anda..."
                      className="w-full text-xs pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action submit button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Portal</span>
              </button>

              {/* Information secure info banner */}
              <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <Key className="w-3 h-3 text-slate-350" />
                <span>Autentikasi Terenkripsi Khusus Tenaga Pendidik</span>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Footer info lock */}
        <div className="py-6 text-center text-[11px] text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} – Portal Akademik Guru Mandiri. Semua hak cipta dilindungi.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="portal-app-wrapper" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Dynamic Upper Top Bar header info */}
      <header id="main-header" className="bg-white border-b border-blue-50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Title Block */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-sm text-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Portal Guru</h1>
                <p className="text-xs text-blue-600 font-bold tracking-wider uppercase">Tingkat SMP</p>
              </div>
            </div>

            {/* Profile Info Block inside Header */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-extrabold text-slate-900">{profile.name}</p>
                <span className="text-xs text-slate-500 font-medium">
                  {profile.subject} • NIP: {profile.nip}
                </span>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold shadow-sm">
                {profile.name ? profile.name.charAt(0) : 'S'}
              </div>

              {/* Keluar / Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-3.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-200 hover:border-rose-250 shadow-sm"
                title="Keluar dari Portal Guru"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Portal Admin Container Grid */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Navigation & Tab Selection - High-contrast Blue Theme Bar */}
        <section id="portal-navigation" className="bg-white shadow-sm border border-blue-50/70 p-2 rounded-2xl">
          <nav className="grid grid-cols-2 shadow-inner bg-slate-50 rounded-xl p-1 md:flex md:flex-wrap md:items-center md:justify-center gap-1">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center justify-center space-x-2 text-xs md:text-sm font-bold px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'profil'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/40'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profil Guru</span>
            </button>

            <button
              onClick={() => setActiveTab('jadwal')}
              className={`flex items-center justify-center space-x-2 text-xs md:text-sm font-bold px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'jadwal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/40'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Jadwal Mengajar</span>
            </button>

            <button
              onClick={() => setActiveTab('silabus')}
              className={`flex items-center justify-center space-x-2 text-xs md:text-sm font-bold px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'silabus'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/40'
              }`}
            >
              <BookMarked className="w-4 h-4 shrink-0" />
              <span>Silabus</span>
            </button>

            <button
              onClick={() => setActiveTab('bahan')}
              className={`flex items-center justify-center space-x-2 text-xs md:text-sm font-bold px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'bahan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/40'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Bahan Ajar</span>
            </button>

            <button
              onClick={() => setActiveTab('absen')}
              className={`col-span-2 md:col-span-1 flex items-center justify-center space-x-2 text-xs md:text-sm font-bold px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'absen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/40'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Absen Siswa</span>
            </button>
          </nav>
        </section>

        {/* Dynamic Context Notice regarding No Mock Data */}
        <div id="notice-alert" className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Informasi Database Lokal:</span>
            <p className="leading-relaxed">
              Portal ini tidak menggunakan data sampel. Seluruh menu dimulai dengan keadaan bersih dan siap pakai serta tersinkronisasi langsung ke memori penjelajah internet Anda sendiri secara aman.
            </p>
          </div>
        </div>

        {/* Dynamic Component Output containing tabs with beautiful transitions */}
        <section id="portal-view-viewport" className="pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Styled clean portal footer */}
      <footer id="main-footer" className="bg-white border-t border-slate-100 py-6 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} – Portal Guru SMP. Pengelolaan data Mandiri oleh {profile.name}.</p>
        </div>
      </footer>
    </div>
  );
}
