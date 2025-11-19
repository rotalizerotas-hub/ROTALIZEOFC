'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { LatLngExpression } from 'leaflet'

// Importar Leaflet dinamicamente para evitar problemas de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

interface OrderMarker {
  id: string
  latitude: number
  longitude: number
  customerName: string
  status: string
  categoryIcon: string
  categoryEmoji: string
  orderNumber?: string
}

interface DeliveryDriver {
  id: string
  name: string
  latitude: number
  longitude: number
  vehicleType: 'moto' | 'carro' | 'caminhao'
  isOnline: boolean
}

interface LeafletMapProps {
  orders?: OrderMarker[]
  drivers?: DeliveryDriver[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  onOrderClick?: (orderId: string) => void
  className?: string
}

const getVehicleIcon = (vehicleType: string): string => {
  const icons = {
    moto: '🏍️',
    carro: '🚗',
    caminhao: '🚛'
  }
  return icons[vehicleType as keyof typeof icons] || '🚗'
}

const getStatusColor = (status: string): string => {
  const colors = {
    pending: '#ffd93d',
    assigned: '#6c5ce7',
    in_transit: '#fd79a8',
    delivered: '#00b894',
    cancelled: '#ddd',
    preview: '#3b82f6'
  }
  return colors[status as keyof typeof colors] || '#ddd'
}

// Componente customizado para marcadores
function CustomMarker({ order, onOrderClick }: { order: OrderMarker, onOrderClick?: (orderId: string) => void }) {
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet)
    })
  }, [])

  if (!L) return null

  const isPreview = order.id === 'preview'
  const backgroundColor = getStatusColor(isPreview ? 'preview' : order.status)
  
  const customIcon = L.divIcon({
    html: `
      <div style="
        background: ${backgroundColor};
        width: ${isPreview ? '50px' : '40px'};
        height: ${isPreview ? '50px' : '40px'};
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isPreview ? '22px' : '18px'};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ${isPreview ? 'animation: bounce 2s infinite;' : ''}
      ">
        ${order.categoryEmoji || '📍'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [isPreview ? 50 : 40, isPreview ? 50 : 40],
    iconAnchor: [isPreview ? 25 : 20, isPreview ? 50 : 40]
  })

  const handleClick = () => {
    console.log('🖱️ [MAP] Clique no marcador:', order.id)
    if (onOrderClick && !isPreview) {
      onOrderClick(order.id)
    }
  }

  const position: LatLngExpression = [order.latitude, order.longitude]

  return (
    <Marker 
      position={position}
      icon={customIcon}
      eventHandlers={{
        click: handleClick
      }}
    >
      <Popup>
        <div style={{ padding: '8px', minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>{order.categoryEmoji || '📍'}</span>
            <h3 style={{ margin: 0, fontWeight: 600, color: '#333' }}>{order.customerName}</h3>
          </div>
          {order.orderNumber && (
            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
              Pedido #{order.orderNumber}
            </p>
          )}
          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
            Status: {isPreview ? 'Preview' : getStatusText(order.status)}
          </p>
          {!isPreview ? (
            <button 
              onClick={() => assumeRoute(order.id)}
              style={{
                background: 'linear-gradient(45deg, #00b894, #00cec9)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                marginTop: '8px',
                width: '100%'
              }}
            >
              🚀 Assumir Rota
            </button>
          ) : (
            <p style={{ margin: '8px 0 0 0', color: '#3b82f6', fontSize: '12px', fontStyle: 'italic' }}>
              📍 Localização encontrada
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

// Componente para marcadores de entregadores
function DriverMarker({ driver }: { driver: DeliveryDriver }) {
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet)
    })
  }, [])

  if (!L || !driver.isOnline) return null

  const customIcon = L.divIcon({
    html: `
      <div style="
        background: #00b894;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
        ${getVehicleIcon(driver.vehicleType)}
      </div>
    `,
    className: 'driver-marker',
    iconSize: [35, 35],
    iconAnchor: [17, 35]
  })

  const position: LatLngExpression = [driver.latitude, driver.longitude]

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div style={{ padding: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>{getVehicleIcon(driver.vehicleType)}</span>
            <h3 style={{ margin: 0, fontWeight: 600, color: '#333' }}>{driver.name}</h3>
          </div>
          <p style={{ margin: '4px 0', color: '#00b894', fontSize: '14px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#00b894', borderRadius: '50%', marginRight: '6px' }}></span>
            Online
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    assigned: 'Atribuído',
    in_transit: 'Em trânsito',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  }
  return statusMap[status] || status
}

// Função global para assumir rota
const assumeRoute = async (orderId: string) => {
  console.log('🚀 [ROUTE] Assumindo rota para pedido:', orderId)
  // Implementar lógica de rota aqui
}

export function LeafletMap({ 
  orders = [], 
  drivers = [], 
  centerLat = -19.9167, 
  centerLng = -43.9345, 
  zoom = 12,
  onOrderClick,
  className = '' 
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngExpression[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log('🗺️ [MAP] Atualizando dados:', { 
      orders: orders.length, 
      drivers: drivers.length,
      center: [centerLat, centerLng]
    })
  }, [orders, drivers, centerLat, centerLng])

  if (!isClient) {
    return (
      <div className={`w-full h-full rounded-2xl shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  const center: LatLngExpression = [centerLat, centerLng]

  return (
    <>
      <div className={`w-full h-full rounded-2xl shadow-lg overflow-hidden ${className}`}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          key={`${centerLat}-${centerLng}-${zoom}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcadores de pedidos */}
          {orders.map((order) => (
            <CustomMarker 
              key={order.id} 
              order={order} 
              onOrderClick={onOrderClick}
            />
          ))}
          
          {/* Marcadores de entregadores */}
          {drivers.map((driver) => (
            <DriverMarker key={driver.id} driver={driver} />
          ))}
          
          {/* Rota (se existir) */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates}
              pathOptions={{
                color: "#00b894",
                weight: 6,
                opacity: 0.8
              }}
            />
          )}
        </MapContainer>
      </div>
      
      <style jsx global>{`
        /* Estilos básicos do Leaflet */
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 1rem;
        }
        
        .leaflet-control-container .leaflet-routing-container-hide {
          display: none;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        }
        
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          border: none !important;
          background: white !important;
          color: #333 !important;
          font-weight: bold !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f0f0f0 !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-popup-tip {
          background: white !important;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 184, 148, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 184, 148, 0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .custom-marker {
          z-index: 1000;
        }
        
        .driver-marker {
          z-index: 999;
        }
      `}</style>
    </>
  )
}