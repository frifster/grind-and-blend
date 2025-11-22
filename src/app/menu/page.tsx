"use client";
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import MenuGrid from '@/components/Menu/MenuGrid';
import styles from "./menu.module.scss";

type Category = Database['public']['Tables']['categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

const Menu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');

        if (itemsError) throw itemsError;
        setMenuItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className={styles.menu}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-center mb-6">Our Menu</h1>
          <p className="text-center text-gray-500 text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menu}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
          Our Menu
        </h1>
        <MenuGrid items={menuItems} categories={categories} />
      </div>
    </div>
  );
};

export default Menu;