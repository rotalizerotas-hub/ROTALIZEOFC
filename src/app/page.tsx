export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: '1rem'
        }}>
          Rotalize
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Sistema de Gestão de Entregas
        </p>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <p style={{
            color: '#059669',
            fontWeight: '600'
          }}>
            Sistema funcionando perfeitamente!
          </p>
        </div>
      </div>
    </div>
  )
}