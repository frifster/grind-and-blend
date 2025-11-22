-- Migration: Add RLS policies for admin role on categories and menu_items
DO $$
BEGIN
  -- Admin can manage categories (INSERT, UPDATE, DELETE)
  CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin'));

  -- Admin can manage menu_items (INSERT, UPDATE, DELETE)
  CREATE POLICY "Admins can manage menu_items" ON public.menu_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
