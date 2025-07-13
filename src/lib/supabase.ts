import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types
export interface Database {
  public: {
    Tables: {
      family_wallets: {
        Row: {
          id: string;
          name: string;
          balance: number;
          currency: string;
          admin_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          balance?: number;
          currency?: string;
          admin_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          balance?: number;
          currency?: string;
          admin_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          wallet_id: string;
          user_id: string;
          name: string;
          email: string;
          role: 'admin' | 'member';
          avatar_url: string | null;
          daily_limit: number;
          monthly_limit: number;
          current_daily_spent: number;
          current_monthly_spent: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          user_id: string;
          name: string;
          email: string;
          role?: 'admin' | 'member';
          avatar_url?: string | null;
          daily_limit?: number;
          monthly_limit?: number;
          current_daily_spent?: number;
          current_monthly_spent?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'member';
          avatar_url?: string | null;
          daily_limit?: number;
          monthly_limit?: number;
          current_daily_spent?: number;
          current_monthly_spent?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          wallet_id: string;
          from_member_id: string;
          to_member_id: string | null;
          amount: number;
          type: 'payment' | 'transfer' | 'topup' | 'expense';
          category: string;
          description: string;
          payment_method: string | null;
          transaction_ref: string | null;
          status: 'completed' | 'pending' | 'failed';
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          from_member_id: string;
          to_member_id?: string | null;
          amount: number;
          type: 'payment' | 'transfer' | 'topup' | 'expense';
          category: string;
          description: string;
          payment_method?: string | null;
          transaction_ref?: string | null;
          status?: 'completed' | 'pending' | 'failed';
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          from_member_id?: string;
          to_member_id?: string | null;
          amount?: number;
          type?: 'payment' | 'transfer' | 'topup' | 'expense';
          category?: string;
          description?: string;
          payment_method?: string | null;
          transaction_ref?: string | null;
          status?: 'completed' | 'pending' | 'failed';
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      dana_integrations: {
        Row: {
          id: string;
          wallet_id: string;
          phone_number: string;
          account_name: string;
          balance: number;
          is_connected: boolean;
          last_sync: string;
          access_token: string | null;
          refresh_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          phone_number: string;
          account_name: string;
          balance?: number;
          is_connected?: boolean;
          last_sync?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          phone_number?: string;
          account_name?: string;
          balance?: number;
          is_connected?: boolean;
          last_sync?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      dana_transactions: {
        Row: {
          id: string;
          dana_integration_id: string;
          external_id: string;
          amount: number;
          type: 'in' | 'out';
          description: string;
          merchant: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dana_integration_id: string;
          external_id: string;
          amount: number;
          type: 'in' | 'out';
          description: string;
          merchant?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          dana_integration_id?: string;
          external_id?: string;
          amount?: number;
          type?: 'in' | 'out';
          description?: string;
          merchant?: string | null;
          created_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          type: 'bank' | 'ewallet' | 'card';
          icon: string | null;
          fee: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'bank' | 'ewallet' | 'card';
          icon?: string | null;
          fee?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'bank' | 'ewallet' | 'card';
          icon?: string | null;
          fee?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      top_up_sessions: {
        Row: {
          id: string;
          wallet_id: string;
          member_id: string;
          amount: number;
          payment_method_id: string;
          barcode_data: string | null;
          status: 'pending' | 'completed' | 'failed' | 'expired';
          expires_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          member_id: string;
          amount: number;
          payment_method_id: string;
          barcode_data?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'expired';
          expires_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          member_id?: string;
          amount?: number;
          payment_method_id?: string;
          barcode_data?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'expired';
          expires_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}