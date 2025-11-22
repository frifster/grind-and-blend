// src/components/Admin/CategoryForm.tsx
"use client";

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

interface Props {
    existing?: Category;
    onSuccess: () => void;
}

export default function CategoryForm({ existing, onSuccess }: Props) {
    const [name, setName] = useState(existing?.name || '');
    const [slug, setSlug] = useState(existing?.slug || '');
    const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = { name, slug, image_url: imageUrl };
            const method = existing ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(existing ? { ...payload, id: existing.id } : payload),
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
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-gray-50">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Slug</label>
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="mt-1 block w-full border rounded p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImageUploader onUpload={setImageUrl} />
                {imageUrl && <p className="text-xs text-gray-600 mt-1">Uploaded: {imageUrl}</p>}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
                {loading ? 'Saving...' : existing ? 'Update Category' : 'Create Category'}
            </button>
        </form>
    );
}
