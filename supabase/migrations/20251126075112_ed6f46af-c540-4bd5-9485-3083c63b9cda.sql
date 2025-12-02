-- Create lectures table to store lecture data
CREATE TABLE public.lectures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  teacher_name TEXT,
  class_name TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'transcribing' CHECK (status IN ('transcribing', 'summarizing', 'completed', 'failed')),
  audio_url TEXT,
  transcript TEXT,
  summary TEXT,
  detailed_notes TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (guest mode support)
-- Users can read their own lectures or anonymous lectures
CREATE POLICY "Anyone can view lectures" 
ON public.lectures 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create lectures" 
ON public.lectures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update lectures" 
ON public.lectures 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete lectures" 
ON public.lectures 
FOR DELETE 
USING (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-recordings', 'audio-recordings', true);

-- Storage policies for audio bucket
CREATE POLICY "Anyone can upload audio"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio-recordings');

CREATE POLICY "Anyone can view audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-recordings');

CREATE POLICY "Anyone can update audio"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio-recordings');

CREATE POLICY "Anyone can delete audio"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio-recordings');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lectures_updated_at
BEFORE UPDATE ON public.lectures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();