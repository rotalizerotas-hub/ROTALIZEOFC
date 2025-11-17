import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const { userId, newPassword } = await req.json()

    console.log('=== ALTERANDO SENHA DO ENTREGADOR ===')
    console.log('User ID:', userId)

    // Validations
    if (!userId) {
      throw new Error('ID do usuário é obrigatório')
    }

    if (!newPassword) {
      throw new Error('Nova senha é obrigatória')
    }

    if (newPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres')
    }

    if (newPassword.includes(' ')) {
      throw new Error('Senha não pode conter espaços')
    }

    // Update password using Admin API
    console.log('Alterando senha do usuário...')
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      console.error('Erro ao alterar senha:', error)
      throw new Error(`Erro ao alterar senha: ${error.message}`)
    }

    console.log('Senha alterada com sucesso para usuário:', userId)
    console.log('=== SENHA ALTERADA COM SUCESSO ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha alterada com sucesso' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('=== ERRO AO ALTERAR SENHA ===')
    console.error('Erro completo:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido ao alterar senha' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})