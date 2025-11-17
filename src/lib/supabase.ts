import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          establishment_type_id: string
          latitude: number
          longitude: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          establishment_type_id: string
          latitude: number
          longitude: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          establishment_type_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_organizations: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'admin' | 'operator' | 'delivery_driver'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role: 'admin' | 'operator' | 'delivery_driver'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: 'admin' | 'operator' | 'delivery_driver'
          created_at?: string
        }
      }
      delivery_drivers: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          is_online: boolean
          current_latitude: number | null
          current_longitude: number | null
          total_today: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          is_online?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          total_today?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          is_online?: boolean
          current_latitude?: number | null
          current_longitude?: number | null
          total_today?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          organization_id: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_latitude: number
          delivery_longitude: number
          value: number
          notes: string | null
          status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          delivery_driver_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_latitude: number
          delivery_longitude: number
          value: number
          notes?: string | null
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          delivery_driver_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_latitude?: number
          delivery_longitude?: number
          value?: number
          notes?: string | null
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          delivery_driver_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_events: {
        Row: {
          id: string
          order_id: string
          event_type: 'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          event_type: 'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          event_type?: 'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
          description?: string
          created_at?: string
        }
      }
      establishment_types: {
        Row: {
          id: string
          name: string
          icon_url: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon_url: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon_url?: string
          emoji?: string
          created_at?: string
        }
      }
    }
  }
}