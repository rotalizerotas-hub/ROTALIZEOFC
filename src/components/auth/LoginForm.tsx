'use client'

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Adiciona o botão de mostrar/ocultar senha depois que o componente é montado
    const addPasswordToggle = () => {
      setTimeout(() => {
        const passwordFields = document.querySelectorAll('input[type="password"]')
        
        passwordFields.forEach(field => {
          // Verificar se já existe um botão de toggle para este campo
          const parentElement = field.parentElement
          if (parentElement && !parentElement.querySelector('.password-toggle-btn')) {
            // Obter a altura exata do campo de senha para alinhamento perfeito
            const fieldHeight = field.offsetHeight
            
            // Criar o botão de toggle
            const toggleBtn = document.createElement('button')
            toggleBtn.type = 'button'
            toggleBtn.className = 'password-toggle-btn'
            toggleBtn.style.position = 'absolute'
            toggleBtn.style.right = '12px'
            
            // Posicionar o botão precisamente no centro vertical
            toggleBtn.style.height = `${fieldHeight}px`
            toggleBtn.style.top = '0'
            toggleBtn.style.display = 'flex'
            toggleBtn.style.alignItems = 'center'
            toggleBtn.style.justifyContent = 'center'
            
            toggleBtn.style.background = 'transparent'
            toggleBtn.style.border = 'none'
            toggleBtn.style.cursor = 'pointer'
            toggleBtn.style.color = '#64748b'
            toggleBtn.style.padding = '0'
            toggleBtn.style.margin = '0'
            toggleBtn.style.zIndex = '10'
            toggleBtn.style.width = '36px'
            toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
            
            // Garantir que o container tem position relative
            if (getComputedStyle(parentElement).position !== 'relative') {
              parentElement.style.position = 'relative'
            }
            
            // Ajustar o padding do input para evitar que o texto fique sob o botão
            field.style.paddingRight = '40px'
            
            // Adicionar o botão ao DOM
            parentElement.appendChild(toggleBtn)
            
            // Adicionar o evento de toggle
            toggleBtn.addEventListener('click', () => {
              const type = field.getAttribute('type') === 'password' ? 'text' : 'password'
              field.setAttribute('type', type)
              
              // Trocar o ícone
              if (type === 'text') {
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>'
              } else {
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
              }
            })
          }
        })
      }, 500) // Pequeno delay para garantir que o Auth UI já renderizou
    }

    // Executar quando montar e também sempre que houver mudança de view no Auth UI
    addPasswordToggle()
    
    // Observer para detectar quando novos campos de senha são adicionados ao DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          addPasswordToggle()
        }
      })
    })
    
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Rotas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema de Gestão de Entregas
          </p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Entre com seu e-mail para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#1d4ed8',
                      brandButtonText: 'white',
                      defaultButtonBackground: '#f8fafc',
                      defaultButtonBackgroundHover: '#f1f5f9',
                      inputBackground: '#ffffff',
                      inputBorder: '#e2e8f0',
                      inputBorderHover: '#cbd5e1',
                      inputBorderFocus: '#3b82f6',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                  },
                },
                className: {
                  button: 'rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
                  input: 'rounded-xl shadow-sm',
                  label: 'text-gray-700 font-medium',
                },
              }}
              theme="light"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'E-mail',
                    password_label: 'Senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    link_text: 'Já tem uma conta? Entre aqui',
                  },
                  sign_up: {
                    email_label: 'E-mail',
                    password_label: 'Senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    link_text: 'Não tem uma conta? Crie aqui',
                  },
                  magic_link: {
                    email_input_label: 'E-mail',
                    button_label: 'Enviar link mágico',
                    loading_button_label: 'Enviando...',
                    link_text: 'Enviar um link mágico por e-mail',
                    confirmation_text: 'Verifique seu e-mail para o link de login',
                  },
                  forgotten_password: {
                    email_label: 'E-mail',
                    button_label: 'Enviar instruções',
                    loading_button_label: 'Enviando instruções...',
                    link_text: 'Esqueceu sua senha?',
                    confirmation_text: 'Verifique seu e-mail para redefinir sua senha',
                  },
                },
              }}
              redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
              view="sign_in"
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Rotas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}