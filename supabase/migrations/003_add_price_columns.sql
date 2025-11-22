-- Add price_small and price_large columns to menu_items table
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS price_small DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_large DECIMAL(10,2);
