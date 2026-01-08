import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação do admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Cliente com token do usuário para verificar permissões
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verificar se o usuário é admin
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      throw new Error("Não autorizado");
    }

    // Verificar role de admin
    const { data: roleData, error: roleError } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      throw new Error("Apenas administradores podem criar usuários");
    }

    // Parse do body
    const { email, password, fullName, role, permissions, sendInvite } =
      await req.json();

    if (!email || !password || !fullName || !role) {
      throw new Error("Campos obrigatórios: email, password, fullName, role");
    }

    // Cliente admin para criar usuário
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Criar usuário
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError) {
      console.error("Erro ao criar usuário:", createError);
      throw new Error(createError.message);
    }

    const newUserId = newUser.user.id;

    // Inserir role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("user_id", newUserId);

    if (roleInsertError) {
      // Se não existir, inserir
      await supabaseAdmin.from("user_roles").insert({
        user_id: newUserId,
        role,
      });
    }

    // Inserir permissões se fornecidas
    if (permissions && permissions.length > 0) {
      const permissionRows = permissions.map((permission: string) => ({
        user_id: newUserId,
        permission,
      }));

      await supabaseAdmin.from("user_permissions").insert(permissionRows);
    }

    // Atualizar profile com nome
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", newUserId);

    console.log(`Usuário ${email} criado com sucesso por ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUserId,
          email,
          fullName,
          role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro na edge function create-user:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
