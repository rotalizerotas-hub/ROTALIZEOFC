'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Package2, Sparkles } from 'lucide-react'

export function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
    }}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Branding */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl" style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)'
          }}>
            <Package2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            RotaLize
          </h1>
          
          <p className="text-gray-600 text-lg mb-4">
            Sistema Inteligente de Gestão de Entregas
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-500 uppercase tracking-wide">Versão Profissional</span>
          </div>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-600">
              Acesse sua conta para gerenciar suas entregas
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1e40af, #059669)',
                  border: 'none',
                  padding: '14px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.3)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                input: {
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '14px 16px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
                label: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                },
                container: {
                  gap: '20px',
                },
                divider: {
                  background: '#e5e7eb',
                  margin: '24px 0',
                },
                message: {
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  marginBottom: '16px',
                },
              },
              variables: {
                default: {
                  colors: {
                    brand: '#1e40af',
                    brandAccent: '#059669',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    inputBackground: 'white',
                    inputBorder: '#e5e7eb',
                    inputBorderHover: '#d1d5db',
                    inputBorderFocus: '#1e40af',
                  },
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
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  link_text: 'Não tem uma conta? Crie aqui',
                  confirmation_text: 'Verifique seu email para confirmar sua conta',
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

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-gray-500">
            Plataforma segura e confiável para sua empresa
          </p>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 uppercase tracking-wide">
            <span>Suporte 24/7</span>
            <span>•</span>
            <span>Dados Protegidos</span>
            <span>•</span>
            <span>SSL Seguro</span>
          </div>
        </div>
      </div>
    </div>
  )
}