// Shared types for client and server

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "patient";
  phone?: string;
  address?: string;
  age?: number;
  gender?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled" | "no-show";
  notes?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  message_text?: string;
  subject?: string;
  created_at: string;
  is_read: boolean;
  is_broadcast?: boolean;
}

export interface CreateAppointmentRequest {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
}

// Dashboard stats interface
export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalUsers: number;
  newUsersThisMonth: number;
  appointmentsThisMonth: number;
  revenue: number;
  revenueGrowth: number;
}

// User with credentials interface
export interface UserWithCredentials extends User {
  password?: string;
}

// Demo response interface (from the original template)
export interface DemoResponse {
  message: string;
  timestamp: string;
}
