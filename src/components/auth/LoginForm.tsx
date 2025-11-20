'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  Package2, 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  Globe
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Moderno com Gradientes Animados */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-modern"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-modern" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-modern" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Logo e Branding Ultra-Moderno */}
          <div className="text-center mb-12 animate-fade-in-modern">
            <div className="relative mb-8">
              <div 
                className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl hover-lift hover-glow"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
                  boxShadow: '0 20px 40px rgba(30, 64, 175, 0.3)'
                }}
              >
                <Package2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse-modern">
                <Sparkles className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            
            <h1 className="text-display mb-4">
              RotaLize
            </h1>
            
            <p className="text-body-lg mb-6 max-w-sm mx-auto">
              Plataforma inteligente para gestão de entregas e logística empresarial
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
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Confiável</span>
              </div>
            </div>
          </div>

          {/* Card de Login Ultra-Moderno */}
          <div className="card-modern p-8 animate-scale-in-modern">
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
              {/* Campo Email Moderno */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email corporativo
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="seu@empresa.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Senha Moderno */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Senha de acesso
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botão Principal Ultra-Moderno */}
              <Button
                type="submit"
                className="w-full py-4 text-base font-semibold rounded-2xl group"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

          {/* Footer Moderno */}
          <div className="mt-12 text-center space-y-6 animate-fade-in-modern">
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
    </div>
  )
}