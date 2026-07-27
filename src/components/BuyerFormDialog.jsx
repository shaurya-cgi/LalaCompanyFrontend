import React, { useState } from 'react';
import './BuyerFormDialog.css';

function BuyerFormDialog({ buyer, onSave, onClose }) {
  const [formData, setFormData] = useState(
    buyer || {
      partyName: "",
      gstin: "",
      mobile: "",
      email: "",
      billingAddress: "",
      state: "",
      city: "",
      pinCode: ""
    }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.partyName || !formData.gstin) {
      alert('Party Name and GSTIN are required');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog">
        <h3>{buyer ? 'Edit Buyer' : 'Add Buyer'}</h3>
        <form className="addbuyerform" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="partyName">Party Name *</label>
            <input
              id="partyName"
              type="text"
              placeholder="Party Name"
              value={formData.partyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstin">GSTIN *</label>
            <input
              id="gstin"
              type="text"
              placeholder="GSTIN"
              value={formData.gstin}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile No.</label>
            <input
              id="mobile"
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="billingAddress">Billing Address</label>
            <textarea
              id="billingAddress"
              rows="3"
              placeholder="Billing Address"
              value={formData.billingAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pinCode">Pin Code</label>
            <input
              id="pinCode"
              type="text"
              placeholder="Pin Code"
              value={formData.pinCode}
              onChange={handleChange}
            />
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={() => onSave(formData)}>
                Save Buyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BuyerFormDialog;