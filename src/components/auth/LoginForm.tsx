'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('✨ Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('🎉 Login realizado com sucesso!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Logo e Branding */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="logo-modern mb-6 justify-center">
            <div className="logo-icon-modern hover-lift hover-glow">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="logo-text-modern">RotaLize</div>
              <div className="logo-subtitle-modern">Sistema de Entregas</div>
            </div>
          </div>
          
          <p className="text-body-lg mb-8 max-w-sm mx-auto">
            Plataforma inteligente para gestão completa de entregas e logística
          </p>
          
          {/* Badges de Credibilidade */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-caption">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-caption">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Rápido</span>
            </div>
            <div className="flex items-center gap-2 text-caption">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Confiável</span>
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <div className="card-modern p-8 animate-fade-in-scale">
          <div className="mb-8">
            <h2 className="text-heading-3 mb-3">
              {isSignUp ? '✨ Criar Conta' : '👋 Bem-vindo de volta'}
            </h2>
            <p className="text-body">
              {isSignUp 
                ? 'Crie sua conta e comece a revolucionar suas entregas' 
                : 'Entre na sua conta para acessar o painel de controle'
              }
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email corporativo
              </label>
              <div className="relative">
                <Mail className="input-icon w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern input-with-icon focus-modern"
                  placeholder="seu@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Senha de acesso
              </label>
              <div className="relative">
                <Lock className="input-icon w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern input-with-icon focus-modern"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Principal */}
            <Button
              type="submit"
              className="btn-modern btn-primary-modern btn-lg-modern w-full group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="loading-spinner-modern"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>{isSignUp ? 'Criar Conta Gratuita' : 'Acessar Plataforma'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Toggle Modo */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              {isSignUp 
                ? '← Já tenho uma conta' 
                : 'Criar nova conta →'
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-6 animate-slide-in-right">
          <p className="text-body">
            Plataforma utilizada por <span className="font-semibold text-gray-800">1000+</span> empresas
          </p>
          
          <div className="flex items-center justify-center gap-8 text-caption">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>LGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}