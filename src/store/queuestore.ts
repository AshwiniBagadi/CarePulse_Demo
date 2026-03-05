import { create } from 'zustand';

interface QueueToken {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  position: number;
  estimatedMinutes: number;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
}

interface Appointment {
  id: string;
  patientId: string;
  hospitalId: string;
  doctorId: string;
  tokenNumber: number;
  status: 'booked' | 'checkedIn' | 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled';
  symptoms: string;
  priority: 'normal' | 'senior' | 'emergency';
}

interface QueueState {
  currentQueue: QueueToken[];
  myAppointment: Appointment | null;
  setQueue: (queue: QueueToken[]) => void;
  setMyAppointment: (appointment: Appointment | null) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  currentQueue: [],
  myAppointment: null,
  setQueue: (queue) => set({ currentQueue: queue }),
  setMyAppointment: (appointment) => set({ myAppointment: appointment }),
}));