"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

interface Props {
    onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: Props) {
    const supabase = createClientComponentClient<Database>();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const filePath = `${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(data.path);
            onUpload(publicUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="text-sm" />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
