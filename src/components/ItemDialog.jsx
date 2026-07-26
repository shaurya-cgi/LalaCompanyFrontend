import React, { useState } from 'react'
import './ItemDialog.css'

function ItemDialog({ onClose, onSave }) {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('')


  const categories = ['Electronics', 'Clothing', 'Food', 'Services']
  const items = {
    'Electronics': ['Laptop', 'Mouse', 'Keyboard'],
    'Clothing': ['Shirt', 'Pants', 'Shoes'],
    'Food': ['Rice', 'Wheat', 'Sugar'],
    'Services': ['Consultation', 'Support', 'Maintenance']
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      category: selectedCategory,
      itemName: selectedItem,
      quantity: parseInt(quantity)
    })
  }

  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog">
        <h3>Add Item to Invoice</h3>

        <form className="addbuyerform" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedItem('')
              }}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="itemName">Item Name *</label>
            <select
              id="itemName"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              disabled={!selectedCategory}
              required
            >
              <option value="">Select Item</option>
              {selectedCategory && items[selectedCategory]?.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemDialog