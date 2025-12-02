-- Create trigger to auto-grant admin role on signup for the specific email
CREATE OR REPLACE TRIGGER on_auth_user_created_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_on_signup();