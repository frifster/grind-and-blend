"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import Link from 'next/link';

export default function PortalDashboard() {
    const supabase = createClientComponentClient<Database>();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: roles } = await supabase
                    .from('user_roles')
                    .select('role_id')
                    .eq('user_id', user.id);

                if (roles?.length) {
                    const { data: roleNames } = await supabase
                        .from('roles')
                        .select('name')
                        .in('id', roles.map(r => r.role_id));

                    setIsAdmin(!!roleNames?.some(r => r.name === 'admin'));
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center">Please sign in to access the portal.</div>;
    if (!isAdmin) return <div className="p-8 text-center text-red-600">You do not have permission to access this portal.</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
            <p className="text-gray-600 mb-8">Welcome back, {user.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Menu Management Card */}
                <Link href="/portal/menu" className="block group">
                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold group-hover:text-amber-600 transition-colors">Menu Management</h2>
                            <span className="text-2xl">🍽️</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Manage categories, menu items, prices, and availability.
                        </p>
                    </div>
                </Link>

                {/* Placeholder for Orders */}
                <div className="bg-gray-50 border rounded-xl p-6 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-500">Orders</h2>
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Order management coming soon.
                    </p>
                </div>

                {/* Placeholder for Users */}
                <div className="bg-gray-50 border rounded-xl p-6 opacity-60">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-500">Users</h2>
                        <span className="text-2xl">👥</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        User management coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}
