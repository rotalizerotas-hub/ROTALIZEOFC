export default function Mapa() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 50%, #e3f2fd 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <a 
            href="/" 
            style={{
              color: '#2196f3',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            ← Voltar ao Dashboard
          </a>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #9c27b0, #e91e63)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Mapa de Entregas
        </h1>

        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem'
        }}>
          
          <div style={{
            height: '400px',
            background: 'linear-gradient(135deg, #e3f2fd, #e8f5e8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Mapa Interativo
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Visualização de entregas em tempo real
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📍</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>3 Pedidos</div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🚚</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>2 Entregadores</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#ff9800',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Pendentes</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Aguardando atribuição</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#2196f3',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Em Trânsito</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>A caminho do destino</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#4caf50',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Entregues</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>Concluídos com sucesso</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}