-- Add missing fields to community_members for onboarding and profile
ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fact_check_count INTEGER DEFAULT 0;

-- Add missing fields for official posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pin_order INTEGER DEFAULT 0;

-- Create index for faster pinned posts query
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts (is_pinned DESC, pin_order ASC, created_at DESC);

-- Create function to award points for creating posts (if not exists)
CREATE OR REPLACE FUNCTION public.award_post_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add 10 points for creating a post (skip for official posts)
  IF NEW.is_official = false OR NEW.is_official IS NULL THEN
    UPDATE public.community_members
    SET points = COALESCE(points, 0) + 10
    WHERE user_id = NEW.author_id;
    
    -- Record in history
    INSERT INTO public.community_points_history (user_id, action, points, reference_id, reference_type)
    VALUES (NEW.author_id, 'create_post', 10, NEW.id, 'post');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for post creation points
DROP TRIGGER IF EXISTS on_post_created ON public.community_posts;
CREATE TRIGGER on_post_created
AFTER INSERT ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION public.award_post_points();

-- Create function to award points for comments
CREATE OR REPLACE FUNCTION public.award_comment_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add 5 points for commenting
  UPDATE public.community_members
  SET points = COALESCE(points, 0) + 5
  WHERE user_id = NEW.author_id;
  
  -- Record in history
  INSERT INTO public.community_points_history (user_id, action, points, reference_id, reference_type)
  VALUES (NEW.author_id, 'comment', 5, NEW.id, 'comment');
  
  RETURN NEW;
END;
$$;

-- Create trigger for comment points
DROP TRIGGER IF EXISTS on_comment_created ON public.community_comments;
CREATE TRIGGER on_comment_created
AFTER INSERT ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.award_comment_points();