export default function Entregadores() {
  return (
    <div className="page-bg">
      <div className="page-container">
        
        <div className="mb-6">
          <a href="/" className="text-blue" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
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

        <div className="grid-auto mb-6">
          
          <div className="card text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '0.5rem' }}>
              2
            </div>
            <div style={{ color: '#666' }}>Online</div>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
              1
            </div>
            <div style={{ color: '#666' }}>Offline</div>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
              16
            </div>
            <div style={{ color: '#666' }}>Entregas Hoje</div>
          </div>

        </div>

        <div className="card">
          
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
              <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🏍️</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>João Silva</div>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-online"></span>
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
              <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🚗</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Maria Santos</div>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-online"></span>
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
              <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>🚛</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Pedro Costa</div>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-offline"></span>
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

          <div className="text-center mt-6">
            <button 
              className="btn btn-orange"
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