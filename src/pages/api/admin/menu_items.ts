// src/pages/api/admin/menu_items.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, serviceKey);

export default async function handler(req, res) {
    const { method } = req;
    switch (method) {
        case 'GET': {
            const { data, error } = await supabase.from('menu_items').select('*');
            if (error) return res.status(500).json({ error: error.message });
            return res.status(200).json(data);
        }
        case 'POST': {
            const { category_id, name, description, price_small, price_large, image_url, is_available } = req.body;
            const { data, error } = await supabase.from('menu_items').insert({
                category_id,
                name,
                description,
                price_small,
                price_large,
                image_url,
                is_available,
            });
            if (error) return res.status(400).json({ error: error.message });
            return res.status(201).json(data);
        }
        case 'PUT': {
            const { id, category_id, name, description, price_small, price_large, image_url, is_available } = req.body;
            const { data, error } = await supabase
                .from('menu_items')
                .update({
                    category_id,
                    name,
                    description,
                    price_small,
                    price_large,
                    image_url,
                    is_available,
                })
                .eq('id', id);
            if (error) return res.status(400).json({ error: error.message });
            return res.status(200).json(data);
        }
        case 'DELETE': {
            const { id } = req.query;
            const { data, error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) return res.status(400).json({ error: error.message });
            return res.status(200).json(data);
        }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
}
