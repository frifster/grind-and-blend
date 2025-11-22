'use client';

import Image from 'next/image';
import { Database } from '@/types/database.types';
import { useRef } from 'react';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface MenuGridProps {
    items: MenuItem[];
    categories: Category[];
}

export default function MenuGrid({ items, categories }: MenuGridProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items available.</p>
            </div>
        );
    }

    // Group items by category
    const itemsByCategory = categories.map(category => ({
        category,
        items: items.filter(item => item.category_id === category.id)
    })).filter(group => group.items.length > 0);

    const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-8">
            {itemsByCategory.map(({ category, items }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const scrollRef = useRef<HTMLDivElement>(null);

                return (
                    <div key={category.id} className="category-section">
                        {/* Category Header */}
                        <h2 className="text-lg font-bold text-gray-800 mb-3 px-1">
                            {category.name}
                        </h2>

                        {/* Horizontal Scrolling Cards with Navigation */}
                        <div className="relative group">
                            {/* Left Arrow */}
                            <button
                                onClick={() => scrollLeft(scrollRef)}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                aria-label="Scroll left"
                            >
                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Scrollable Container */}
                            <div
                                ref={scrollRef}
                                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-container"
                            >
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex-shrink-0 w-56 snap-start bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100"
                                    >
                                        {item.image_url && (
                                            <div className="relative w-full h-32">
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-sm font-semibold text-gray-800 leading-tight flex-1">
                                                    {item.name}
                                                </h3>
                                                <span className="text-xs font-bold text-amber-600 ml-2 flex-shrink-0">
                                                    {(() => {
                                                        const price = item.price_small ?? item.price_large;
                                                        return price !== undefined && price !== null ? `₱${price.toFixed(2)}` : 'N/A';
                                                    })()}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description}</p>
                                            )}
                                            {!item.is_available && (
                                                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Arrow */}
                            <button
                                onClick={() => scrollRight(scrollRef)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                aria-label="Scroll right"
                            >
                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scroll-container {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
}

