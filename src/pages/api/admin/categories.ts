// src/pages/api/admin/categories.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, serviceKey);

export default async function handler(req, res) {
    const { method } = req;
    switch (method) {
        case 'GET': {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) return res.status(500).json({ error: error.message });
            return res.status(200).json(data);
        }
        case 'POST': {
            const { name, slug, image_url } = req.body;
            const { data, error } = await supabase.from('categories').insert({ name, slug, image_url });
            if (error) return res.status(400).json({ error: error.message });
            return res.status(201).json(data);
        }
        case 'PUT': {
            const { id, name, slug, image_url, display_order } = req.body;
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (slug !== undefined) updateData.slug = slug;
            if (image_url !== undefined) updateData.image_url = image_url;
            if (display_order !== undefined) updateData.display_order = display_order;
            const { data, error } = await supabase.from('categories').update(updateData).eq('id', id);
            if (error) return res.status(400).json({ error: error.message });
            return res.status(200).json(data);
        }
        case 'DELETE': {
            const { id } = req.query;
            const { data, error } = await supabase.from('categories').delete().eq('id', id);
            if (error) return res.status(400).json({ error: error.message });
            return res.status(200).json(data);
        }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
