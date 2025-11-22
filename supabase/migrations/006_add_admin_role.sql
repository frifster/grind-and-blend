-- Migration: Add admin role if not exists
INSERT INTO public.roles (id, name, description, created_at, updated_at)
SELECT gen_random_uuid(), 'admin', 'Administrator with full access', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin');
