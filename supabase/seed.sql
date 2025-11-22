-- Clear existing data
TRUNCATE public.menu_items CASCADE;
TRUNCATE public.categories CASCADE;

-- Placeholder image URL (place the generated image in public folder as menu_item_placeholder.png)
-- placeholder image path defined in inserts

-- Insert categories (name, slug, image_url)
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Eggdrop Sandwich', 'eggdrop-sandwich', '/menu_item_placeholder.png'),
  ('Rice Bowls', 'rice-bowls', '/menu_item_placeholder.png'),
  ('Rice Bowl Combo', 'rice-bowl-combo', '/menu_item_placeholder.png'),
  ('Korean Specials', 'korean-specials', '/menu_item_placeholder.png'),
  ('Coffee-Based Specials', 'coffee-based-specials', '/menu_item_placeholder.png'),
  ('Ice Blended (Coffee)', 'ice-blended-coffee', '/menu_item_placeholder.png'),
  ('Ice Blended (Non-Coffee)', 'ice-blended-non-coffee', '/menu_item_placeholder.png'),
  ('Non-Coffee Series', 'non-coffee-series', '/menu_item_placeholder.png'),
  ('Hot/Iced Classics', 'hot-iced-classics', '/menu_item_placeholder.png'),
  ('Refreshers & Sodas', 'refreshers-sodas', '/menu_item_placeholder.png'),
  ('Add Ons', 'add-ons', '/menu_item_placeholder.png')
ON CONFLICT (slug) DO NOTHING;

-- Insert menu items (category_id, name, description, price_small, price_large, image_url)
INSERT INTO public.menu_items (category_id, name, description, price_small, price_large, image_url)
SELECT c.id,
       i.name,
       i.description,
       i.price_small,
       i.price_large,
       '/menu_item_placeholder.png'
