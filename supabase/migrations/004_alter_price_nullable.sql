-- Make price column nullable for menu_items
ALTER TABLE public.menu_items
  ALTER COLUMN price DROP NOT NULL;
