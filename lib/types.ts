// =====================================================
// DATABASE TYPES
// =====================================================

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string;
          code: string;
          created_at: string;
          notified: boolean;
          // Nuevos campos para drip campaign
          email_sequence_step: number;
          last_email_sent_at: string | null;
          unsubscribed: boolean;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          code: string;
          created_at?: string;
          notified?: boolean;
          email_sequence_step?: number;
          last_email_sent_at?: string;
          unsubscribed?: boolean;
          unsubscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          code?: string;
          created_at?: string;
          notified?: boolean;
          email_sequence_step?: number;
          last_email_sent_at?: string;
          unsubscribed?: boolean;
          unsubscribed_at?: string;
        };
      };
      email_drafts: {
        Row: {
          id: string;
          email_type: EmailType;
          sequence_step: number | null;
          subject: string;
          preview_text: string | null;
          html_content: string;
          plain_text_content: string | null;
          source: EmailSource;
          ai_prompt: string | null;
          status: EmailStatus;
          scheduled_for: string | null;
          target_audience: TargetAudience;
          recipients_count: number;
          sent_count: number;
          failed_count: number;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          sent_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          email_type: EmailType;
          sequence_step?: number;
          subject: string;
          preview_text?: string;
          html_content: string;
          plain_text_content?: string;
          source?: EmailSource;
          ai_prompt?: string;
          status?: EmailStatus;
          scheduled_for?: string;
          target_audience?: TargetAudience;
          recipients_count?: number;
          sent_count?: number;
          failed_count?: number;
          approved_by?: string;
        };
        Update: {
          email_type?: EmailType;
          sequence_step?: number;
          subject?: string;
          preview_text?: string;
          html_content?: string;
          plain_text_content?: string;
          source?: EmailSource;
          ai_prompt?: string;
          status?: EmailStatus;
          scheduled_for?: string;
          target_audience?: TargetAudience;
          recipients_count?: number;
          sent_count?: number;
          failed_count?: number;
          approved_at?: string;
          sent_at?: string;
          approved_by?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          template_key: string;
          name: string;
          description: string | null;
          email_type: EmailType;
          sequence_step: number | null;
          subject: string;
          preview_text: string | null;
          html_content: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_key: string;
          name: string;
          description?: string;
          email_type: EmailType;
          sequence_step?: number;
          subject: string;
          preview_text?: string;
          html_content: string;
          is_active?: boolean;
        };
        Update: {
          template_key?: string;
          name?: string;
          description?: string;
          email_type?: EmailType;
          sequence_step?: number;
          subject?: string;
          preview_text?: string;
          html_content?: string;
          is_active?: boolean;
        };
      };
      email_logs: {
        Row: {
          id: string;
          draft_id: string | null;
          waitlist_id: string | null;
          email_to: string;
          subject: string;
          status: 'sent' | 'failed' | 'bounced';
          error_message: string | null;
          resend_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          draft_id?: string;
          waitlist_id?: string;
          email_to: string;
          subject: string;
          status: 'sent' | 'failed' | 'bounced';
          error_message?: string;
          resend_id?: string;
        };
        Update: {
          status?: 'sent' | 'failed' | 'bounced';
          error_message?: string;
          resend_id?: string;
        };
      };
      email_sequence_config: {
        Row: {
          step: number;
          days_after_previous: number;
          template_key: string;
          is_active: boolean;
          description: string | null;
        };
        Insert: {
          step: number;
          days_after_previous: number;
          template_key: string;
          is_active?: boolean;
          description?: string;
        };
        Update: {
          days_after_previous?: number;
          template_key?: string;
          is_active?: boolean;
          description?: string;
        };
      };
    };
  };
};

// =====================================================
// ENUM TYPES
// =====================================================

export type EmailType =
  | 'sequence'           // Email de la secuencia de nurturing
  | 'broadcast'          // Email masivo a todos
  | 'gospel_reflection'  // Reflexión del evangelio
  | 'pope_words'         // Palabras del Papa
  | 'news'               // Noticias católicas
  | 'launch';            // Notificación de lanzamiento

export type EmailSource =
  | 'manual'        // Creado manualmente
  | 'ai_generated'  // Generado por IA
  | 'template';     // Desde plantilla

export type EmailStatus =
  | 'draft'      // Borrador (pendiente de revisión)
  | 'approved'   // Aprobado (listo para enviar)
  | 'scheduled'  // Programado para envío futuro
  | 'sending'    // Enviándose
  | 'sent'       // Enviado
  | 'cancelled'; // Cancelado

export type TargetAudience = {
  all?: boolean;
  sequence_step?: number;
  sequence_step_gte?: number;
  sequence_step_lte?: number;
  registered_before?: string;
  registered_after?: string;
  notified?: boolean;
};

// =====================================================
// HELPER TYPES
// =====================================================

export type WaitlistEntry = Database['public']['Tables']['waitlist']['Row'];
export type EmailDraft = Database['public']['Tables']['email_drafts']['Row'];
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type EmailLog = Database['public']['Tables']['email_logs']['Row'];
export type SequenceConfig = Database['public']['Tables']['email_sequence_config']['Row'];

// Insert types
export type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert'];
export type EmailDraftInsert = Database['public']['Tables']['email_drafts']['Insert'];
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert'];
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert'];

// Update types
export type WaitlistUpdate = Database['public']['Tables']['waitlist']['Update'];
export type EmailDraftUpdate = Database['public']['Tables']['email_drafts']['Update'];

// =====================================================
// API RESPONSE TYPES
// =====================================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// =====================================================
// DRIP CAMPAIGN TYPES
// =====================================================

export type DripCampaignResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
};

export type EmailPreview = {
  subject: string;
  previewText: string;
  htmlContent: string;
  recipientCount: number;
};
