-- Remove existing admin roles
DELETE FROM public.user_roles WHERE role = 'admin';

-- Create function to auto-assign admin on signup
CREATE OR REPLACE FUNCTION public.check_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant admin role if email matches
  IF NEW.email = 'ritesh25100@iiitnr.edu.in' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-admin assignment
DROP TRIGGER IF EXISTS check_admin_trigger ON auth.users;
CREATE TRIGGER check_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_admin_on_signup();