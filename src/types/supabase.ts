export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          image: string | null;
          email_confirmed_at: string | null;
          created_at: string;
          last_sign_in_at: string | null;
        };
        Insert: {
          email: string;
          first_name: string;
          last_name: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          first_name: string;
          last_name: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // insert other tables here
    };
  };
}
