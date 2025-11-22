import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database.types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing environment variables. Please check .env.local');
    process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

const categories = [
    {
        name: 'Coffee',
        slug: 'coffee',
        image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Tea',
        slug: 'tea',
        image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Pastries',
        slug: 'pastries',
        image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Sandwiches',
        slug: 'sandwiches',
        image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    },
];

const menuItems = [
    {
        category_slug: 'coffee',
        name: 'Espresso',
        description: 'Strong and bold coffee shot.',
        price: 3.50,
        image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80',
    },
    {
        category_slug: 'coffee',
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and foam.',
        price: 4.50,
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    },
    {
        category_slug: 'coffee',
        name: 'Latte',
        description: 'Espresso with steamed milk.',
        price: 4.75,
        image_url: 'https://images.unsplash.com/photo-1570968992193-fd6dc66979b2?auto=format&fit=crop&w=800&q=80',
    },
    {
        category_slug: 'tea',
        name: 'Green Tea',
        description: 'Refreshing and healthy green tea.',
        price: 3.00,
        image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
    },
    {
        category_slug: 'pastries',
        name: 'Croissant',
        description: 'Buttery and flaky pastry.',
        price: 3.25,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    },
    {
        category_slug: 'sandwiches',
        name: 'Club Sandwich',
        description: 'Classic sandwich with chicken, bacon, lettuce, and tomato.',
        price: 8.50,
        image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    },
];

async function seed() {
    console.log('Seeding database...');

    // Insert Categories
    console.log('Inserting categories...');
    for (const cat of categories) {
        const { error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'slug' })
            .select();

        if (error) {
            console.error(`Error inserting category ${cat.name}:`, error);
        }
    }

    // Get Categories to map IDs
    const { data: savedCategories, error: catError } = await supabase
        .from('categories')
        .select('id, slug');

    if (catError || !savedCategories) {
        console.error('Error fetching categories:', catError);
        return;
    }

    const categoryMap = new Map(savedCategories.map(c => [c.slug, c.id]));

    // Insert Menu Items
    console.log('Inserting menu items...');
    for (const item of menuItems) {
        const categoryId = categoryMap.get(item.category_slug);
        if (!categoryId) {
            console.warn(`Category not found for item ${item.name}`);
            continue;
        }

        const { category_slug, ...itemData } = item;

        const { error } = await supabase
            .from('menu_items')
            .insert({
                ...itemData,
                category_id: categoryId,
            });

        if (error) {
            console.error(`Error inserting item ${item.name}:`, error);
        }
    }

    console.log('Seeding complete!');
}

seed().catch(console.error);
