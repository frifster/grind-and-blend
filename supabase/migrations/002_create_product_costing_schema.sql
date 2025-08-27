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

-- Insert ingredients data from Excel file
INSERT INTO public.ingredients (name, description, cost_per_unit, unit, category, supplier) VALUES
  ('Espresso', 'Chanie''s Espresso', 0.769, 'g', 'beverage', 'Chanie''s'),\n  ('Cold brew', 'Easy Cold brew', 0.176, 'g', 'beverage', 'Coffee de Grail'),\n  ('Yogurt powder', 'Top Creamery Yogurt powder', 0.308, 'g', 'dairy', 'Coffee de Grail'),\n  ('Frappe base powder', 'Top Creamery Frappe base powder', 0.31, 'g', 'flavor', 'Coffee de Grail'),\n  ('Mocha powder', 'Top Creamery Mocha powder', 0.34, 'g', 'beverage', 'Coffee de Grail'),\n  ('Salted caramel powder', 'Top Creamery Salted caramel powder', 0.27, 'g', 'flavor', 'Coffee de Grail'),\n  ('Dark chocolate powder', 'Top Creamery Dark chocolate powder', 0.44, 'g', 'flavor', 'Coffee de Grail'),\n  ('Matcha latte powder', 'Catcher Matcha latte powder', 0.79, 'g', 'beverage', 'Coffee de Grail'),\n  ('Salted caramel sauce', 'Catcher Salted caramel sauce', 0.415, 'g', 'flavor', 'Coffee de Grail'),\n  ('White chocolate sauce', 'Catcher White chocolate sauce', 0.415, 'g', 'flavor', 'Coffee de Grail'),\n  ('Chocolate sauce', 'Catcher Chocolate sauce', 0.415, 'g', 'flavor', 'Coffee de Grail'),\n  ('Matcha sauce', 'Catcher Matcha sauce', 0.69, 'g', 'beverage', 'Coffee de Grail'),\n  ('Full cream milk - Milklab', 'Milklab Full cream milk - Milklab', 0.095, 'ml', 'dairy', 'Coffee de Grail'),\n  ('Full cream milk - Jersey', 'Jersey Full cream milk - Jersey', 0.075, 'ml', 'dairy', 'Coffee de Grail'),\n  ('Salted caramel syrup', 'Easy Salted caramel syrup', 0.165, 'ml', 'flavor', 'Coffee de Grail'),\n  ('Creamy vanilla syrup', 'Top Creamery Creamy vanilla syrup', 0.3266666667, 'ml', 'dairy', 'Coffee de Grail'),\n  ('French vanilla syrup', 'Top Creamery French vanilla syrup', 0.3266666667, 'ml', 'flavor', 'Coffee de Grail'),\n  ('Condensed milk', 'Jersey Condensed milk', 0.135, 'ml', 'dairy', 'Coffee de Grail'),\n  ('Blueberry jam', 'Doking Blueberry jam', 0.1166666667, 'g', 'other', 'Coffee de Grail'),\n  ('Strawberry jam', 'Doking Strawberry jam', 0.1166666667, 'g', 'other', 'Coffee de Grail'),\n  ('Green apple syrup', 'Easy Green apple syrup', 0.132, 'ml', 'condiment', 'Coffee de Grail'),\n  ('Strawberry syrup', 'Easy Strawberry syrup', 0.132, 'ml', 'condiment', 'Coffee de Grail'),\n  ('Blueberry syrup', 'Easy Blueberry syrup', 0.132, 'ml', 'condiment', 'Coffee de Grail'),\n  ('Soda', 'Sprite Soda', 0.046, 'g', 'other', 'Robinsons'),\n  ('Coffee jelly', 'Easy Coffee jelly', 0.1673913043, 'g', 'beverage', 'Coffee de Grail'),\n  ('Strawberry popping boba', 'Doking Strawberry popping boba', 0.1633333333, 'g', 'other', 'Coffee de Grail'),\n  ('Green apple popping boba', 'HYX Green apple popping boba', 0.1653846154, 'g', 'other', 'Shopee'),\n  ('Blueberry popping boba', 'Double Happiness Blueberry popping boba', 0.2075, 'g', 'other', 'Shopee'),\n  ('Vivo - Whipped cream', 'Vivo Vivo - Whipped cream', 0.189, 'ml', 'dairy', 'Coffee de Grail'),\n  ('Mosa charger', 'Mosa Mosa charger', 20.0, 'g', 'other', 'Shopee'),\n  ('Lemon Flavor', 'Easy Lemon Flavor', 0.132, 'g', 'other', 'Coffee de Grail'),\n  ('Syrup - Sweetener', 'Easy Syrup - Sweetener', 0.06, 'ml', 'condiment', 'Coffee de Grail'),\n  ('Yakult', 'Yakult Yakult', 10.0, 'g', 'other', 'Robinsons'),\n  ('Lemons', 'Lemons', 16.66666667, 'g', 'other', 'Market'),\n  ('Java Chip powder', 'Top Creamery Java Chip powder', 0.66, 'g', 'flavor', 'Coffee de Grail'),\n  ('Crushed Oreo', 'Oreo Crushed Oreo', 0.6088235294, 'g', 'other', 'Coffee de Grail'),\n  ('Biscoff sauce', 'Biscoff Biscoff sauce', 1.0875, 'g', 'condiment', 'Coffee de Grail'),\n  ('Biscoff crumbs', 'Biscoff Biscoff crumbs', 0.5266666667, 'g', 'other', 'Coffee de Grail'),\n  ('Hazelnut syrup', 'Top Creamery Hazelnut syrup', 0.3266666667, 'ml', 'condiment', 'Coffee de Grail');

-- Insert products data from Excel file
INSERT INTO public.products (name, description, category, selling_price, estimated_cost, profit_margin) VALUES
  ('Salted Caramel - 12 oz', 'Delicious Salted Caramel - 12 oz', 'drink', 114.2, 45.6800, 60.0),\n  ('Salted Caramel - 16 oz', 'Delicious Salted Caramel - 16 oz', 'drink', 156.22, 62.4900, 60.0);

-- Insert product-ingredient relationships
INSERT INTO public.product_ingredients (product_id, ingredient_id, quantity, unit, cost_contribution) VALUES
  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Espresso'), 45.0, 'g', 34.6050),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Frappe base powder'), 20.0, 'g', 6.2000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel powder'), 15.0, 'g', 4.0500),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Ice'), 180.0, 'g', 0.0000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Water'), 20.0, 'g', 0.0000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel syrup'), 5.0, 'g', 0.8250),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 12 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel sauce - drizzle'), 3.0, 'g', 0.0000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Espresso'), 60.0, 'g', 46.1400),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Frappe base powder'), 30.0, 'g', 9.3000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel powder'), 20.0, 'g', 5.4000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Ice'), 250.0, 'g', 0.0000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Water'), 30.0, 'g', 0.0000),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel syrup'), 10.0, 'g', 1.6500),\n  ((SELECT id FROM products WHERE name = 'Salted Caramel - 16 oz'), 
   (SELECT id FROM ingredients WHERE name = 'Salted caramel sauce - drizzle'), 3.0, 'g', 0.0000);

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