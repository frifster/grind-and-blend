-- Create ingredients table
CREATE TABLE public.ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_per_unit DECIMAL(10, 4) NOT NULL, -- Cost per unit in dollars
  unit VARCHAR(20) NOT NULL, -- e.g., 'g', 'ml', 'pieces', 'cups'
  category VARCHAR(50), -- e.g., 'dairy', 'meat', 'vegetables', 'spices'
  supplier VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- e.g., 'sandwich', 'drink', 'pastry'
  selling_price DECIMAL(10, 2), -- Final selling price
  estimated_cost DECIMAL(10, 4), -- Total estimated cost based on ingredients
  profit_margin DECIMAL(5, 2), -- Profit margin percentage
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_ingredients junction table (for recipe composition)
CREATE TABLE public.product_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 4) NOT NULL, -- Quantity of ingredient used
  unit VARCHAR(20) NOT NULL, -- Unit of measurement
  cost_contribution DECIMAL(10, 4), -- Cost contribution to the product
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_category ON public.ingredients(category);
CREATE INDEX idx_ingredients_active ON public.ingredients(is_active);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_product_ingredients_product_id ON public.product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_ingredient_id ON public.product_ingredients(ingredient_id);

-- Insert sample ingredients data
INSERT INTO public.ingredients (name, description, cost_per_unit, unit, category, supplier) VALUES
  -- Dairy
  ('Whole Milk', 'Fresh whole milk', 0.02, 'ml', 'dairy', 'Local Dairy Co'),
  ('Cheddar Cheese', 'Aged cheddar cheese', 0.15, 'g', 'dairy', 'Cheese Factory'),
  ('Butter', 'Unsalted butter', 0.12, 'g', 'dairy', 'Local Dairy Co'),
  ('Heavy Cream', 'Heavy whipping cream', 0.03, 'ml', 'dairy', 'Local Dairy Co'),
  
  -- Proteins  
  ('Ham', 'Sliced deli ham', 0.45, 'g', 'protein', 'Meat Suppliers Inc'),
  ('Bacon', 'Crispy bacon strips', 0.55, 'g', 'protein', 'Meat Suppliers Inc'),
  ('Chicken Breast', 'Grilled chicken breast', 0.32, 'g', 'protein', 'Poultry Farm'),
  ('Eggs', 'Large fresh eggs', 0.25, 'piece', 'protein', 'Local Farm'),
  
  -- Coffee & Beverages
  ('Coffee Beans', 'Arabica coffee beans', 0.08, 'g', 'beverage', 'Coffee Roasters'),
  ('Espresso', 'Double shot espresso', 1.50, 'shot', 'beverage', 'Coffee Roasters'),
  ('Dark Chocolate', 'Premium dark chocolate', 0.18, 'g', 'beverage', 'Chocolate Co'),
  ('White Chocolate', 'Premium white chocolate', 0.20, 'g', 'beverage', 'Chocolate Co'),
  
  -- Bread & Grains
  ('Bread Slice', 'Artisan bread slice', 0.35, 'piece', 'grain', 'Local Bakery'),
  ('Bagel', 'Fresh baked bagel', 0.85, 'piece', 'grain', 'Local Bakery'),
  ('English Muffin', 'Toasted english muffin', 0.65, 'piece', 'grain', 'Local Bakery'),
  
  -- Vegetables
  ('Tomato', 'Fresh tomato slices', 0.08, 'g', 'vegetable', 'Produce Co'),
  ('Lettuce', 'Fresh lettuce leaves', 0.05, 'g', 'vegetable', 'Produce Co'),
  ('Onion', 'Yellow onion', 0.03, 'g', 'vegetable', 'Produce Co'),
  
  -- Condiments & Seasonings
  ('Mayonnaise', 'Creamy mayonnaise', 0.04, 'g', 'condiment', 'Sauce Co'),
  ('Mustard', 'Dijon mustard', 0.06, 'g', 'condiment', 'Sauce Co'),
  ('Salt', 'Table salt', 0.002, 'g', 'seasoning', 'Spice Co'),
  ('Black Pepper', 'Ground black pepper', 0.12, 'g', 'seasoning', 'Spice Co');

-- Insert sample products data
INSERT INTO public.products (name, description, category, selling_price, estimated_cost, profit_margin) VALUES
  -- Sandwiches
  ('Ham & Egg Sandwich', 'Classic ham and egg sandwich on artisan bread', 'sandwich', 8.50, 3.25, 61.76),
  ('Bacon & Egg Sandwich', 'Crispy bacon and egg sandwich', 'sandwich', 9.00, 3.85, 57.22),
  ('Club Sandwich', 'Triple decker with chicken, bacon, lettuce, tomato', 'sandwich', 12.50, 5.20, 58.40),
  
  -- Drinks  
  ('Dark Chocolate Frappe', 'Rich dark chocolate blended drink', 'drink', 6.50, 2.80, 56.92),
  ('Mocha Frappe', 'Coffee and chocolate blended drink', 'drink', 6.75, 3.10, 54.07),
  ('White Chocolate Frappe', 'Smooth white chocolate frappe', 'drink', 6.75, 3.20, 52.59),
  
  -- Coffee
  ('Americano', 'Double espresso with hot water', 'coffee', 4.50, 1.85, 58.89),
  ('Cappuccino', 'Espresso with steamed milk foam', 'coffee', 5.25, 2.15, 59.05),
  ('Latte', 'Espresso with steamed milk', 'coffee', 5.50, 2.25, 59.09);

-- Insert sample product-ingredient relationships
-- Ham & Egg Sandwich
INSERT INTO public.product_ingredients (product_id, ingredient_id, quantity, unit, cost_contribution) VALUES
  ((SELECT id FROM products WHERE name = 'Ham & Egg Sandwich'), 
   (SELECT id FROM ingredients WHERE name = 'Bread Slice'), 2, 'piece', 0.70),
  ((SELECT id FROM products WHERE name = 'Ham & Egg Sandwich'), 
   (SELECT id FROM ingredients WHERE name = 'Ham'), 60, 'g', 2.70),
  ((SELECT id FROM products WHERE name = 'Ham & Egg Sandwich'), 
   (SELECT id FROM ingredients WHERE name = 'Eggs'), 1, 'piece', 0.25),
  ((SELECT id FROM products WHERE name = 'Ham & Egg Sandwich'), 
   (SELECT id FROM ingredients WHERE name = 'Butter'), 10, 'g', 1.20),
  ((SELECT id FROM products WHERE name = 'Ham & Egg Sandwich'), 
   (SELECT id FROM ingredients WHERE name = 'Salt'), 1, 'g', 0.002);

-- Dark Chocolate Frappe
INSERT INTO public.product_ingredients (product_id, ingredient_id, quantity, unit, cost_contribution) VALUES
  ((SELECT id FROM products WHERE name = 'Dark Chocolate Frappe'), 
   (SELECT id FROM ingredients WHERE name = 'Whole Milk'), 200, 'ml', 4.00),
  ((SELECT id FROM products WHERE name = 'Dark Chocolate Frappe'), 
   (SELECT id FROM ingredients WHERE name = 'Dark Chocolate'), 30, 'g', 5.40),
  ((SELECT id FROM products WHERE name = 'Dark Chocolate Frappe'), 
   (SELECT id FROM ingredients WHERE name = 'Heavy Cream'), 50, 'ml', 1.50),
  ((SELECT id FROM products WHERE name = 'Dark Chocolate Frappe'), 
   (SELECT id FROM ingredients WHERE name = 'Espresso'), 1, 'shot', 1.50);

-- Add triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();