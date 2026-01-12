-- Remove old constraint
ALTER TABLE public.community_members 
DROP CONSTRAINT IF EXISTS community_members_access_method_check;

-- Create new constraint with 'quiz' included
ALTER TABLE public.community_members 
ADD CONSTRAINT community_members_access_method_check 
CHECK (access_method = ANY (ARRAY['invite', 'challenge', 'quiz']));