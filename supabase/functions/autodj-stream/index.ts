import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaylistItem {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  duration_seconds: number | null;
  sort_order: number;
  cover_image_url: string | null;
  genre: string | null;
}

interface AutoDJSettings {
  is_enabled: boolean;
  shuffle_mode: boolean;
  crossfade_seconds: number;
  fallback_enabled: boolean;
  volume_level: number;
}

interface AutoDJState {
  currentTrack: PlaylistItem | null;
  nextTrack: PlaylistItem | null;
  position: number;
  isPlaying: boolean;
  settings: AutoDJSettings | null;
  playlist: PlaylistItem[];
  currentIndex: number;
}

// In-memory state per channel (in production, use Redis or similar)
const channelStates = new Map<string, { startedAt: number; currentIndex: number; shuffledOrder: number[] }>();

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { channelId, action } = await req.json();

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "channelId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`AutoDJ request: channel=${channelId}, action=${action}`);

    // Fetch Auto DJ settings
    const { data: settings, error: settingsError } = await supabase
      .from("broadcast_autodj_settings")
      .select("*")
      .eq("channel_id", channelId)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    // If Auto DJ is disabled, return early
    if (!settings?.is_enabled) {
      return new Response(
        JSON.stringify({
          isPlaying: false,
          currentTrack: null,
          nextTrack: null,
          position: 0,
          message: "Auto DJ is disabled for this channel",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if there's a live broadcast on this channel
    const { data: liveBroadcast } = await supabase
      .from("broadcasts")
      .select("id")
      .eq("channel_id", channelId)
      .eq("status", "live")
      .single();

    if (liveBroadcast && settings.fallback_enabled) {
      return new Response(
        JSON.stringify({
          isPlaying: false,
          currentTrack: null,
          nextTrack: null,
          position: 0,
          message: "Live broadcast in progress - Auto DJ paused",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch playlist items
    const { data: playlist, error: playlistError } = await supabase
      .from("broadcast_playlist_items")
      .select("*")
      .eq("channel_id", channelId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (playlistError) {
      console.error("Error fetching playlist:", playlistError);
      throw playlistError;
    }

    if (!playlist || playlist.length === 0) {
      return new Response(
        JSON.stringify({
          isPlaying: false,
          currentTrack: null,
          nextTrack: null,
          position: 0,
          message: "No tracks in playlist",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or initialize channel state
    let channelState = channelStates.get(channelId);
    const now = Date.now();

    if (!channelState) {
      // Initialize state
      let shuffledOrder = playlist.map((_, i) => i);
      if (settings.shuffle_mode) {
        // Fisher-Yates shuffle
        for (let i = shuffledOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
        }
      }
      channelState = {
        startedAt: now,
        currentIndex: 0,
        shuffledOrder,
      };
      channelStates.set(channelId, channelState);
    }

    // Handle actions
    if (action === "next") {
      channelState.currentIndex = (channelState.currentIndex + 1) % playlist.length;
      channelState.startedAt = now;
      channelStates.set(channelId, channelState);
    } else if (action === "previous") {
      channelState.currentIndex = (channelState.currentIndex - 1 + playlist.length) % playlist.length;
      channelState.startedAt = now;
      channelStates.set(channelId, channelState);
    } else if (action === "shuffle") {
      // Re-shuffle
      const shuffledOrder = playlist.map((_, i) => i);
      for (let i = shuffledOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
      }
      channelState.shuffledOrder = shuffledOrder;
      channelState.currentIndex = 0;
      channelState.startedAt = now;
      channelStates.set(channelId, channelState);
    }

    // Calculate current track based on elapsed time
    const elapsed = (now - channelState.startedAt) / 1000; // seconds
    let totalDuration = 0;
    let currentTrackIndex = channelState.currentIndex;
    let trackPosition = elapsed;

    // Find current track based on elapsed time
    const orderedPlaylist = settings.shuffle_mode
      ? channelState.shuffledOrder.map(i => playlist[i])
      : playlist;

    for (let i = currentTrackIndex; i < orderedPlaylist.length; i++) {
      const trackDuration = orderedPlaylist[i].duration_seconds || 180; // default 3 min
      if (trackPosition < trackDuration) {
        currentTrackIndex = i;
        break;
      }
      trackPosition -= trackDuration;
      currentTrackIndex = (i + 1) % orderedPlaylist.length;
      
      // Loop back to start if we've gone through all tracks
      if (i === orderedPlaylist.length - 1) {
        channelState.currentIndex = 0;
        channelState.startedAt = now;
        channelStates.set(channelId, channelState);
        currentTrackIndex = 0;
        trackPosition = 0;
      }
    }

    const currentTrack = orderedPlaylist[currentTrackIndex];
    const nextTrackIndex = (currentTrackIndex + 1) % orderedPlaylist.length;
    const nextTrack = orderedPlaylist[nextTrackIndex];

    // Update played count
    if (action === "get-current" || action === "next") {
      await supabase
        .from("broadcast_playlist_items")
        .update({ 
          played_count: (currentTrack.played_count || 0) + 1,
          last_played_at: new Date().toISOString()
        })
        .eq("id", currentTrack.id);
    }

    const response: AutoDJState = {
      currentTrack: {
        id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        audio_url: currentTrack.audio_url,
        duration_seconds: currentTrack.duration_seconds,
        sort_order: currentTrack.sort_order,
        cover_image_url: currentTrack.cover_image_url,
        genre: currentTrack.genre,
      },
      nextTrack: nextTrack ? {
        id: nextTrack.id,
        title: nextTrack.title,
        artist: nextTrack.artist,
        audio_url: nextTrack.audio_url,
        duration_seconds: nextTrack.duration_seconds,
        sort_order: nextTrack.sort_order,
        cover_image_url: nextTrack.cover_image_url,
        genre: nextTrack.genre,
      } : null,
      position: Math.floor(trackPosition),
      isPlaying: true,
      settings: {
        is_enabled: settings.is_enabled,
        shuffle_mode: settings.shuffle_mode,
        crossfade_seconds: settings.crossfade_seconds,
        fallback_enabled: settings.fallback_enabled,
        volume_level: settings.volume_level,
      },
      playlist: orderedPlaylist,
      currentIndex: currentTrackIndex,
    };

    console.log(`AutoDJ response: track=${currentTrack.title}, position=${Math.floor(trackPosition)}s`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AutoDJ error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
