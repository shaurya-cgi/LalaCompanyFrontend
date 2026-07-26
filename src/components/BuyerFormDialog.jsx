import React from 'react';
import './BuyerFormDialog.css';

function BuyerFormDialog({ onClose }) {
  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog">
        <h3>Add Buyer</h3>

        <form className="addbuyerform">
          <div className="form-group">
            <label htmlFor="partyName">Party Name *</label>
            <input
              id="partyName"
              type="text"
              placeholder="Party Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstin">GSTIN *</label>
            <input
              id="gstin"
              type="text"
              placeholder="GSTIN"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile No.</label>
            <input
              id="mobile"
              type="tel"
              placeholder="Mobile Number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Id</label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="billingAddress">
              Billing Address
            </label>
            <textarea
              id="billingAddress"
              rows="3"
              placeholder="Billing Address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              placeholder="State"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="City"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pinCode">Pin Code</label>
            <input
              id="pinCode"
              type="text"
              placeholder="Pin Code"
            />
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit">
              Save Buyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BuyerFormDialog;