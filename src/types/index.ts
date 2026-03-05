export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  aadhaarNumber?: string;
  govtSchemesEligible?: string[];
  createdAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  crowdLevel: 'low' | 'medium' | 'high';
  departments: string[];
  phone: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  departmentId: string;
  avatar: string;
  rating: number;
  isOnline: boolean;
  avgConsultTime: number;
  languages: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  hospitalId: string;
  doctorId: string;
  departmentId: string;
  tokenNumber: number;
  status: 'booked' | 'checkedIn' | 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled';
  symptoms: string;
  priority: 'normal' | 'senior' | 'emergency';
  bookedAt: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  estimatedWait?: number;
}

export interface QueueToken {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  position: number;
  estimatedMinutes: number;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
}

export interface Department {
  id: string;
  name: string;
  hospitalId: string;
  currentQueueLength: number;
  estimatedWaitTime: number;
  isActive: boolean;
}

export interface Feedback {
  id: string;
  appointmentId: string;
  patientId: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: Date;
}