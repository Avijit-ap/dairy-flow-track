
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  area_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create user roles table
CREATE TYPE public.user_role AS ENUM ('admin', 'distributor', 'agent', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create areas table
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pincode TEXT NOT NULL,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'liter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  delivery_days TEXT[] DEFAULT '{"monday","tuesday","wednesday","thursday","friday","saturday"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delivered', 'missed', 'skipped')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent assignments table
CREATE TABLE public.agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for areas
CREATE POLICY "Anyone can view areas" ON public.areas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage areas" ON public.areas
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and distributors can manage products" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'distributor'));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Agents and admins can view subscriptions" ON public.subscriptions
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'agent', 'distributor'));

-- RLS Policies for deliveries
CREATE POLICY "Users can view their own deliveries" ON public.deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = subscription_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can view and update assigned deliveries" ON public.deliveries
  FOR ALL USING (
    auth.uid() = agent_id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'distributor')
  );

-- RLS Policies for agent assignments
CREATE POLICY "Agents can view their assignments" ON public.agent_assignments
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Admins can manage assignments" ON public.agent_assignments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for inventory
CREATE POLICY "Distributors can manage their inventory" ON public.inventory
  FOR ALL USING (auth.uid() = distributor_id);

CREATE POLICY "Admins can view all inventory" ON public.inventory
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.areas (name, pincode, district) VALUES
('Sector 15', '110015', 'New Delhi'),
('Sector 12', '110012', 'New Delhi'),
('Sector 18', '110018', 'Gurgaon'),
('Sector 21', '110021', 'Gurgaon'),
('Block A', '110001', 'Central Delhi'),
('Block B', '110002', 'Central Delhi');

INSERT INTO public.products (name, type, price, unit) VALUES
('Fresh Cow Milk', 'Regular', 25.00, 'liter'),
('Organic Milk', 'Organic', 35.00, 'liter'),
('Buffalo Milk', 'Regular', 30.00, 'liter'),
('Toned Milk', 'Light', 22.00, 'liter'),
('Full Cream Milk', 'Rich', 28.00, 'liter'),
('Paneer', 'Dairy Product', 80.00, '250g'),
('Yogurt', 'Dairy Product', 15.00, '200g');
