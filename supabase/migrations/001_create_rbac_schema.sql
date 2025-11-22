-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- e.g., 'users', 'orders', 'products'
  action VARCHAR(50) NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, role_id)
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX idx_permissions_resource_action ON public.permissions(resource, action);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full system access with all permissions'),
  ('admin', 'Administrative access to manage users and content'),
  ('manager', 'Management access to oversee operations'),
  ('staff', 'Staff access to handle day-to-day operations'),
  ('customer', 'Customer access to place orders and view content');

-- Insert default permissions
INSERT INTO public.permissions (name, description, resource, action) VALUES
  -- User management
  ('users.create', 'Create new users', 'users', 'create'),
  ('users.read', 'View user information', 'users', 'read'),
  ('users.update', 'Update user information', 'users', 'update'),
  ('users.delete', 'Delete users', 'users', 'delete'),
  
  -- Role management
  ('roles.create', 'Create new roles', 'roles', 'create'),
  ('roles.read', 'View roles', 'roles', 'read'),
  ('roles.update', 'Update roles', 'roles', 'update'),
  ('roles.delete', 'Delete roles', 'roles', 'delete'),
  ('roles.assign', 'Assign roles to users', 'roles', 'assign'),
  
  -- Product management
  ('products.create', 'Create new products', 'products', 'create'),
  ('products.read', 'View products', 'products', 'read'),
  ('products.update', 'Update products', 'products', 'update'),
  ('products.delete', 'Delete products', 'products', 'delete'),
  
  -- Order management
  ('orders.create', 'Create new orders', 'orders', 'create'),
  ('orders.read', 'View orders', 'orders', 'read'),
  ('orders.update', 'Update orders', 'orders', 'update'),
  ('orders.delete', 'Delete orders', 'orders', 'delete'),
  ('orders.manage', 'Manage all orders', 'orders', 'manage'),
  
  -- Analytics and reports
  ('analytics.read', 'View analytics and reports', 'analytics', 'read'),
  
  -- System settings
  ('settings.read', 'View system settings', 'settings', 'read'),
  ('settings.update', 'Update system settings', 'settings', 'update');

-- Assign permissions to roles
DO $$
DECLARE
  super_admin_id UUID;
  admin_id UUID;
  manager_id UUID;
  staff_id UUID;
  customer_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO super_admin_id FROM public.roles WHERE name = 'super_admin';
  SELECT id INTO admin_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO manager_id FROM public.roles WHERE name = 'manager';
  SELECT id INTO staff_id FROM public.roles WHERE name = 'staff';
  SELECT id INTO customer_id FROM public.roles WHERE name = 'customer';
  
  -- Super Admin gets all permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT super_admin_id, id FROM public.permissions;
  
  -- Admin permissions (all except super admin specific)
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT admin_id, id FROM public.permissions 
  WHERE name IN (
    'users.create', 'users.read', 'users.update',
    'roles.read', 'roles.assign',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'orders.create', 'orders.read', 'orders.update', 'orders.manage',
    'analytics.read',
    'settings.read', 'settings.update'
  );
  
  -- Manager permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT manager_id, id FROM public.permissions 
  WHERE name IN (
    'users.read',
    'products.read', 'products.update',
    'orders.create', 'orders.read', 'orders.update', 'orders.manage',
    'analytics.read',
    'settings.read'
  );
  
  -- Staff permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT staff_id, id FROM public.permissions 
  WHERE name IN (
    'products.read',
    'orders.create', 'orders.read', 'orders.update'
  );
  
  -- Customer permissions
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT customer_id, id FROM public.permissions 
  WHERE name IN (
    'products.read',
    'orders.create', 'orders.read'
  );
END $$;

-- Enable RLS on all tables (excluding auth.users)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Profiles policies
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Service role can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'service_role');
  
  -- Roles policies
  CREATE POLICY "Everyone can view roles" ON public.roles
    FOR SELECT USING (true);
  
  CREATE POLICY "Service role can manage roles" ON public.roles
    FOR ALL USING (auth.role() = 'service_role');
  
  -- Permissions policies
  CREATE POLICY "Everyone can view permissions" ON public.permissions
    FOR SELECT USING (true);
  
  CREATE POLICY "Service role can manage permissions" ON public.permissions
    FOR ALL USING (auth.role() = 'service_role');
  
  -- User roles policies (simplified to avoid recursion)
  CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());
  
  CREATE POLICY "Service role can access all user roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'service_role');
  
  CREATE POLICY "Authenticated users can read user roles" ON public.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');
  
  -- Role permissions policies
  CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);
  
  CREATE POLICY "Service role can manage role permissions" ON public.role_permissions
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  customer_role_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign customer role by default
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer';
  
  IF customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, customer_role_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();