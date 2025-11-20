'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Package2, Sparkles } from 'lucide-react'

export function LoginForm() {
  return (
    <div className="min-h-screen bg-primary-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo e Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-gradient rounded-2xl shadow-xl mb-6 relative overflow-hidden">
            <Package2 className="w-10 h-10 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
          
          <h1 className="text-heading-1 text-primary-gradient mb-2">
            RotaLize
          </h1>
          
          <p className="text-body text-gray-600">
            Sistema Inteligente de Gestão de Entregas
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-caption text-gray-500">Versão Profissional</span>
          </div>
        </div>

        {/* Card de Login */}
        <div className="card card-elevated glass p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-heading-3 text-gray-800 mb-2">Bem-vindo de volta</h2>
            <p className="text-body-sm text-gray-600">
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
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '6px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '14px 24px',
                    inputPadding: '14px 16px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
                    buttonFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
                    inputFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
                    labelFontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '0px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
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
        <div className="text-center">
          <p className="text-body-sm text-gray-500 mb-4">
            Plataforma segura e confiável para sua empresa
          </p>
          
          <div className="flex items-center justify-center gap-6 text-caption text-gray-400">
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