FROM (
  VALUES
    -- Eggdrop Sandwich
    ('eggdrop-sandwich', 'Bacon & Egg', NULL, 139, NULL),
    ('eggdrop-sandwich', 'Ham & Egg', NULL, 139, NULL),
    ('eggdrop-sandwich', 'Luncheon Meat & Egg', NULL, 139, NULL),
    ('eggdrop-sandwich', 'Spicy Pork Bulgogi', NULL, 149, NULL),
    ('eggdrop-sandwich', 'Meat Overload', 'Bacon, Ham, Korean Luncheon Meat', 149, NULL),
    -- Rice Bowls
    ('rice-bowls', 'Bacon', NULL, 89, NULL),
    ('rice-bowls', 'Ham', NULL, 89, NULL),
    ('rice-bowls', 'Luncheon Meat', NULL, 89, NULL),
    ('rice-bowls', 'Spicy Pork Bulgogi', NULL, 99, NULL),
    ('rice-bowls', 'Meat Overload', 'Bacon, Ham, Korean Luncheon Meat', 99, NULL),
    ('rice-bowls', 'Chicken Sausage', 'Meals & Bites Special', 118, NULL),
    ('rice-bowls', 'Bacon-wrapped Sausage', 'Meals & Bites Special', 128, NULL),
    ('rice-bowls', 'Cheesy Beef Enoki Roll', 'Meals & Bites Special', 138, NULL),
    -- Rice Bowl Combo
    ('rice-bowl-combo', 'Bacon Rice Bowl + Soda', 'Includes 16oz Soda', 159, NULL),
    ('rice-bowl-combo', 'Ham Rice Bowl + Soda', 'Includes 16oz Soda', 159, NULL),
    ('rice-bowl-combo', 'Luncheon Meat Rice Bowl + Soda', 'Includes 16oz Soda', 159, NULL),
    ('rice-bowl-combo', 'Spicy Pork Bulgogi Rice Bowl + Soda', 'Includes 16oz Soda', 169, NULL),
    ('rice-bowl-combo', 'Meat Overload Rice Bowl + Soda', 'Includes 16oz Soda', 169, NULL),
    -- Korean Specials
    ('korean-specials', 'Classic Tteokbokki', NULL, 158, NULL),
    ('korean-specials', 'Rosé Tteokbokki', NULL, 168, NULL),
    -- Coffee-Based Specials
    ('coffee-based-specials', 'Java Chip', NULL, 118, 128),
    ('coffee-based-specials', 'Biscoff', NULL, 118, 128),
    ('coffee-based-specials', 'Biscoff Latte', NULL, 108, 118),
    ('coffee-based-specials', 'Hazelnut Mocha', NULL, 108, 118),
    ('coffee-based-specials', 'Seasalt Caramel', NULL, 108, 118),
    ('coffee-based-specials', 'Barista Drink', NULL, 108, 118),
    -- Ice Blended (Coffee)
    ('ice-blended-coffee', 'Mocha Frappe', NULL, 109, 119),
    ('ice-blended-coffee', 'Salted Caramel Frappe', NULL, 109, 119),
    -- Ice Blended (Non-Coffee)
    ('ice-blended-non-coffee', 'Dark Choco Frappe', NULL, 89, 99),
    ('ice-blended-non-coffee', 'Strawberry Yogurt', NULL, 109, 119),
    ('ice-blended-non-coffee', 'Blueberry Yogurt', NULL, 109, 119),
    ('ice-blended-non-coffee', 'Mixed Berries Yogurt', NULL, 119, 129),
    ('ice-blended-non-coffee', 'Matcha Latte Frappe', NULL, 119, 129),
    -- Non-Coffee Series
    ('non-coffee-series', 'Cookies & Cream', NULL, 128, 138),
    ('non-coffee-series', 'Strawberries & Cream', NULL, 128, 138),
    ('non-coffee-series', 'Blueberries & Cream', NULL, 128, 138),
    ('non-coffee-series', 'Iced Toffee Matcha Latte', NULL, 108, 118),
    ('non-coffee-series', 'White Chocolate Strawberry Milk', NULL, 88, 98),
    ('non-coffee-series', 'Berry-Layered Milk', NULL, 88, 98),
    ('non-coffee-series', 'Oreo Chocolate Milk', NULL, 88, 98),
    -- Hot/Iced Classics
    ('hot-iced-classics', 'Americano', NULL, 79, 89),
    ('hot-iced-classics', 'Cafe Latte', NULL, 89, 99),
    ('hot-iced-classics', 'Spanish Latte', NULL, 89, 99),
    ('hot-iced-classics', 'Caramel Macchiato', NULL, 89, 99),
    ('hot-iced-classics', 'Cafe Mocha', NULL, 89, 99),
    ('hot-iced-classics', 'White Chocolate', NULL, 89, 99),
    ('hot-iced-classics', 'Belgian Chocolate', NULL, 89, 99),
    -- Refreshers & Sodas
    ('refreshers-sodas', 'OG Lemonade', NULL, 59, NULL),
    ('refreshers-sodas', 'Yakult Lemonade', NULL, 69, NULL),
    ('refreshers-sodas', 'Strawberry Lemonade', NULL, 69, NULL),
    ('refreshers-sodas', 'Blueberry Lemonade', NULL, 69, NULL),
    ('refreshers-sodas', 'Strawberry Soda', NULL, 79, 89),
    ('refreshers-sodas', 'Green Apple Soda', NULL, 79, 89),
    ('refreshers-sodas', 'Matcha Latte', NULL, 99, 109),
    ('refreshers-sodas', 'Dark Choco', NULL, 79, 89),
    -- Add Ons
    ('add-ons', 'Espresso Shot', NULL, 30, NULL),
    ('add-ons', 'Coffee Jelly', NULL, 15, NULL),
    ('add-ons', 'Popping Boba', NULL, 15, NULL)
) AS i(category_slug, name, description, price_small, price_large)
JOIN public.categories c ON c.slug = i.category_slug;
