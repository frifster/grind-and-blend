-- Add display_order column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on creation time
UPDATE public.categories 
SET display_order = subquery.rn 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
  FROM public.categories
) as subquery 
WHERE categories.id = subquery.id;
