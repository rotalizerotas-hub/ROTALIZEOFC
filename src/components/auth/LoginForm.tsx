'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            RotaLize
          </h1>
          
          <p className="text-gray-600">
            Sistema de Gestão de Entregas
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2196f3, #4caf50)',
                  border: 'none',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                },
                input: {
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  padding: '12px',
                  fontSize: '16px',
                },
                label: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                },
              },
            }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Crie aqui',
                },
                forgotten_password: {
                  email_label: 'Email',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                  confirmation_text: 'Verifique seu email para redefinir a senha',
                },
              },
            }}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Acesse sua conta para gerenciar entregas
          </p>
        </div>
      </div>
    </div>
  )
}