-- Add profile photos array and prompts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prompt_good_at text,
ADD COLUMN IF NOT EXISTS prompt_care_about text,
ADD COLUMN IF NOT EXISTS prompt_looking_for text,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_until timestamp with time zone;

-- Insert admin role for the specific email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'srijan25100@iiitnr.edu.in'
ON CONFLICT (user_id, role) DO NOTHING;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Admin policies for profiles table
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any profile"
ON public.profiles
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Admin policies for requests table
CREATE POLICY "Admins can update any request"
ON public.requests
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any request"
ON public.requests
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Admin policies for reports table
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Admin policies for blocks table
CREATE POLICY "Admins can view all blocks"
ON public.blocks
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admin policy for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));