"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import CategoryForm from '@/components/Admin/CategoryForm';
import MenuItemForm from '@/components/Admin/MenuItemForm';
import MenuItemList from '@/components/Admin/MenuItemList';
import DeleteConfirmModal from '@/components/Admin/DeleteConfirmModal';

type Category = Database['public']['Tables']['categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export default function MenuManagementPage() {
    const supabase = createClientComponentClient<Database>();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showMenuItemForm, setShowMenuItemForm] = useState<{ open: boolean; item?: MenuItem }>({ open: false });
    const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        type: 'category' | 'menuItem';
        item: Category | MenuItem | null;
    }>({ show: false, type: 'category', item: null });
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

    // Auth & role check
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: roles, error } = await supabase
                    .from('user_roles')
                    .select('role_id')
                    .eq('user_id', user.id);
                if (!error && roles?.length) {
                    const { data: roleNames, error: roleErr } = await supabase
                        .from('roles')
                        .select('name')
                        .in('id', roles.map(r => r.role_id));
                    setIsAdmin(!!roleNames?.some(r => r.name === 'admin'));
                }
            }
        };
        fetchUser();
    }, []);

    // Load data
    const loadData = async () => {
        const [{ data: catData }, { data: itemData }] = await Promise.all([
            supabase.from('categories').select('*').order('display_order', { ascending: true }),
            supabase.from('menu_items').select('*'),
        ]);
        setCategories(catData || []);
        setMenuItems(itemData || []);
    };

    useEffect(() => {
        if (isAdmin) loadData();
    }, [isAdmin]);

    // Escape key handler for modals
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showCategoryForm) {
                    setShowCategoryForm(false);
                    setEditingCategory(undefined);
                } else if (showMenuItemForm.open) {
                    setShowMenuItemForm({ open: false });
                } else if (deleteModal.show) {
                    setDeleteModal({ show: false, type: 'category', item: null });
                }
            }
        };

        if (showCategoryForm || showMenuItemForm.open || deleteModal.show) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showCategoryForm, showMenuItemForm.open, deleteModal.show]);

    const handleDeleteCategory = (category: Category) => {
        setDeleteModal({
            show: true,
            type: 'category',
            item: category,
        });
    };

    const handleDeleteMenuItem = (menuItem: MenuItem) => {
        setDeleteModal({
            show: true,
            type: 'menuItem',
            item: menuItem,
        });
    };

    const handleConfirmDelete = async (shouldDeleteChildren?: boolean, moveToId?: string) => {
        if (!deleteModal.item) return;

        if (deleteModal.type === 'category') {
            const category = deleteModal.item as Category;
            const categoryItems = menuItems.filter(item => item.category_id === category.id);

            if (categoryItems.length > 0 && !shouldDeleteChildren && moveToId) {
                // Move items to another category
                await Promise.all(
                    categoryItems.map(item =>
                        fetch(`/api/admin/menu_items`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: item.id, category_id: moveToId }),
                        })
                    )
                );
            } else if (categoryItems.length > 0 && shouldDeleteChildren) {
                // Delete all items in the category
                await Promise.all(
                    categoryItems.map(item =>
                        fetch(`/api/admin/menu_items?id=${item.id}`, { method: 'DELETE' })
                    )
                );
            }

            // Delete the category
            await fetch(`/api/admin/categories?id=${category.id}`, { method: 'DELETE' });
        } else if (deleteModal.type === 'menuItem') {
            const menuItem = deleteModal.item as MenuItem;
            await fetch(`/api/admin/menu_items?id=${menuItem.id}`, { method: 'DELETE' });
        }

        setDeleteModal({ show: false, type: 'category', item: null });
        loadData();
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };

    const handleCreateCategory = () => {
        setEditingCategory(undefined);
        setShowCategoryForm(true);
    };

    // Drag and drop handlers with improved logic
    const handleDragStart = (e: React.DragEvent, categoryId: string) => {
        setDraggedCategoryId(categoryId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
        e.preventDefault();
        if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
            setDraggedCategoryId(null);
            return;
        }

        const draggedIndex = categories.findIndex(c => c.id === draggedCategoryId);
        const targetIndex = categories.findIndex(c => c.id === targetCategoryId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedCategoryId(null);
            return;
        }

        // Reorder all categories between dragged and target
        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, movedCategory);

        // Update display_order for all affected categories
        const updates = newCategories.map((cat, idx) =>
            fetch(`/api/admin/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cat.id, display_order: idx }),
            })
        );

        await Promise.all(updates);
        setDraggedCategoryId(null);
        loadData();
    };

    const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex(c => c.id === categoryId);
        if (currentIndex === -1) return;

        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === categories.length - 1) return;

        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const currentCat = categories[currentIndex];
        const swapCat = categories[swapIndex];

        // Swap display_order values
        await Promise.all([
            fetch(`/api/admin/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentCat.id, display_order: swapCat.display_order }),
            }),
            fetch(`/api/admin/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: swapCat.id, display_order: currentCat.display_order }),
            }),
        ]);

        loadData();
    };

    if (!user) return <p className="text-center">Please sign in.</p>;
    if (!isAdmin) return <p className="text-center text-red-600">You do not have admin privileges.</p>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
                <a href="/portal" className="text-amber-600 hover:underline mr-4">← Back to Dashboard</a>
                <h1 className="text-3xl font-bold">Menu Management</h1>
            </div>

            {/* Categories */}
            <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}>
                        <h2 className="text-2xl font-semibold">Categories</h2>
                        <span className={`transform transition-transform duration-200 ${isCategoriesExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </div>
                    <button
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                    >
                        + New Category
                    </button>
                </div>
                {isCategoriesExpanded && (
                    <div className="bg-white border rounded-lg overflow-hidden">
                        {categories.map((cat, index) => (
                            <div
                                key={cat.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, cat.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, cat.id)}
                                className={`flex items-center gap-3 p-4 border-b last:border-b-0 transition-all cursor-move ${draggedCategoryId === cat.id ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'
                                    }`}
                            >
                                {/* Drag Handle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 cursor-grab active:cursor-grabbing text-xl" title="Drag to reorder">
                                        ⋮⋮
                                    </span>
                                    <span className="text-sm font-mono text-gray-400 w-8">{index + 1}.</span>
                                </div>

                                {/* Category Info */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                                    <p className="text-sm text-gray-500">{cat.slug}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditCategory(cat);
                                        }}
                                        className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCategory(cat);
                                        }}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No categories yet. Click "+ New Category" to add one.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Menu Items */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold">Menu Items</h2>
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="px-3 py-1.5 border rounded text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowMenuItemForm({ open: true })}
                        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                    >
                        + New Item
                    </button>
                </div>
                <MenuItemList
                    items={selectedCategoryFilter === 'all'
                        ? menuItems
                        : menuItems.filter(item => item.category_id === selectedCategoryFilter)
                    }
                    onEdit={item => setShowMenuItemForm({ open: true, item })}
                    onDelete={(id) => {
                        const item = menuItems.find(i => i.id === id);
                        if (item) handleDeleteMenuItem(item);
                    }}
                />
            </section>

            {/* Modals */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowCategoryForm(false)}>
                    <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                setShowCategoryForm(false);
                                setEditingCategory(undefined);
                            }}
                            className="sticky top-2 float-right mr-2 mt-2 bg-white border-2 border-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 hover:border-gray-500 transition-all z-10 shadow-md"
                        >
                            ✕
                        </button>
                        <CategoryForm
                            existing={editingCategory}
                            onSuccess={() => {
                                setShowCategoryForm(false);
                                setEditingCategory(undefined);
                                loadData();
                            }}
                        />
                    </div>
                </div>
            )}

            {showMenuItemForm.open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowMenuItemForm({ open: false })}>
                    <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowMenuItemForm({ open: false })}
                            className="sticky top-2 float-right mr-2 mt-2 bg-white border-2 border-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 hover:border-gray-500 transition-all z-10 shadow-md"
                        >
                            ✕
                        </button>
                        <MenuItemForm
                            existing={showMenuItemForm.item}
                            onSuccess={() => {
                                setShowMenuItemForm({ open: false });
                                loadData();
                            }}
                        />
                    </div>
                </div>
            )}

            {deleteModal.show && deleteModal.item && (
                <DeleteConfirmModal
                    title={deleteModal.type === 'category' ? 'Delete Category' : 'Delete Menu Item'}
                    message={deleteModal.type === 'category'
                        ? 'Are you sure you want to delete this category?'
                        : 'Are you sure you want to delete this menu item?'}
                    itemName={deleteModal.item.name}
                    hasChildren={deleteModal.type === 'category' && menuItems.some(i => i.category_id === deleteModal.item!.id)}
                    childrenCount={deleteModal.type === 'category' ? menuItems.filter(i => i.category_id === deleteModal.item!.id).length : 0}
                    childrenType="menu items"
                    otherOptions={categories.filter(c => c.id !== deleteModal.item!.id)}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteModal({ show: false, type: 'category', item: null })}
                />
            )}
        </div>
    );
}
