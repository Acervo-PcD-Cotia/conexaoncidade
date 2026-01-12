import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Admin client for deleting data
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete in order respecting foreign keys
    const deletionSteps = [
      // Community related
      { table: "community_shares", column: "user_id" },
      { table: "community_reactions", column: "user_id" },
      { table: "community_challenge_progress", column: "user_id" },
      { table: "community_notifications", column: "user_id" },
      { table: "community_comments", column: "author_id" },
      { table: "community_posts", column: "author_id" },
      { table: "community_invites", column: "created_by" },
      { table: "community_invites", column: "used_by" },
      { table: "community_members", column: "user_id" },
      // User related
      { table: "user_permissions", column: "user_id" },
      { table: "user_roles", column: "user_id" },
      { table: "user_invites", column: "invited_by" },
      { table: "admin_notification_preferences", column: "user_id" },
      { table: "profiles", column: "id" },
    ];

    for (const step of deletionSteps) {
      try {
        const { error } = await adminClient
          .from(step.table)
          .delete()
          .eq(step.column, userId);
        
        if (error) {
          console.warn(`Warning deleting from ${step.table}:`, error.message);
        } else {
          console.log(`Deleted from ${step.table}`);
        }
      } catch (err) {
        console.warn(`Error deleting from ${step.table}:`, err);
      }
    }

    // Delete avatar from storage
    try {
      const { data: avatarFiles } = await adminClient.storage
        .from("avatars")
        .list(userId);

      if (avatarFiles && avatarFiles.length > 0) {
        const filesToDelete = avatarFiles.map((f) => `${userId}/${f.name}`);
        await adminClient.storage.from("avatars").remove(filesToDelete);
        console.log("Deleted avatar files");
      }
    } catch (err) {
      console.warn("Error deleting avatars:", err);
    }

    // Log the deletion
    try {
      await adminClient.from("audit_logs").insert({
        entity_type: "user",
        entity_id: userId,
        action: "delete_account",
        user_id: userId,
        old_data: { email: user.email, deleted_at: new Date().toISOString() },
      });
    } catch (err) {
      console.warn("Error logging deletion:", err);
    }

    // Delete the user from auth
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted user account: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
