import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com service role
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

    const { driverData, organizationId, currentUserId } = await req.json()

    console.log('=== CRIANDO ENTREGADOR VIA EDGE FUNCTION ===')
    console.log('Dados recebidos:', { 
      name: driverData.full_name, 
      email: driverData.email,
      organizationId,
      currentUserId 
    })

    // Verificar se o usuário atual tem permissão (é admin da organização)
    const { data: userOrg, error: userOrgError } = await supabaseAdmin
      .from('user_organizations')
      .select('role')
      .eq('user_id', currentUserId)
      .eq('organization_id', organizationId)
      .single()

    if (userOrgError || !userOrg || userOrg.role !== 'admin') {
      throw new Error('Usuário não tem permissão para criar entregadores')
    }

    // PASSO 1: Criar usuário no Auth
    console.log('PASSO 1: Criando usuário no Supabase Auth...')
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: driverData.email,
      password: driverData.password,
      email_confirm: true,
      user_metadata: {
        full_name: driverData.full_name,
        phone: driverData.phone,
        role: 'delivery_driver'
      }
    })

    if (authError || !authData.user) {
      console.error('Erro ao criar usuário no Auth:', authError)
      throw new Error(`Erro ao criar conta: ${authError?.message || 'Usuário não criado'}`)
    }

    const newUserId = authData.user.id
    console.log('Usuário criado no Auth:', newUserId)

    // PASSO 2: Criar perfil
    console.log('PASSO 2: Criando perfil do usuário...')
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        email: driverData.email,
        full_name: driverData.full_name,
        phone: driverData.phone
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Limpar usuário criado
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw new Error(`Erro ao criar perfil: ${profileError.message}`)
    }

    console.log('Perfil criado com sucesso')

    // PASSO 3: Criar registro de entregador
    console.log('PASSO 3: Criando registro de entregador...')
    
    const { error: driverError } = await supabaseAdmin
      .from('delivery_drivers')
      .insert({
        user_id: newUserId,
        organization_id: organizationId,
        is_online: false,
        total_today: 0
      })

    if (driverError) {
      console.error('Erro ao criar registro de entregador:', driverError)
      // Limpar dados criados
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw new Error(`Erro ao criar registro de entregador: ${driverError.message}`)
    }

    console.log('Registro de entregador criado com sucesso')

    // PASSO 4: Vincular à organização
    console.log('PASSO 4: Vinculando entregador à organização...')
    
    const { error: orgLinkError } = await supabaseAdmin
      .from('user_organizations')
      .insert({
        user_id: newUserId,
        organization_id: organizationId,
        role: 'delivery_driver'
      })

    if (orgLinkError) {
      console.error('Erro ao vincular entregador à organização:', orgLinkError)
      // Limpar dados criados
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw new Error(`Erro ao vincular à organização: ${orgLinkError.message}`)
    }

    console.log('Entregador vinculado à organização com sucesso')
    console.log('=== ENTREGADOR CRIADO COM SUCESSO ===')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Entregador criado com sucesso',
        userId: newUserId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('=== ERRO NA CRIAÇÃO DO ENTREGADOR ===')
    console.error('Erro completo:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido ao criar entregador' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})