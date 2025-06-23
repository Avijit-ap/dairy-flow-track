
-- Create a function to make a user admin (to be run after they sign up)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Delete existing role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');
END;
$$;

-- Add a column to profiles to track selected agent for customers
ALTER TABLE public.profiles ADD COLUMN assigned_agent_id UUID REFERENCES auth.users(id);

-- Update RLS policies to allow admins to create users with specific roles
CREATE POLICY "Admins can insert any role" ON public.user_roles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Allow admins to view and manage all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert all profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete all profiles" ON public.profiles
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');
