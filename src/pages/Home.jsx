import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import ItemDialog from "../components/ItemDialog.jsx";
import buyerApi from "../api/buyerApi.js";
import productApi from "../api/productApi.js";
import categoryApi from "../api/categoryApi.js";
import invoicesApi from "../api/invoicesApi.js";
import invoiceItemApi from "../api/invoiceItemApi.js";
import companyApi from "../api/companyApi.js";
import { downloadInvoicePdf, printInvoicePdf } from "../utils/invoicePdf";

const GLOBAL_SIGNATURE_URL = "https://lala-company-frontend-bucket.s3.amazonaws.com/signature.png";

const normalizeBuyerPrice = (entry) => ({
  id: entry.id,
  buyerId: Number(entry.buyerId),
  buyerName: entry.buyerName || entry.partyName || "",
  rate: Number(entry.rate ?? entry.customPrice ?? 0),
});

const normalizeProduct = (product) => ({
  ...product,
  gstRate: Number(product.gstRate ?? product.gstrate ?? 0),
  buyerPrices: Array.isArray(product.buyerPrices)
    ? product.buyerPrices.map(normalizeBuyerPrice)
    : Array.isArray(product.buyerProductPrices)
      ? product.buyerProductPrices.map(normalizeBuyerPrice)
      : [],
});

const normalizeCompanyRecord = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  return payload || null;
};
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
  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${Date.now().toString().slice(-6)}`,
  );
  const [invoiceId, setInvoiceId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [companySettings, setCompanySettings] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState("");

  useEffect(() => {
    Promise.all([
      buyerApi.getAll(),
      categoryApi.getAll(),
      productApi.getAll(),
      companyApi.get().catch(() => ({ data: null })),
    ])
      .then(([buyersRes, categoriesRes, productsRes, companyRes]) => {
        setBuyers(buyersRes.data || []);
        setCategories(categoriesRes.data || []);
        setProducts((productsRes.data || []).map(normalizeProduct));

        const loadedCompany = normalizeCompanyRecord(companyRes.data);
        setCompanySettings(loadedCompany);
        setSignatureUrl(GLOBAL_SIGNATURE_URL);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load buyers/products/categories.");
        setSignatureUrl(GLOBAL_SIGNATURE_URL);
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

  const buildInvoicePdfPayload = (savedId) => ({
    invoice: {
      id: savedId,
      invoiceNo,
      invoiceDate,
      subtotal: totals.subtotal,
      gstAmount: totals.tax,
      totalAmount: totals.grandTotal,
      items: items.map((item) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const gstRate = Number(item.gst || 0);
        const amount = Number((qty * rate).toFixed(2));
        const gstAmount = Number((amount * (gstRate / 100)).toFixed(2));

        return {
          productName: item.productName,
          qty,
          rate,
          gstRate,
          amount,
          gstAmount,
          totalAmount: Number((amount + gstAmount).toFixed(2)),
        };
      }),
    },
    company: {
      ...(companySettings || {}),
      signImagePath: signatureUrl,
    },
    buyer: {
      name: selectedBuyer?.partyName,
      gstin: selectedBuyer?.gstin,
      address: billingAddress,
      city: selectedBuyer?.city,
      state: selectedBuyer?.state,
      pinCode: selectedBuyer?.pinCode,
      billingAddress: selectedBuyer?.billingAddress,
    },
    items: items.map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const gstRate = Number(item.gst || 0);
      const amount = Number((qty * rate).toFixed(2));
      const gstAmount = Number((amount * (gstRate / 100)).toFixed(2));

      return {
        productName: item.productName,
        qty,
        rate,
        gstRate,
        amount,
        gstAmount,
        totalAmount: Number((amount + gstAmount).toFixed(2)),
      };
    }),
    signImagePath: signatureUrl,
  });

  const handlePrintInvoice = async () => {
    const savedId = await ensureInvoiceSaved();
    if (!savedId) {
      return;
    }

    try {
      setMessage("Preparing invoice print...");
      await printInvoicePdf(buildInvoicePdfPayload(savedId));
      setMessage("Invoice sent to printer.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to print invoice.");
    }
  };

  const handleDownloadInvoice = async () => {
    const savedId = await ensureInvoiceSaved();
    if (!savedId) {
      return;
    }

    try {
      setMessage("Preparing invoice PDF...");
      await downloadInvoicePdf({
        ...buildInvoicePdfPayload(savedId),
        fileName: `invoice-${invoiceNo || savedId}.pdf`,
      });
      setMessage("Invoice PDF downloaded.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to download invoice PDF.");
    }
  };



  return (
    <>
      <div className="billingarea invoice-document">
        <h1>Generate Invoice</h1>
        {companySettings?.companyName && <h3>{companySettings.companyName}</h3>}
        {(companySettings?.address || companySettings?.billingAddress) && (
          <p>{companySettings?.address || companySettings?.billingAddress}</p>
        )}
        {(companySettings?.phone || companySettings?.mobile || companySettings?.email) && (
          <p>
            {[companySettings?.phone || companySettings?.mobile, companySettings?.email]
              .filter(Boolean)
              .join(" | ")}
          </p>
        )}
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
          <div className="table-scroll">
            <table className="invoice-items-table">
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
          </div>
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
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt="Authorized Signature"
              className="signature-image"
            />
          ) : (
            <p>Signature not uploaded.</p>
          )}
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
