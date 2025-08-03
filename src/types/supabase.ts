export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          image: string;
          created_at: string;
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
