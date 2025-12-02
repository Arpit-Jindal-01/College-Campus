-- Add gender and dating_preference to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS dating_preference text DEFAULT 'everyone';

-- Create requests table for the request-based system
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  related_interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  max_participants integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create request_members table for tracking joins
CREATE TABLE public.request_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for requests
CREATE POLICY "Anyone can view open requests"
ON public.requests FOR SELECT
USING (status = 'open' OR user_id = auth.uid());

CREATE POLICY "Users can create their own requests"
ON public.requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
ON public.requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
ON public.requests FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for request_members
CREATE POLICY "Users can view request members"
ON public.request_members FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.user_id = auth.uid())
);

CREATE POLICY "Users can join requests"
ON public.request_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Request owners can update member status"
ON public.request_members FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_id AND r.user_id = auth.uid())
);

CREATE POLICY "Users can leave requests"
ON public.request_members FOR DELETE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();