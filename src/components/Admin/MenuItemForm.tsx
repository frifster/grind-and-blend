'use client';

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { Database } from '@/types/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface Props {
    existing?: MenuItem;
    onSuccess: () => void;
}

export default function MenuItemForm({ existing, onSuccess }: Props) {
    const supabase = createClientComponentClient<Database>();

    const [categoryId, setCategoryId] = useState(existing?.category_id || '');
    const [name, setName] = useState(existing?.name || '');
    const [description, setDescription] = useState(existing?.description || '');
    const [priceSmall, setPriceSmall] = useState(existing?.price_small?.toString() || '');
    const [priceLarge, setPriceLarge] = useState(existing?.price_large?.toString() || '');
    const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url || null);
    const [isAvailable, setIsAvailable] = useState(existing?.is_available ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

    useEffect(() => {
        const loadCategories = async () => {
            const { data } = await supabase.from('categories').select('id,name');
            setCategories(data || []);
        };
        loadCategories();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                category_id: categoryId,
                name,
                description,
                price_small: priceSmall ? Number(priceSmall) : null,
                price_large: priceLarge ? Number(priceLarge) : null,
                image_url: imageUrl,
                is_available: isAvailable,
            };
            const method = existing ? 'PUT' : 'POST';
            const body = existing ? { ...payload, id: existing.id } : payload;

            const res = await fetch('/api/admin/menu_items', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded bg-white max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
                {existing ? 'Edit Menu Item' : 'Create Menu Item'}
            </h3>

            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded p-2"
                >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full border rounded p-2"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Price Small</label>
                    <input
                        type="number"
                        step="0.01"
                        value={priceSmall}
                        onChange={e => setPriceSmall(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        placeholder="Optional"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Price Large</label>
                    <input
                        type="number"
                        step="0.01"
                        value={priceLarge}
                        onChange={e => setPriceLarge(e.target.value)}
                        className="mt-1 block w-full border rounded p-2"
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImageUploader onUpload={setImageUrl} />
                {imageUrl && <p className="text-xs text-gray-600 mt-1">Uploaded: {imageUrl}</p>}
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="mr-2"
                />
                <span className="text-sm">Available for sale</span>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
                {loading ? 'Saving...' : existing ? 'Update Item' : 'Create Item'}
            </button>
        </form>
    );
}
