import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Home.css";
import ItemDialog from "../components/ItemDialog.jsx";
import buyerApi from "../api/buyerApi.js";
import productApi from "../api/productApi.js";
import categoryApi from "../api/categoryApi.js";
import invoicesApi from "../api/invoicesApi.js";
import invoiceItemApi from "../api/invoiceItemApi.js";
import signatureImage from "../assets/signature.jpg";

function Home() {
  const invoiceRef = useRef(null);

  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [items, setItems] = useState([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${Date.now().toString().slice(-6)}`,
  );
  const [invoiceId, setInvoiceId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([buyerApi.getAll(), categoryApi.getAll(), productApi.getAll()])
      .then(([buyersRes, categoriesRes, productsRes]) => {
        setBuyers(buyersRes.data || []);
        setCategories(categoriesRes.data || []);
        setProducts(productsRes.data || []);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load buyers/products/categories.");
      });
  }, []);

  const selectedBuyer = buyers.find(
    (buyer) => buyer.id === Number(selectedBuyerId),
  );

  const billingAddress = selectedBuyer
    ? `${selectedBuyer.billingAddress}, ${selectedBuyer.city}, ${selectedBuyer.state} - ${selectedBuyer.pinCode}`
    : "";

  const handleAddItem = (item) => {
    setItems((prev) => [...prev, item]);
    setInvoiceId(null);
    setShowItemDialog(false);
  };

  const handleOpenItemDialog = () => {
    if (!selectedBuyerId) {
      alert("Select a buyer before adding invoice items.");
      return;
    }

    setShowItemDialog(true);
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const gstRate = Number(item.gst || 0);
      const baseAmount = rate * qty;
      const gstAmount = baseAmount * (gstRate / 100);

      subtotal += baseAmount;
      totalGst += gstAmount;
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(totalGst.toFixed(2)),
      grandTotal: parseFloat((subtotal + totalGst).toFixed(2)),
    };
  }, [items]);

  const recalculateItemPrice = (item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    const gstRate = Number(item.gst || 0);
    return Number((rate * qty * (1 + gstRate / 100)).toFixed(2));
  };

  const increaseQuantity = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Number(item.quantity) + 1,
              price: recalculateItemPrice({
                ...item,
                quantity: Number(item.quantity) + 1,
              }),
            }
          : item,
      ),
    );
    setInvoiceId(null);
  };

  const decreaseQuantity = (index) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        const nextQty = Math.max(1, Number(item.quantity) - 1);

        return {
          ...item,
          quantity: nextQty,
          price: recalculateItemPrice({ ...item, quantity: nextQty }),
        };
      }),
    );
    setInvoiceId(null);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setInvoiceId(null);
  };

  const buildInvoicePayload = () => ({
    invoiceNo,
    buyerId: Number(selectedBuyerId),
    invoiceDate,
    subtotal: totals.subtotal,
    gstAmount: totals.tax,
    totalAmount: totals.grandTotal,
    status: "Pending",
  });

  const buildInvoiceItemsPayload = (savedInvoiceId) =>
    items.map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const gstRate = Number(item.gst || 0);
      const amount = Number((qty * rate).toFixed(2));
      const gstAmount = Number((amount * (gstRate / 100)).toFixed(2));

      return {
        invoiceId: savedInvoiceId,
        productId: Number(item.productId),
        productName: item.productName,
        qty,
        rate,
        amount,
        gstRate,
        gstAmount,
        totalAmount: Number((amount + gstAmount).toFixed(2)),
      };
    });

  const saveInvoice = async () => {
    if (!selectedBuyerId) {
      alert("Please select a buyer before saving.");
      return null;
    }

    if (items.length === 0) {
      alert("Please add at least one item before saving.");
      return null;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const invoiceRes = await invoicesApi.create(buildInvoicePayload());
      const savedInvoiceId =
        invoiceRes?.data?.id ?? invoiceRes?.data?.invoiceId ?? null;

      if (!savedInvoiceId) {
        throw new Error("Invoice saved but no invoice id was returned.");
      }

      const invoiceItemsPayload = buildInvoiceItemsPayload(savedInvoiceId);
      await Promise.all(
        invoiceItemsPayload.map((invoiceItem) =>
          invoiceItemApi.create(invoiceItem),
        ),
      );

      setInvoiceId(savedInvoiceId);
      setMessage(`Invoice saved successfully (ID: ${savedInvoiceId}).`);
      return savedInvoiceId;
    } catch (error) {
      console.error(error);
      setMessage("Failed to save invoice.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const ensureInvoiceSaved = async () => {
    if (invoiceId) {
      return invoiceId;
    }

    return saveInvoice();
  };

  const handlePrintInvoice = async () => {
    const savedId = await ensureInvoiceSaved();
    if (!savedId) {
      return;
    }

    window.print();
  };

  const handleDownloadInvoice = async () => {
    const savedId = await ensureInvoiceSaved();
    if (!savedId || !invoiceRef.current) {
      return;
    }

    try {
      setMessage("Preparing invoice PDF...");
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoiceNo || savedId}.pdf`);
      setMessage("Invoice PDF downloaded.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to download invoice PDF.");
    }
  };



  return (
    <>
      <div className="billingarea invoice-document" ref={invoiceRef}>
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
                  <td>₹{Number(item.rate || 0).toFixed(2)}</td>
                  <td>{item.gst}%</td>
                  <td>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={6}>
                  <button onClick={handleOpenItemDialog}>
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
        <div className="signature-section print-hide-signature">
          <p>Authorized Signature</p>
          <img
            src={signatureImage}
            alt="Authorized Signature"
            className="signature-image"
          />
        </div>
        <div className="generateinvoice no-print">
          <button
            className="saveinvoice"
            type="button"
            disabled={isSaving}
            onClick={saveInvoice}
          >
            {isSaving ? "Saving..." : "Save Invoice"}
          </button>
          <button
            className="printinvoice"
            type="button"
            disabled={isSaving}
            onClick={handlePrintInvoice}
          >
            Print Invoice
          </button>
          <button
            className="downloadinvoice"
            type="button"
            disabled={isSaving}
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </button>
        </div>
        {message && <p className="invoice-message no-print">{message}</p>}
      </div>
      {showItemDialog && (
        <ItemDialog
          categories={categories}
          products={products}
          selectedBuyerId={selectedBuyerId}
          onSave={handleAddItem}
          onClose={() => setShowItemDialog(false)}
        />
      )}
    </>
  );
}

export default Home;
