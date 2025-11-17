import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
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

    const { userId, newPassword } = await req.json()

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

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      throw new Error(`Erro ao alterar senha: ${error.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha alterada com sucesso' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro ao alterar senha' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})