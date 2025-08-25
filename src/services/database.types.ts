export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          company: string | null;
          activity: string;
          address: string | null;
          space_type: string;
          start_date: string;
          end_date: string;
          occupants: number;
          subscription_type: string;
          amount: number;
          payment_method: string;
          transaction_id: string;
          status: string;
          notes: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          company?: string | null;
          activity: string;
          address?: string | null;
          space_type: string;
          start_date: string;
          end_date: string;
          occupants: number;
          subscription_type: string;
          amount: number;
          payment_method: string;
          transaction_id: string;
          status?: string;
          notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          company?: string | null;
          activity?: string;
          address?: string | null;
          space_type?: string;
          start_date?: string;
          end_date?: string;
          occupants?: number;
          subscription_type?: string;
          amount?: number;
          payment_method?: string;
          transaction_id?: string;
          status?: string;
          notes?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          role: string;
          full_name: string;
          phone: string | null;
          company: string | null;
          address: string | null;
          activity: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          role?: string;
          full_name: string;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          activity?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          full_name?: string;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          activity?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      create_reservation_admin: {
        Args: {
          reservation_data: Json;
        };
        Returns: Json;
      };
      update_reservation_admin: {
        Args: {
          reservation_id: string;
          reservation_data: Json;
        };
        Returns: Json;
      };
      delete_reservation_admin: {
        Args: {
          reservation_id: string;
        };
        Returns: Json;
      };
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];