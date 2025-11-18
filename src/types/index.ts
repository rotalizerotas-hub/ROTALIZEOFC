// Tipos base do sistema
export interface Order {
  id: string
  organization_id?: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_latitude: number
  delivery_longitude: number
  value: number
  notes?: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  delivery_driver_id?: string
  customer_id?: string
  establishment_type_id?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  is_manual?: boolean
  created_at?: string
  updated_at?: string
}

export interface DeliveryOrder {
  id: string
  organization_id?: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_latitude: number
  delivery_longitude: number
  value: number
  notes?: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  delivery_driver_id?: string
  customer_id?: string
  establishment_type_id?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  is_manual?: boolean
  created_at?: string
  updated_at?: string
}

export interface DeliveryDriver {
  id: string
  user_id?: string
  organization_id?: string
  is_online?: boolean
  current_latitude?: number
  current_longitude?: number
  total_today?: number
  vehicle_type?: string
  created_at?: string
  updated_at?: string
}

export interface Organization {
  id: string
  name: string
  address: string
  phone: string
  establishment_type_id?: string
  latitude: number
  longitude: number
  created_at?: string
  updated_at?: string
}

export interface EstablishmentType {
  id: string
  name: string
  icon_url: string
  emoji: string
  created_at?: string
}

export interface Customer {
  id: string
  organization_id?: string
  full_name: string
  phone?: string
  email?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  created_at?: string
  updated_at?: string
}

export interface UserOrganization {
  id: string
  user_id?: string
  organization_id?: string
  role: 'admin' | 'operator' | 'driver'
  created_at?: string
}

// Tipos para componentes de mapa
export interface MapOrder {
  id: string
  latitude: number
  longitude: number
  customerName: string
  status: string
  categoryEmoji: string
  orderNumber?: string
}

// Tipos para formulários
export interface OrderFormData {
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_latitude: number
  delivery_longitude: number
  value: number
  notes?: string
  establishment_type_id?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
}

export interface AddressData {
  fullAddress: string
  street: string
  number: string
  neighborhood: string
  city: string
  latitude: number
  longitude: number
}