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
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          code: string;
          created_at?: string;
          notified?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          code?: string;
          created_at?: string;
          notified?: boolean;
        };
      };
    };
  };
};

export type WaitlistEntry = Database['public']['Tables']['waitlist']['Row'];
