import React, { useState, useEffect } from "react";
import "./Home.css";
import ItemDialog from "../components/ItemDialog.jsx";
import buyerApi from "../api/buyerApi.js";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi.js";

function Home() {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [items, setItems] = useState([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [invoiceNo, setInvoiceNo] = useState("");

  const addItem = (newItem) => {
    setItems((prev) => [...prev, newItem]);
    setShowItemDialog(false);
  };
  useEffect(() => {
    buyerApi
      .getAll()
      .then((res) => {
        setBuyers(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const selectedBuyer = buyers.find(
    (buyer) => buyer.id === Number(selectedBuyerId),
  );

  const billingAddress = selectedBuyer
    ? `${selectedBuyer.billingAddress}, ${selectedBuyer.city}, ${selectedBuyer.state} - ${selectedBuyer.pinCode}`
    : "";

  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));

    productApi
      .getAll()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddItem = (item) => {
    setItems((prev) => [...prev, item]);
    setShowItemDialog(false);
  };

  useEffect(() => {
    const newInvoiceNo = items.length + 1;
    setInvoiceNo(newInvoiceNo);
  }, [items]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const baseAmount = item.rate * item.quantity;
      const gstAmount = baseAmount * (item.gst / 100);
      subtotal += baseAmount;
      totalGst += gstAmount;
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(totalGst.toFixed(2)),
      grandTotal: parseFloat((subtotal + totalGst).toFixed(2)),
    };
  };

  const totals = calculateTotals();
      const increaseQuantity = (index) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: item.quantity + 1,
                price: Number(
                  (
                    item.rate *
                    (item.quantity + 1) *
                    (1 + item.gst / 100)
                  ).toFixed(2),
                ),
              }
            : item,
        ),
      );
    };

    const decreaseQuantity = (index) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: Math.max(1, item.quantity - 1),
                price: Number(
                  (
                    item.rate *
                    Math.max(1, item.quantity - 1) *
                    (1 + item.gst / 100)
                  ).toFixed(2),
                ),
              }
            : item,
        ),
      );
    };

    const removeItem = (index) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    };



  return (
    <>
      <div className="billingarea">
        <h1>Generate Invoice</h1>
        <h3>Enter details for Invoice</h3>
        <div className="buyerinvoicedetails">
          <div className="buyerdetails">
            <label htmlFor="buyers" className="buyerselect">
              Select Buyer:
            </label>
            <select
              id="buyer"
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
            >
              <option value="">Select Buyer</option>
              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.partyName}
                </option>
              ))}
            </select>
            <label htmlFor="gstin">GSTIN</label>
            <input
              type="text"
              readOnly
              className="gstin"
              placeholder="Enter GSTIN"
              value={selectedBuyer?.gstin || ""}
            ></input>

            <label htmlFor="billingaddress">Billing Address</label>
            <textarea
              className="billingaddress"
              readOnly
              rows={3}
              placeholder="Enter billing address"
              value={billingAddress}
            ></textarea>
          </div>
          <div className="invoicedetails">
            <label htmlFor="invoiceno">Invoice No.</label>
            <input
              type="text"
              id="invoiceno"
              className="invoiceno"
              placeholder="Enter Invoice No."
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />

            <label htmlFor="invoicedate">Invoice Date</label>
            <input
              type="date"
              id="invoicedate"
              className="invoicedate"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>
        <div className="items">
          <table>
            <thead>
              <tr>
                <th>S.no</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>GstRate</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.productName}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(index)}
                    >
                      -
                    </button>

                    <span style={{ margin: "0 10px" }}>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(index)}
                    >
                      +
                    </button>
                  </td>
                  <td>₹{item.rate.toFixed(2)}</td>
                  <td>{item.gst}%</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={6}>
                  <button onClick={() => setShowItemDialog(true)}>
                    + Add Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="totaltable">
            <table>
              <tbody>
                <tr>
                  <th>SubTotal</th>
                  <td>₹{totals.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>GST</th>
                  <td>₹{totals.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Grand Total</th>
                  <td>₹{totals.grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="generateinvoice">
          <button className="printinvoice">Print Invoice</button>
          <button className="downloadinvoice">Download Invoice</button>
        </div>
      </div>
      {showItemDialog && (
        <ItemDialog
          categories={categories}
          products={products}
          onSave={handleAddItem}
          onClose={() => setShowItemDialog(false)}
        />
      )}
    </>
  );
}

export default Home;
