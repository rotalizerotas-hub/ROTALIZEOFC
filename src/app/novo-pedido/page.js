export default function NovoPedido() {
  return (
    <div className="page-bg">
      <div className="page-container" style={{ maxWidth: '800px' }}>
        
        <div className="mb-6">
          <a href="/" className="text-blue" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
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

        <div className="card">
          
          <form>
            
            <div className="form-group">
              <label className="form-label">Nome do Cliente</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input 
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Endereço Completo</label>
              <textarea 
                className="form-textarea"
                placeholder="Rua, número, bairro, cidade"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea 
                className="form-textarea"
                placeholder="Observações do pedido..."
                rows="3"
              />
            </div>

            <div className="flex" style={{ gap: '1rem' }}>
              <a href="/" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                Cancelar
              </a>
              <button 
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
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