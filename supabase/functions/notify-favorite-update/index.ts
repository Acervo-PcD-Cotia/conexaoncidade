import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  location_id: string;
  event_type: "new_review" | "location_update";
  review_data?: { 
    rating: number; 
    comment?: string; 
    reviewer_name?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notifications");
      return new Response(JSON.stringify({ skipped: true, reason: "RESEND_API_KEY not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { location_id, event_type, review_data }: NotificationPayload = await req.json();

    console.log(`Processing notification for location ${location_id}, event: ${event_type}`);

    // Get location info
    const { data: location } = await supabase
      .from("community_locations")
      .select("name, neighborhood")
      .eq("id", location_id)
      .single();

    if (!location) {
      throw new Error("Location not found");
    }

    // Get users who favorited this location
    const { data: favorites } = await supabase
      .from("community_location_favorites")
      .select("user_id")
      .eq("location_id", location_id);

    if (!favorites || favorites.length === 0) {
      console.log("No users have favorited this location");
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${favorites.length} users to notify`);

    // Get user profiles with email preferences
    const userIds = favorites.map(f => f.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email_notifications")
      .in("id", userIds);

    // Get emails from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]));

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles || []) {
      // Check if user has notifications enabled
      const emailPrefs = profile.email_notifications as { favorite_updates?: boolean } | null;
      if (emailPrefs?.favorite_updates === false) {
        console.log(`User ${profile.id} has disabled favorite update notifications`);
        continue;
      }

      const email = emailMap.get(profile.id);
      if (!email) {
        console.log(`No email found for user ${profile.id}`);
        continue;
      }

      try {
        const subject = event_type === "new_review" 
          ? `⭐ Nova avaliação em ${location.name}`
          : `📍 Atualização em ${location.name}`;

        const ratingStars = review_data?.rating 
          ? "★".repeat(review_data.rating) + "☆".repeat(5 - review_data.rating)
          : "";

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; border-radius: 12px 12px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; }
              .rating { font-size: 24px; color: #fbbf24; }
              .review-box { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ec4899; }
              .cta { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin:0">Conexão na Cidade</h1>
                <p style="margin:8px 0 0 0;opacity:0.9">Comunidade</p>
              </div>
              <div class="content">
                <p>Olá${profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</p>
                
                <p>Um local que você salvou nos favoritos recebeu uma nova avaliação:</p>
                
                <h2 style="color:#ec4899">${location.name}</h2>
                ${location.neighborhood ? `<p style="color:#6b7280">${location.neighborhood}</p>` : ''}
                
                ${event_type === "new_review" && review_data ? `
                  <div class="review-box">
                    <div class="rating">${ratingStars}</div>
                    ${review_data.comment ? `<p style="font-style:italic">"${review_data.comment}"</p>` : ''}
                    ${review_data.reviewer_name ? `<p style="color:#6b7280;font-size:14px">— ${review_data.reviewer_name}</p>` : ''}
                  </div>
                ` : ''}
                
                <a href="https://conexaonacidade.lovable.app/comunidade/mapa" class="cta">Ver no Guia</a>
              </div>
              <div class="footer">
                <p>Você está recebendo este email porque favoritou este local.</p>
                <p>Para desativar notificações, acesse as configurações do seu perfil.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: "Conexão na Cidade <noreply@resend.dev>",
          to: [email],
          subject,
          html: htmlContent,
        });

        sentCount++;
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error(`Error sending email to ${email}:`, emailError);
        errors.push(`${email}: ${emailError}`);
      }
    }

    return new Response(JSON.stringify({ 
      sent: sentCount, 
      total: favorites.length,
      errors: errors.length > 0 ? errors : undefined 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-favorite-update:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
