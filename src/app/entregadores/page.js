export default function Entregadores() {
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
          background: 'linear-gradient(135deg, #ff9800, #f44336)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Entregadores
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '0.5rem' }}>
              2
            </div>
            <div style={{ color: '#666' }}>Online</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
              1
            </div>
            <div style={{ color: '#666' }}>Offline</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
              16
            </div>
            <div style={{ color: '#666' }}>Entregas Hoje</div>
          </div>

        </div>

        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Equipe de Entregadores
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🏍️</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>João Silva</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#4caf50',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#4caf50' }}>Online</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>5</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>entregas hoje</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🚗</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Maria Santos</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#4caf50',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#4caf50' }}>Online</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>3</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>entregas hoje</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🚛</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Pedro Costa</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#999',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', color: '#999' }}>Offline</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>8</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>entregas hoje</div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(135deg, #ff9800, #f44336)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              onClick={() => alert('Funcionalidade em desenvolvimento!')}
            >
              + Adicionar Entregador
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}