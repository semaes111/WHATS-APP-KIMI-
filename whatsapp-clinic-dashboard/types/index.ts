// ============================================
// Tipos de Usuario y Autenticación
// ============================================

export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================
// Tipos de Paciente
// ============================================

export interface Patient {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointments?: Appointment[];
  messages?: Message[];
}

export interface CreatePatientInput {
  phone: string;
  name?: string;
  email?: string;
  dateOfBirth?: Date;
  address?: string;
  notes?: string;
}

export interface UpdatePatientInput {
  name?: string;
  email?: string;
  dateOfBirth?: Date;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

// ============================================
// Tipos de Cita (Appointment)
// ============================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  date: Date;
  duration: number; // en minutos
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentInput {
  patientId: string;
  date: Date;
  duration?: number;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  date?: Date;
  duration?: number;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

// ============================================
// Tipos de Mensaje (WhatsApp)
// ============================================

export type MessageType = 'incoming' | 'outgoing';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  patientId: string;
  patient?: Patient;
  type: MessageType;
  content: string;
  mediaUrl: string | null;
  whatsappMessageId: string | null;
  status: MessageStatus;
  sentAt: Date;
  createdAt: Date;
}

export interface CreateMessageInput {
  patientId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  whatsappMessageId?: string;
}

// ============================================
// Tipos de Informe (Report)
// ============================================

export interface DailyReport {
  date: Date;
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  newPatients: number;
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: AppointmentStatus;
}

// ============================================
// Tipos de Chat
// ============================================

export interface ChatConversation {
  patientId: string;
  patient: Patient;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  sentAt: Date;
  mediaUrl?: string;
}

// ============================================
// Tipos de API Response
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Tipos de Dashboard
// ============================================

export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  unreadMessages: number;
  weeklyAppointments: {
    day: string;
    count: number;
  }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'appointment' | 'message' | 'patient';
  description: string;
  timestamp: Date;
  patientName?: string;
}

// ============================================
// Tipos de Componentes UI
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
}

// ============================================
// Tipos de WhatsApp Webhook
// ============================================

export interface WhatsAppWebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: {
          wa_id: string;
          profile: {
            name: string;
          };
        }[];
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
      };
      field: string;
    }[];
  }[];
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

// ============================================
// Tipos de Configuración
// ============================================

export interface ClinicSettings {
  id: string;
  clinicName: string;
  phoneNumber: string;
  address: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }[];
  whatsappApiKey: string | null;
  whatsappPhoneNumberId: string | null;
  appointmentDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
