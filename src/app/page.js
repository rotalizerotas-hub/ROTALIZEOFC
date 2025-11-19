export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 50%, #e3f2fd 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #2196f3, #4caf50)',
          borderRadius: '20px',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <span style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white'
          }}>R</span>
        </div>
        
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1976d2, #388e3c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          RotaLize
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#666',
          marginBottom: '3rem'
        }}>
          Sistema de Gestão de Entregas
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Novo Pedido
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Criar pedido manual com localização
            </p>
            <a 
              href="/novo-pedido"
              style={{
                display: 'inline-block',
                width: '100%',
                background: 'linear-gradient(135deg, #2196f3, #4caf50)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Criar Pedido
            </a>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Mapa
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Visualizar entregas em tempo real
            </p>
            <a 
              href="/mapa"
              style={{
                display: 'inline-block',
                width: '100%',
                background: 'linear-gradient(135deg, #9c27b0, #e91e63)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Ver Mapa
            </a>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Entregadores
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Gerenciar equipe de entrega
            </p>
            <a 
              href="/entregadores"
              style={{
                display: 'inline-block',
                width: '100%',
                background: 'linear-gradient(135deg, #ff9800, #f44336)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Gerenciar
            </a>
          </div>

        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
              12
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Pedidos Hoje
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '0.5rem' }}>
              8
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Entregues
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '0.5rem' }}>
              4
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Pendentes
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0', marginBottom: '0.5rem' }}>
              3
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Entregadores
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}