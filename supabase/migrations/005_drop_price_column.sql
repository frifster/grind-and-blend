-- Drop the obsolete price column from menu_items
ALTER TABLE public.menu_items
  DROP COLUMN IF EXISTS price;
