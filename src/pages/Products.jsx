import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Products.css";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import buyerApi from "../api/buyerApi";
import buyerProductPriceApi from "../api/buyerProductPriceApi";

const emptyProductForm = {
  categoryId: "",
  modelName: "",
  defaultPrice: "",
  gstRate: "",
};

const normalizeBuyerPrice = (record, buyers, fallbackProductId = null) => {
  const buyerId = Number(record.buyerId);
  const buyer = buyers.find((item) => item.id === buyerId);

  return {
    id: record.id ?? null,
    buyerId,
    productId: Number(record.productId ?? fallbackProductId ?? 0),
    customPrice: Number(record.customPrice ?? 0),
    buyerName: record.buyerName || record.partyName || buyer?.partyName || "Unknown Buyer",
  };
};

const getEffectivePrice = (product, buyerId) => {
  const defaultPrice = Number(product.defaultPrice ?? 0);

  if (!buyerId) {
    return {
      defaultPrice,
      customPrice: null,
      effectivePrice: defaultPrice,
    };
  }

  const customEntry = (product.buyerPrices || []).find(
    (entry) => Number(entry.buyerId) === Number(buyerId),
  );

  const customPrice = customEntry ? Number(customEntry.customPrice) : null;

  return {
    defaultPrice,
    customPrice,
    effectivePrice: customPrice ?? defaultPrice,
  };
};

