-- Check if the admin role exists
SELECT * FROM public.roles WHERE name = 'admin';

-- Check if user d8661077-dd7e-4ed6-a407-24aac4b44399 has the admin role assigned
SELECT ur.*, r.name as role_name
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
WHERE ur.user_id = 'd8661077-dd7e-4ed6-a407-24aac4b44399';

-- Check all user_roles entries
SELECT * FROM public.user_roles;
