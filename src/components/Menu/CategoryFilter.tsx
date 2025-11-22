'use client';

import { Database } from '@/types/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelectCategory: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            <button
                onClick={() => onSelectCategory(null)}
                className={`px-4 py-1.5 rounded-full transition-all text-sm font-medium ${selectedCategory === null
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                All
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.slug)}
                    className={`px-4 py-1.5 rounded-full transition-all text-sm font-medium ${selectedCategory === category.slug
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
