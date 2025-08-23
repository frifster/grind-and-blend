import { useState, useEffect } from 'react'
import { supabase, Ingredient, Product, ProductIngredient, ProductWithIngredients } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UseIngredientsReturn {
  ingredients: Ingredient[]
  loading: boolean
  error: string | null
  createIngredient: (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => Promise<Ingredient | null>
  updateIngredient: (id: string, updates: Partial<Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
  deleteIngredient: (id: string) => Promise<boolean>
  refreshIngredients: () => Promise<void>
}

export function useIngredients(): UseIngredientsReturn {
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIngredients = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('ingredients')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setIngredients(data || [])
    } catch (err) {
      console.error('Error fetching ingredients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients')
    } finally {
      setLoading(false)
    }
  }

  const createIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>): Promise<Ingredient | null> => {
    try {
      setError(null)
      
      const { data, error: createError } = await supabase
        .from('ingredients')
        .insert([ingredient])
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        setIngredients(prev => [...prev, data].sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return (a.category || '').localeCompare(b.category || '')
        }))
      }

      return data
    } catch (err) {
      console.error('Error creating ingredient:', err)
      setError(err instanceof Error ? err.message : 'Failed to create ingredient')
      return null
    }
  }

  const updateIngredient = async (id: string, updates: Partial<Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        setIngredients(prev => prev.map(ingredient => 
          ingredient.id === id ? data : ingredient
        ).sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return (a.category || '').localeCompare(b.category || '')
        }))
      }

      return true
    } catch (err) {
      console.error('Error updating ingredient:', err)
      setError(err instanceof Error ? err.message : 'Failed to update ingredient')
      return false
    }
  }

  const deleteIngredient = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setIngredients(prev => prev.filter(ingredient => ingredient.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting ingredient:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete ingredient')
      return false
    }
  }

  const refreshIngredients = async () => {
    await fetchIngredients()
  }

  useEffect(() => {
    // Allow development testing without authentication
    const isDev = process.env.NODE_ENV === 'development'
    if (user || isDev) {
      fetchIngredients()
    } else {
      setIngredients([])
      setLoading(false)
    }
  }, [user])

  return {
    ingredients,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    refreshIngredients
  }
}

export interface UseProductsReturn {
  products: Product[]
  productsWithIngredients: ProductWithIngredients[]
  loading: boolean
  error: string | null
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product | null>
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  addIngredientToProduct: (productId: string, ingredientId: string, quantity: number, unit: string) => Promise<boolean>
  removeIngredientFromProduct: (productId: string, ingredientId: string) => Promise<boolean>
  refreshProducts: () => Promise<void>
}

export function useProducts(): UseProductsReturn {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [productsWithIngredients, setProductsWithIngredients] = useState<ProductWithIngredients[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch basic products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (productsError) throw productsError

      // Fetch products with ingredients
      const { data: productsWithIngredientsData, error: prodIngrError } = await supabase
        .from('products')
        .select(`
          *,
          product_ingredients (
            *,
            ingredients (*)
          )
        `)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (prodIngrError) throw prodIngrError

      setProducts(productsData || [])
      setProductsWithIngredients(productsWithIngredientsData || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
    try {
      setError(null)
      
      const { data, error: createError } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        setProducts(prev => [...prev, data].sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return a.category.localeCompare(b.category)
        }))
        
        // Refresh products with ingredients
        await fetchProducts()
      }

      return data
    } catch (err) {
      console.error('Error creating product:', err)
      setError(err instanceof Error ? err.message : 'Failed to create product')
      return null
    }
  }

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        setProducts(prev => prev.map(product => 
          product.id === id ? data : product
        ).sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return a.category.localeCompare(b.category)
        }))
        
        // Refresh products with ingredients
        await fetchProducts()
      }

      return true
    } catch (err) {
      console.error('Error updating product:', err)
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return false
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setProducts(prev => prev.filter(product => product.id !== id))
      setProductsWithIngredients(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    }
  }

  const addIngredientToProduct = async (productId: string, ingredientId: string, quantity: number, unit: string): Promise<boolean> => {
    try {
      setError(null)

      // First, get the ingredient cost to calculate cost contribution
      const { data: ingredient, error: ingError } = await supabase
        .from('ingredients')
        .select('cost_per_unit')
        .eq('id', ingredientId)
        .single()

      if (ingError) throw ingError

      const costContribution = ingredient.cost_per_unit * quantity

      const { error: insertError } = await supabase
        .from('product_ingredients')
        .insert([{
          product_id: productId,
          ingredient_id: ingredientId,
          quantity,
          unit,
          cost_contribution: costContribution
        }])

      if (insertError) throw insertError

      // Refresh products with ingredients
      await fetchProducts()
      return true
    } catch (err) {
      console.error('Error adding ingredient to product:', err)
      setError(err instanceof Error ? err.message : 'Failed to add ingredient to product')
      return false
    }
  }

  const removeIngredientFromProduct = async (productId: string, ingredientId: string): Promise<boolean> => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('product_ingredients')
        .delete()
        .eq('product_id', productId)
        .eq('ingredient_id', ingredientId)

      if (deleteError) throw deleteError

      // Refresh products with ingredients
      await fetchProducts()
      return true
    } catch (err) {
      console.error('Error removing ingredient from product:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove ingredient from product')
      return false
    }
  }

  const refreshProducts = async () => {
    await fetchProducts()
  }

  useEffect(() => {
    // Allow development testing without authentication
    const isDev = process.env.NODE_ENV === 'development'
    if (user || isDev) {
      fetchProducts()
    } else {
      setProducts([])
      setProductsWithIngredients([])
      setLoading(false)
    }
  }, [user])

  return {
    products,
    productsWithIngredients,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    addIngredientToProduct,
    removeIngredientFromProduct,
    refreshProducts
  }
}