function ProductDialog({
  product,
  buyers,
  categories,
  initialBuyerPrices,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState(
    product
      ? {
          categoryId: String(product.categoryId ?? ""),
          modelName: product.modelName ?? "",
          defaultPrice: String(product.defaultPrice ?? ""),
          gstRate: String(product.gstRate ?? ""),
        }
      : emptyProductForm,
  );

  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");
  const [buyerPrices, setBuyerPrices] = useState(
    (initialBuyerPrices || []).map((entry) => ({
      ...entry,
      buyerId: Number(entry.buyerId),
      customPrice: Number(entry.customPrice),
    })),
  );

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddBuyerPrice = () => {
    const buyerId = Number(selectedBuyerId);
    const customPrice = Number(customPriceInput);

    if (!buyerId) {
      alert("Select a buyer before adding a custom price.");
      return;
    }

    if (Number.isNaN(customPrice) || customPrice < 0) {
      alert("Enter a valid custom price.");
      return;
    }

    const buyer = buyers.find((item) => item.id === buyerId);
    if (!buyer) {
      alert("Selected buyer could not be found.");
      return;
    }

    setBuyerPrices((prev) => {
      const existing = prev.find((entry) => entry.buyerId === buyerId);

      if (existing) {
        return prev.map((entry) =>
          entry.buyerId === buyerId
            ? {
                ...entry,
                customPrice,
                buyerName: buyer.partyName,
              }
            : entry,
        );
      }

      return [
        ...prev,
        {
          id: null,
          buyerId,
          buyerName: buyer.partyName,
          customPrice,
        },
      ];
    });

    setSelectedBuyerId("");
    setCustomPriceInput("");
  };

  const handleRemoveBuyerPrice = (buyerId) => {
    setBuyerPrices((prev) => prev.filter((entry) => entry.buyerId !== buyerId));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const categoryId = Number(formData.categoryId);
    const defaultPrice = Number(formData.defaultPrice);
    const gstRate = Number(formData.gstRate || 0);

    if (!categoryId) {
      alert("Category is required.");
      return;
    }

    if (!formData.modelName.trim()) {
      alert("Model name is required.");
      return;
    }

    if (Number.isNaN(defaultPrice) || defaultPrice <= 0) {
      alert("Default price is required and must be greater than 0.");
      return;
    }

    if (Number.isNaN(gstRate) || gstRate < 0) {
      alert("GST rate must be 0 or greater.");
      return;
    }

    onSave({
      productPayload: {
        categoryId,
        modelName: formData.modelName.trim(),
        defaultPrice,
        gstRate,
      },
      buyerPrices,
    });
  };

  return (
    <div className="dialog-overlay">
      <div className="createBuyerDialog product-dialog">
        <h3>{product ? "Edit Product" : "Add Product"}</h3>

        <form className="addbuyerform" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="categoryId">Category *</label>

            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={handleFormChange}
              required
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
            <label htmlFor="modelName">Model Name *</label>
            <input
              id="modelName"
              type="text"
              value={formData.modelName}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultPrice">Default Price *</label>
            <input
              id="defaultPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultPrice}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstRate">GST Rate (%)</label>
            <input
              id="gstRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.gstRate}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-group full-width buyer-price-heading">
            <label>Buyer Specific Pricing</label>
            <p>Add optional custom prices per buyer. Default price is always the fallback.</p>
          </div>

          <div className="form-group">
            <label>Buyer</label>
            <select
              value={selectedBuyerId}
              onChange={(event) => setSelectedBuyerId(event.target.value)}
            >
              <option value="">Select Buyer</option>
              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.partyName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Custom Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPriceInput}
              onChange={(event) => setCustomPriceInput(event.target.value)}
            />
          </div>

          <div className="form-group add-price-row">
            <button type="button" className="add-price-button" onClick={handleAddBuyerPrice}>
              Add Price
            </button>
          </div>

          <div className="form-group full-width">
            {buyerPrices.length === 0 ? (
              <p className="empty-buyer-prices">No buyer-specific prices added.</p>
            ) : (
              <div className="buyer-prices-list">
                {buyerPrices.map((entry) => (
                  <div key={entry.buyerId} className="buyer-price-item">
                    <span>{entry.buyerName}</span>
                    <span>Rs. {Number(entry.customPrice).toFixed(2)}</span>
                    <button
                      type="button"
                      className="deletebutton"
                      onClick={() => handleRemoveBuyerPrice(entry.buyerId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dialog-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBuyerFilterId, setSelectedBuyerFilterId] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductBuyerPrices, setSelectedProductBuyerPrices] = useState([]);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes, buyersRes, buyerPricesRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        buyerApi.getAll(),
        buyerProductPriceApi.getAll().catch(() => ({ data: [] })),
      ]);

      const loadedBuyers = buyersRes.data || [];
      const loadedProducts = productsRes.data || [];
      const allBuyerPrices = (buyerPricesRes.data || []).map((entry) =>
        normalizeBuyerPrice(entry, loadedBuyers),
      );

      const productsWithBuyerPrices = loadedProducts.map((product) => {
        const nestedBuyerPrices = Array.isArray(product.buyerPrices)
          ? product.buyerPrices.map((entry) =>
              normalizeBuyerPrice(
                {
                  ...entry,
                  productId: product.id,
                },
                loadedBuyers,
                product.id,
              ),
            )
          : [];

        const fallbackBuyerPrices = allBuyerPrices.filter(
          (entry) => Number(entry.productId) === Number(product.id),
        );

        return {
          ...product,
          buyerPrices: nestedBuyerPrices.length > 0 ? nestedBuyerPrices : fallbackBuyerPrices,
        };
      });

      setProducts(productsWithBuyerPrices);
      setCategories(categoriesRes.data || []);
      setBuyers(loadedBuyers);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load products or lookup data.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(Number(category.id), category.categoryName);
    });
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const buyerId = Number(selectedBuyerFilterId || 0);

    if (!buyerId) {
      return products;
    }

    return products.filter((product) => {
      const match = (product.buyerPrices || []).find(
        (entry) => Number(entry.buyerId) === buyerId,
      );

      return Boolean(match);
    });
  }, [products, selectedBuyerFilterId]);

  const syncBuyerPrices = async (productId, desiredBuyerPrices, existingBuyerPrices = []) => {
    const existingMap = new Map(
      (existingBuyerPrices || []).map((entry) => [Number(entry.buyerId), entry]),
    );
    const desiredMap = new Map(
      (desiredBuyerPrices || []).map((entry) => [Number(entry.buyerId), entry]),
    );

    const requests = [];

    existingMap.forEach((existingEntry, buyerId) => {
      if (!desiredMap.has(buyerId) && existingEntry.id) {
        requests.push(buyerProductPriceApi.delete(existingEntry.id));
      }
    });

    desiredMap.forEach((desiredEntry, buyerId) => {
      const existingEntry = existingMap.get(buyerId);
      const payload = {
        buyerId,
        productId,
        customPrice: Number(desiredEntry.customPrice),
      };

      if (existingEntry?.id) {
        if (Number(existingEntry.customPrice) !== Number(desiredEntry.customPrice)) {
          requests.push(buyerProductPriceApi.update(existingEntry.id, payload));
        }
      } else {
        requests.push(buyerProductPriceApi.create(payload));
      }
    });

    await Promise.all(requests);
  };

  const handleCreateProduct = async ({ productPayload, buyerPrices }) => {
    try {
      setMessage("");
      const createRes = await productApi.create(productPayload);
      const productId = Number(createRes?.data?.id ?? createRes?.data?.productId ?? 0);

      if (!productId) {
        throw new Error("Product create response did not include product id.");
      }

      await syncBuyerPrices(productId, buyerPrices, []);
      await loadData();
      setShowCreateDialog(false);
      setMessage("Product created successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create product.");
    }
  };

  const handleEditClick = async (product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);

    try {
      const res = await buyerProductPriceApi.getByProductId(product.id);
      const normalized = (res.data || []).map((entry) =>
        normalizeBuyerPrice(entry, buyers, product.id),
      );
      setSelectedProductBuyerPrices(normalized);
    } catch (error) {
      console.warn("Falling back to product embedded buyer prices", error);
      setSelectedProductBuyerPrices(product.buyerPrices || []);
    }
  };

  const handleUpdateProduct = async ({ productPayload, buyerPrices }) => {
    if (!selectedProduct) {
      return;
    }

    try {
      setMessage("");
      await productApi.update(selectedProduct.id, productPayload);
      await syncBuyerPrices(selectedProduct.id, buyerPrices, selectedProductBuyerPrices);
      await loadData();

      setShowEditDialog(false);
      setSelectedProduct(null);
      setSelectedProductBuyerPrices([]);
      setMessage("Product updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      setMessage("");
      await productApi.delete(productId);
      await loadData();
      setMessage("Product deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete product.");
    }
  };

  return (
    <>
      <div className="buyermainarea products-page">
        <h1>Products</h1>

        <div className="products-toolbar">
          <div className="products-filter">
            <label htmlFor="buyerFilter">Filter By Buyer</label>
            <select
              id="buyerFilter"
              value={selectedBuyerFilterId}
              onChange={(event) => setSelectedBuyerFilterId(event.target.value)}
            >
              <option value="">All Buyers</option>
              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.partyName}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={() => setShowCreateDialog(true)}>
            Add Product
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Model Name</th>
              <th>Category</th>
              <th>Default Price</th>
              <th>Buyer Price</th>
              <th>GST (%)</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product, index) => {
              const { defaultPrice, customPrice, effectivePrice } = getEffectivePrice(
                product,
                selectedBuyerFilterId,
              );

              return (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.modelName}</td>
                  <td>{categoryNameById.get(Number(product.categoryId)) || "-"}</td>
                  <td>Rs. {defaultPrice.toFixed(2)}</td>
                  <td>
                    {selectedBuyerFilterId ? (
                      customPrice !== null ? (
                        <>
                          Rs. {customPrice.toFixed(2)}
                          <div className="effective-price-note">
                            Effective: Rs. {effectivePrice.toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="fallback-note">No custom price</span>
                          <div className="effective-price-note">
                            Effective: Rs. {effectivePrice.toFixed(2)}
                          </div>
                        </>
                      )
                    ) : (
                      <span className="fallback-note">Select buyer filter</span>
                    )}
                  </td>
                  <td>{Number(product.gstRate ?? 0).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="editbutton"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="deletebutton"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-products-row">
                  No products found for the selected buyer filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {message && <p className="products-message">{message}</p>}
      </div>

      {showCreateDialog && (
        <ProductDialog
          buyers={buyers}
          categories={categories}
          initialBuyerPrices={[]}
          onSave={handleCreateProduct}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {showEditDialog && selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          buyers={buyers}
          categories={categories}
          initialBuyerPrices={selectedProductBuyerPrices}
          onSave={handleUpdateProduct}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedProduct(null);
            setSelectedProductBuyerPrices([]);
          }}
        />
      )}
    </>
  );
}

export default Products;