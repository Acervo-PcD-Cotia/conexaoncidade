-- Add profile_type and neighborhood to community_members
ALTER TABLE public.community_members 
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS neighborhood text;

-- Create community_locations table for map
CREATE TABLE IF NOT EXISTS public.community_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  address text,
  neighborhood text,
  lat decimal,
  lng decimal,
  is_accessible boolean DEFAULT false,
  accessibility_features text[],
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations viewable by everyone" ON public.community_locations FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert locations" ON public.community_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Create community_help_requests table for Rede do Bem
CREATE TABLE IF NOT EXISTS public.community_help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  neighborhood text,
  status text DEFAULT 'open',
  is_urgent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.community_help_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Help requests viewable by authenticated" ON public.community_help_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create help requests" ON public.community_help_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.community_help_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create community_help_responses table
CREATE TABLE IF NOT EXISTS public.community_help_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.community_help_requests ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_help_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses viewable by authenticated" ON public.community_help_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create responses" ON public.community_help_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create community_rewards table
CREATE TABLE IF NOT EXISTS public.community_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_required integer NOT NULL DEFAULT 0,
  reward_type text DEFAULT 'coupon',
  level_required text,
  coupon_code text,
  valid_until timestamptz,
  max_claims integer,
  current_claims integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards viewable by authenticated" ON public.community_rewards FOR SELECT TO authenticated USING (is_active = true);

-- Create community_reward_claims table
CREATE TABLE IF NOT EXISTS public.community_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid REFERENCES public.community_rewards ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  UNIQUE(reward_id, user_id)
);

ALTER TABLE public.community_reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims" ON public.community_reward_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can claim rewards" ON public.community_reward_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);