export default function Mapa() {
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
          background: 'linear-gradient(135deg, #9c27b0, #e91e63)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Mapa de Entregas
        </h1>

        <div className="card mb-6">
          
          <div style={{
            height: '400px',
            background: 'linear-gradient(135deg, #e3f2fd, #e8f5e8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #ccc'
          }}>
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Mapa Interativo
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Visualização de entregas em tempo real
              </p>
              <div className="grid-2" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <div className="card-small text-center">
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📍</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>3 Pedidos</div>
                </div>
                <div className="card-small text-center">
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🚚</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>2 Entregadores</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="grid-auto">
          
          <div className="card-small">
            <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
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

          <div className="card-small">
            <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
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

          <div className="card-small">
            <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
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