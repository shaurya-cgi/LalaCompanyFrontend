import React, { useMemo, useState } from "react";
import "./ItemDialog.css";

function ItemDialog({ categories, products, selectedBuyerId, onClose, onSave }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [gst, setGst] = useState(0);

  const filteredProducts = products.filter(
    (product) => product.categoryId === Number(selectedCategoryId),
  );

  const selectedProduct = products.find(
    (p) => p.id === Number(selectedProductId),
  );

  const pricingDetails = useMemo(() => {
    if (!selectedProduct) {
      return null;
    }

    const defaultPrice = Number(selectedProduct.defaultPrice ?? 0);
    const customPricing = (selectedProduct.buyerPrices || []).find(
      (entry) => Number(entry.buyerId) === Number(selectedBuyerId),
    );
    const customPrice = customPricing
      ? Number(customPricing.rate ?? customPricing.customPrice)
      : null;

    return {
      defaultPrice,
      customPrice,
      effectivePrice: customPrice ?? defaultPrice,
    };
  }, [selectedProduct, selectedBuyerId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    const price = rate * quantity * (1 + gst / 100);

    onSave({
      productId: selectedProduct.id,
      productName: selectedProduct.modelName,
      quantity,
      rate,
      gst,
      price: Number(price.toFixed(2)),
    });
  };

  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog">
        <h3>Add Item to Invoice</h3>

        <form className="addbuyerform" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>

            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedProductId("");
                setRate(0);
                setGst(0);
              }}
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product</label>

            <select
              value={selectedProductId}
              onChange={(e) => {
                const productId = Number(e.target.value);

                setSelectedProductId(productId);

                const product = products.find((p) => p.id === productId);

                if (product) {
                  console.debug("Selected product for pricing", product);

                  const matchedCustomPrice = (product.buyerPrices || []).find(
                    (entry) => Number(entry.buyerId) === Number(selectedBuyerId),
                  );
                  const effectiveRate =
                    matchedCustomPrice?.rate ??
                    matchedCustomPrice?.customPrice ??
                    product.defaultPrice;

                  setRate(Number(effectiveRate || 0));
                  setGst(Number(product.gstRate ?? product.gstrate ?? 18));
                }
              }}
            >
              <option value="">Select Product</option>

              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.modelName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          {selectedProduct && (
            <>
              <div className="form-group full-width pricing-summary">
                <p>Default Price: Rs. {Number(pricingDetails?.defaultPrice || 0).toFixed(2)}</p>
                <p>
                  Buyer Price: {pricingDetails?.customPrice !== null
                    ? `Rs. ${Number(pricingDetails.customPrice).toFixed(2)}`
                    : "Not set (fallback to default)"}
                </p>
              </div>

              <div className="form-group">
                <label>Rate</label>

                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>GST Rate</label>

                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(Number(e.target.value))}
                />
              </div>
            </>
          )}

          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemDialog;
