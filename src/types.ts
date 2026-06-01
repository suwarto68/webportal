export interface TeacherProfile {
  name: string;
  nip: string;
  school: string;
  subject: string;
  email: string;
  phone: string;
  bio: string;
}

export interface ScheduleItem {
  id: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  classGroup: string;
  topic: string;
}

export interface SyllabusItem {
  id: string;
  classGroup: string;
  topic: string;
  description: string;
  basicCompetency: string;
  allocatedTime: number; // JP (Jam Pelajaran)
}

export type MaterialFormat = 'PDF' | 'Video' | 'Lembar Kerja' | 'Soal Latihan';

export interface MaterialItem {
  id: string;
  title: string;
  format: MaterialFormat;
  classGroup: string;
  description: string;
  urlOrFilename: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  students: Student[];
}

export interface AttendanceRecord {
  studentId: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
}

export interface AttendanceSession {
  id: string;
  classGroupId: string;
  date: string;
  records: AttendanceRecord[];
}
