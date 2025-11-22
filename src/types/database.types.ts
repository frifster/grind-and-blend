export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            roles: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            permissions: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    resource: string
                    action: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    resource: string
                    action: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    resource?: string
                    action?: string
                    created_at?: string
                }
            }
            role_permissions: {
                Row: {
                    id: string
                    role_id: string
                    permission_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    role_id: string
                    permission_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    role_id?: string
                    permission_id?: string
                    created_at?: string
                }
            }
            user_roles: {
                Row: {
                    id: string
                    user_id: string
                    role_id: string
                    assigned_by: string | null
                    assigned_at: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    role_id: string
                    assigned_by?: string | null
                    assigned_at?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    role_id?: string
                    assigned_by?: string | null
                    assigned_at?: string
                    expires_at?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    image_url: string | null
                    display_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    image_url?: string | null
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    image_url?: string | null
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            menu_items: {
                Row: {
                    id: string
                    category_id: string | null
                    name: string
                    description: string | null
                    price_small?: number
                    price_large?: number
                    image_url: string | null
                    is_available: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category_id?: string | null
                    name: string
                    description?: string | null
                    price: number
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string | null
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    status: string
                    total_amount: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    status?: string
                    total_amount: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    status?: string
                    total_amount?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    menu_item_id: string | null
                    quantity: number
                    price_at_time: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    menu_item_id?: string | null
                    quantity: number
                    price_at_time: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    menu_item_id?: string | null
                    quantity?: number
                    price_at_time?: number
                    created_at?: string
                }
            }
            cart: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            cart_items: {
                Row: {
                    id: string
                    cart_id: string
                    menu_item_id: string
                    quantity: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    cart_id: string
                    menu_item_id: string
                    quantity?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    cart_id?: string
                    menu_item_id?: string
                    quantity?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    user_id: string | null
                    menu_item_id: string | null
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    menu_item_id?: string | null
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    menu_item_id?: string | null
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_rewards: {
                Row: {
                    id: string
                    user_id: string
                    points_balance: number
                    tier: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    points_balance?: number
                    tier?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    points_balance?: number
                    tier?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            reward_transactions: {
                Row: {
                    id: string
                    user_id: string
                    points_change: number
                    reason: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    points_change: number
                    reason: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    points_change?: number
                    reason?: string
                    created_at?: string
                }
            }
            locations: {
                Row: {
                    id: string
                    name: string
                    address: string
                    coordinates: string | null // Point type is complex in JS, treating as string or object usually, but string for now
                    phone: string | null
                    hours: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    address: string
                    coordinates?: string | null
                    phone?: string | null
                    hours?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string
                    coordinates?: string | null
                    phone?: string | null
                    hours?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
