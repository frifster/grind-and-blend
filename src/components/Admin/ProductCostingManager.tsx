'use client'

import React, { useState } from 'react'
import { useIngredients, useProducts } from '@/hooks/useProductCosting'
import { Ingredient, Product } from '@/lib/supabase'

interface ProductCostingManagerProps {
  className?: string
}

export default function ProductCostingManager({ className = '' }: ProductCostingManagerProps) {
  const { 
    ingredients, 
    loading: ingredientsLoading, 
    error: ingredientsError 
  } = useIngredients()
  
  const { 
    products, 
    productsWithIngredients, 
    loading: productsLoading, 
    error: productsError 
  } = useProducts()

  const [activeView, setActiveView] = useState<'ingredients' | 'products'>('ingredients')

  const loading = ingredientsLoading || productsLoading
  const error = ingredientsError || productsError

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderIngredientsTable = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
        <p className="text-sm text-gray-500 mt-1">Manage ingredient costs and details</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost per Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                  {ingredient.description && (
                    <div className="text-sm text-gray-500">{ingredient.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ingredient.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${ingredient.cost_per_unit.toFixed(4)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{ingredient.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{ingredient.supplier || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ingredient.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ingredient.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {ingredients.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No ingredients found. Add ingredients to get started.
        </div>
      )}
    </div>
  )

  const renderProductsTable = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Products</h3>
        <p className="text-sm text-gray-500 mt-1">View product costs and profit margins</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Margin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ingredients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productsWithIngredients.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-gray-500">{product.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${product.estimated_cost?.toFixed(2) || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${product.selling_price?.toFixed(2) || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {product.profit_margin?.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {product.product_ingredients && product.product_ingredients.length > 0 ? (
                      <div className="space-y-1">
                        {product.product_ingredients.slice(0, 3).map((pi, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{pi.ingredients.name}</span>
                            <span className="text-xs text-gray-400">
                              {pi.quantity} {pi.unit} (${pi.cost_contribution?.toFixed(2)})
                            </span>
                          </div>
                        ))}
                        {product.product_ingredients.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{product.product_ingredients.length - 3} more ingredients
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="italic">No ingredients</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {productsWithIngredients.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No products found. Add products to get started.
        </div>
      )}
    </div>
  )

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Costing Calculator</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage ingredients and calculate product costs
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('ingredients')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'ingredients'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Ingredients ({ingredients.length})</span>
          </button>
          <button
            onClick={() => setActiveView('products')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Products ({products.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeView === 'ingredients' ? renderIngredientsTable() : renderProductsTable()}
    </div>
  )
}