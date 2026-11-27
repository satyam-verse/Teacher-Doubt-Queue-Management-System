export type Role = 'student' | 'teacher' | 'admin';

export type SubscriptionTier = 'free' | 'pro' | 'campus';

export type DoubtStatus = 'QUEUED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export type ViewMode = 'landing' | 'student-dashboard' | 'teacher-console' | 'admin-console' | 'ai-solver';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  subscription_tier?: SubscriptionTier;
  subscription_status?: string;
  daily_ai_query_count?: number;
  daily_ai_query_quota?: number;
  created_at: string;
}

export interface ClassroomSession {
  id: number;
  session_code: string;
  title: string;
  teacher_id: number;
  teacher_name?: string;
  is_active: boolean;
  created_at: string;
  queued_count?: number;
}

export interface Doubt {
  id: number;
  session_id?: number;
  session_code?: string;
  student_id?: number;
  student_name: string;
  doubt: string;
  category: string;
  priority: Priority;
  status: DoubtStatus;
  attachment_url?: string | null;
  ai_hint?: string | null;
  ai_suggested_solution?: string | null;
  resolved_by_id?: number | null;
  resolver_name?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
  queue_position?: number;
  estimated_wait_minutes?: number;
}

export interface QueueStats {
  queued: number;
  in_progress: number;
  resolved: number;
  total: number;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'assistant';
  content: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  language?: string | null;
  explanation_level?: ExplanationLevel;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id?: number | null;
  title: string;
  explanation_level: ExplanationLevel;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
  messages?: ConversationMessage[];
}

export interface AdminStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    tier_distribution: {
      free: number;
      pro: number;
      campus: number;
    };
  };
  doubts: {
    total: number;
    queued: number;
    in_progress: number;
    resolved: number;
    avg_resolution_minutes: number;
  };
  ai_workspace: {
    total_conversations: number;
    total_messages_generated: number;
  };
}

export interface SystemHealthInfo {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    database: {
      status: string;
      engine: string;
    };
    gemini_ai: {
      status: string;
      model?: string;
      configured?: boolean;
      latency_ms?: number;
    };
    websocket: {
      status: string;
      protocol: string;
    };
  };
}
