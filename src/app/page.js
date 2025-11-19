export default function Home() {
  return (
    <div className="page-bg">
      <div className="page-container">
        
        <div className="text-center mb-8">
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
        </div>
        
        <div className="grid-auto mb-8">
          
          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Novo Pedido
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Criar pedido manual com localização
            </p>
            <a href="/novo-pedido" className="btn btn-primary" style={{ width: '100%' }}>
              Criar Pedido
            </a>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Mapa
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Visualizar entregas em tempo real
            </p>
            <a href="/mapa" className="btn btn-purple" style={{ width: '100%' }}>
              Ver Mapa
            </a>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Entregadores
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Gerenciar equipe de entrega
            </p>
            <a href="/entregadores" className="btn btn-orange" style={{ width: '100%' }}>
              Gerenciar
            </a>
          </div>

        </div>

        <div className="grid-4">
          
          <div className="card-small text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', marginBottom: '0.5rem' }}>
              12
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Pedidos Hoje
            </div>
          </div>

          <div className="card-small text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '0.5rem' }}>
              8
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Entregues
            </div>
          </div>

          <div className="card-small text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '0.5rem' }}>
              4
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Pendentes
            </div>
          </div>

          <div className="card-small text-center">
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