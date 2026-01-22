-- Add missing columns to broadcast_participants
ALTER TABLE broadcast_participants 
ADD COLUMN IF NOT EXISTS can_publish BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_subscribe BOOLEAN DEFAULT true;

-- Create table for TV video playlist items
CREATE TABLE IF NOT EXISTS broadcast_video_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES broadcast_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('upload', 'youtube', 'external')),
  youtube_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE broadcast_video_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for broadcast_video_items
CREATE POLICY "Anyone can view active video items"
ON broadcast_video_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage video items"
ON broadcast_video_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'editor')
  )
);

-- Add index for sorting
CREATE INDEX IF NOT EXISTS idx_broadcast_video_items_channel_order 
ON broadcast_video_items(channel_id, sort_order);

-- Add trigger for updated_at
CREATE TRIGGER update_broadcast_video_items_updated_at
BEFORE UPDATE ON broadcast_video_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();