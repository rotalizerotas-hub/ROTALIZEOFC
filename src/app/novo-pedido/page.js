export default function NovoPedido() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 50%, #e3f2fd 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
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
          background: 'linear-gradient(135deg, #1976d2, #388e3c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          Novo Pedido Manual
        </h1>

        <div style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          
          <form>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                Nome do Cliente
              </label>
              <input 
                type="text"
                placeholder="Digite o nome do cliente"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                Telefone
              </label>
              <input 
                type="tel"
                placeholder="(11) 99999-9999"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                Endereço Completo
              </label>
              <textarea 
                placeholder="Rua, número, bairro, cidade"
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#333'
              }}>
                Observações
              </label>
              <textarea 
                placeholder="Observações do pedido..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <a 
                href="/"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Cancelar
              </a>
              <button 
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #2196f3, #4caf50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                onClick={(e) => {
                  e.preventDefault()
                  alert('Pedido criado com sucesso! (Simulação)')
                  window.location.href = '/'
                }}
              >
                Criar Pedido
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  )
}