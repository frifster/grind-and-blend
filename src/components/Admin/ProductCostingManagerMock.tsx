'use client'

import React, { useState } from 'react'

// Mock data for demonstration
const mockIngredients = [
  { id: '1', name: 'Whole Milk', category: 'dairy', cost_per_unit: 0.02, unit: 'ml', supplier: 'Local Dairy Co', is_active: true },
  { id: '2', name: 'Cheddar Cheese', category: 'dairy', cost_per_unit: 0.15, unit: 'g', supplier: 'Cheese Factory', is_active: true },
  { id: '3', name: 'Ham', category: 'protein', cost_per_unit: 0.45, unit: 'g', supplier: 'Meat Suppliers Inc', is_active: true },
  { id: '4', name: 'Bacon', category: 'protein', cost_per_unit: 0.55, unit: 'g', supplier: 'Meat Suppliers Inc', is_active: true },
  { id: '5', name: 'Coffee Beans', category: 'beverage', cost_per_unit: 0.08, unit: 'g', supplier: 'Coffee Roasters', is_active: true },
  { id: '6', name: 'Dark Chocolate', category: 'beverage', cost_per_unit: 0.18, unit: 'g', supplier: 'Chocolate Co', is_active: true },
]

const mockProducts = [
  { 
    id: '1', 
    name: 'Ham & Egg Sandwich', 
    category: 'sandwich', 
    estimated_cost: 3.25, 
    selling_price: 8.50, 
    profit_margin: 61.76, 
    is_active: true,
    product_ingredients: [
      { ingredients: { name: 'Ham' }, quantity: 60, unit: 'g', cost_contribution: 2.70 },
      { ingredients: { name: 'Bread Slice' }, quantity: 2, unit: 'piece', cost_contribution: 0.70 },
    ]
  },
  { 
    id: '2', 
    name: 'Dark Chocolate Frappe', 
    category: 'drink', 
    estimated_cost: 2.80, 
    selling_price: 6.50, 
    profit_margin: 56.92, 
    is_active: true,
    product_ingredients: [
      { ingredients: { name: 'Dark Chocolate' }, quantity: 30, unit: 'g', cost_contribution: 5.40 },
      { ingredients: { name: 'Whole Milk' }, quantity: 200, unit: 'ml', cost_contribution: 4.00 },
    ]
  },
  { 
    id: '3', 
    name: 'Mocha Frappe', 
    category: 'drink', 
    estimated_cost: 3.10, 
    selling_price: 6.75, 
    profit_margin: 54.07, 
    is_active: true,
    product_ingredients: [
      { ingredients: { name: 'Coffee Beans' }, quantity: 25, unit: 'g', cost_contribution: 2.00 },
      { ingredients: { name: 'Dark Chocolate' }, quantity: 20, unit: 'g', cost_contribution: 3.60 },
    ]
  },
]

interface ProductCostingManagerMockProps {
  className?: string
}

export default function ProductCostingManagerMock({ className = '' }: ProductCostingManagerMockProps) {
  const [activeView, setActiveView] = useState<'ingredients' | 'products'>('ingredients')

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockIngredients.map((ingredient) => (
              <tr key={ingredient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ingredient.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${ingredient.cost_per_unit.toFixed(4)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{ingredient.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{ingredient.supplier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${product.estimated_cost.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">${product.selling_price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.profit_margin.toFixed(1)}%</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <div className="space-y-1">
                      {product.product_ingredients.map((pi, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{pi.ingredients.name}</span>
                          <span className="text-xs text-gray-400">
                            {pi.quantity} {pi.unit} (${pi.cost_contribution.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Costing Calculator</h2>
          <p className="mt-1 text-sm text-gray-500">Manage ingredients and calculate product costs</p>
        </div>
      </div>

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
            <span>Ingredients ({mockIngredients.length})</span>
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
            <span>Products ({mockProducts.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeView === 'ingredients' ? renderIngredientsTable() : renderProductsTable()}
    </div>
  )
}