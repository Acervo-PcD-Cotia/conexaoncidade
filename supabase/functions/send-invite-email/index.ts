import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
  siteUrl?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  editor_chief: "Editor-Chefe",
  editor: "Editor",
  reporter: "Repórter",
  columnist: "Colunista",
  collaborator: "Colaborador",
  moderator: "Moderador",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, password, role, siteUrl }: InviteEmailRequest = await req.json();

    if (!email || !fullName || !password) {
      throw new Error("Campos obrigatórios: email, fullName, password");
    }

    const loginUrl = siteUrl || Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://seu-site.com";
    const roleLabel = roleLabels[role] || role;

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Conexão na Cidade</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Bem-vindo à equipe!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                Olá <strong>${fullName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                Você foi convidado para fazer parte da equipe do <strong>Conexão na Cidade</strong> como <strong>${roleLabel}</strong>.
              </p>
              
              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                      Suas credenciais de acesso
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #64748b; font-size: 14px;">Email:</span>
                          <br>
                          <strong style="color: #1e293b; font-size: 16px;">${email}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px dashed #e2e8f0;">
                          <span style="color: #64748b; font-size: 14px;">Senha temporária:</span>
                          <br>
                          <code style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 16px; font-weight: 600;">${password}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}/auth" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                      Acessar o Sistema →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 14px; color: #991b1b;">
                      ⚠️ <strong>Importante:</strong> Por segurança, altere sua senha no primeiro acesso.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">
                Este email foi enviado automaticamente pelo sistema.<br>
                © ${new Date().getFullYear()} Conexão na Cidade. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Conexão na Cidade <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Você foi convidado para o Conexão na Cidade!",
      html: emailHtml,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      throw new Error(error.message);
    }

    console.log(`Email de convite enviado para ${email}`, data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro na edge function send-invite-email:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
