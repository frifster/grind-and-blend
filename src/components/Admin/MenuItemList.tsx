'use client';

import { Database } from '@/types/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface Props {
    items: MenuItem[];
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}

export default function MenuItemList({ items, onEdit, onDelete }: Props) {
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item? This action cannot be undone.')) return;
        onDelete(id);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-4">
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                    {item.image_url && (
                        <div className="relative w-full h-40">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="text-base font-semibold mb-2">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description || 'No description'}</p>
                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Small:</span>
                                <span className="text-amber-600 font-bold">
                                    {item.price_small ? `₱${item.price_small.toFixed(2)}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Large:</span>
                                <span className="text-amber-600 font-bold">
                                    {item.price_large ? `₱${item.price_large.toFixed(2)}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 text-xs font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
