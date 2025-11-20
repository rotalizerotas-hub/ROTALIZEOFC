'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Package2, Sparkles, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

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
        toast.success('Verifique seu email para confirmar a conta!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
      }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Branding */}
        <div className="text-center">
          <div 
            className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)'
            }}
          >
            <Package2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-gray-600">
              {isSignUp ? 'Crie sua conta para começar' : 'Acesse sua conta para gerenciar suas entregas'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Crie aqui'}
            </button>
          </div>
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