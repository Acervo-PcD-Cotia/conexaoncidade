-- Create notifications table for community
CREATE TABLE IF NOT EXISTS public.community_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'new_post', 'mention', 'reply', 'like'
  title TEXT NOT NULL,
  body TEXT,
  reference_id UUID, -- post_id or comment_id
  reference_type TEXT, -- 'post' or 'comment'
  actor_id UUID, -- who triggered the notification
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.community_notifications FOR SELECT
USING (auth.uid() = user_id);

-- System/triggers can insert notifications
CREATE POLICY "Service role can insert notifications"
ON public.community_notifications FOR INSERT
WITH CHECK (true);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.community_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.community_notifications FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;

-- Create index for faster queries
CREATE INDEX idx_community_notifications_user_id ON public.community_notifications(user_id);
CREATE INDEX idx_community_notifications_created_at ON public.community_notifications(created_at DESC);

-- Function to create notification on new post (for followers/all members)
CREATE OR REPLACE FUNCTION notify_community_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all active community members except the author
  INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
  SELECT 
    cm.user_id,
    'new_post',
    'Nova publicação na comunidade',
    LEFT(NEW.content, 100),
    NEW.id,
    'post',
    NEW.author_id
  FROM public.community_members cm
  WHERE cm.user_id != NEW.author_id
    AND cm.access_granted_at IS NOT NULL
    AND cm.is_suspended = false
  LIMIT 100; -- Limit to avoid massive inserts
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new posts
DROP TRIGGER IF EXISTS on_community_post_created ON public.community_posts;
CREATE TRIGGER on_community_post_created
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_new_post();

-- Function to create notification on mention
CREATE OR REPLACE FUNCTION notify_community_mention()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id UUID;
  mentioned_username TEXT;
  mention_match TEXT;
BEGIN
  -- Extract @mentions from content using regex
  FOR mention_match IN
    SELECT (regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g'))[1]
  LOOP
    -- Find user by email prefix or full_name match
    SELECT p.id INTO mentioned_user_id
    FROM public.profiles p
    WHERE LOWER(SPLIT_PART(p.full_name, ' ', 1)) = LOWER(mention_match)
       OR p.id::text LIKE mention_match || '%'
    LIMIT 1;
    
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
      INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
      VALUES (
        mentioned_user_id,
        'mention',
        'Você foi mencionado',
        LEFT(NEW.content, 100),
        COALESCE(NEW.post_id, NEW.id),
        CASE WHEN NEW.post_id IS NULL THEN 'post' ELSE 'comment' END,
        NEW.author_id
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mentions in posts
DROP TRIGGER IF EXISTS on_community_post_mention ON public.community_posts;
CREATE TRIGGER on_community_post_mention
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_mention();

-- Trigger for mentions in comments
DROP TRIGGER IF EXISTS on_community_comment_mention ON public.community_comments;
CREATE TRIGGER on_community_comment_mention
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_mention();

-- Function to notify on reply to comment
CREATE OR REPLACE FUNCTION notify_community_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_author_id UUID;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO parent_author_id
    FROM public.community_comments
    WHERE id = NEW.parent_id;
    
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id THEN
      INSERT INTO public.community_notifications (user_id, type, title, body, reference_id, reference_type, actor_id)
      VALUES (
        parent_author_id,
        'reply',
        'Resposta ao seu comentário',
        LEFT(NEW.content, 100),
        NEW.id,
        'comment',
        NEW.author_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for replies
DROP TRIGGER IF EXISTS on_community_comment_reply ON public.community_comments;
CREATE TRIGGER on_community_comment_reply
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_community_reply();