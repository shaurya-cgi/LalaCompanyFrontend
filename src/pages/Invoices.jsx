import React, { useEffect, useMemo, useState } from "react";
import "./Invoices.css";
import invoicesApi from "../api/invoicesApi";
import invoiceItemApi from "../api/invoiceItemApi";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadInvoices = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await invoicesApi.getAll();
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const resolveInvoiceId = (invoice) => invoice.id ?? invoice.invoiceId;

  const handleOpenEdit = async (invoice) => {
    const id = resolveInvoiceId(invoice);

    if (!id) {
      return;
    }

    try {
      const res = await invoicesApi.getById(id);
      const data = res.data || {};
      const rawItems = data.items || data.invoiceItems || [];
      const buyerName = data.buyerName || invoice.buyerName || "";

      setEditingInvoice({
        id,
        invoiceNo: data.invoiceNo || "",
        invoiceDate: (data.invoiceDate || "").split("T")[0] || "",
        status: data.status || "Pending",
        subtotal: Number(data.subtotal || 0),
        gstAmount: Number(data.gstAmount || 0),
        totalAmount: Number(data.totalAmount || 0),
        buyerName,
        buyerId: data.buyerId,
        items: rawItems.map((item) => ({
          id: item.id ?? item.invoiceItemId,
          productId: item.productId,
          productName: item.productName,
          qty: Number(item.qty || item.quantity || 0),
          rate: Number(item.rate || 0),
          gstRate: Number(item.gstRate || item.gst || 0),
          amount: Number(item.amount || 0),
          gstAmount: Number(item.gstAmount || 0),
          totalAmount: Number(item.totalAmount || item.price || 0),
          isDeleted: false,
        })),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemFieldChange = (index, field, value) => {
    setEditingInvoice((prev) => {
      if (!prev) {
        return prev;
      }

      const updatedItems = [...prev.items];
      const current = { ...updatedItems[index] };

      if (!current) {
        return prev;
      }

      current[field] = value;

      const qty = Number(current.qty || 0);
      const rate = Number(current.rate || 0);
      const gstRate = Number(current.gstRate || 0);
      const amount = Number((qty * rate).toFixed(2));
      const gstAmount = Number((amount * (gstRate / 100)).toFixed(2));
      const totalAmount = Number((amount + gstAmount).toFixed(2));

      current.amount = amount;
      current.gstAmount = gstAmount;
      current.totalAmount = totalAmount;

      updatedItems[index] = current;

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const activeEditItems = useMemo(() => {
    if (!editingInvoice) {
      return [];
    }
    return editingInvoice.items.filter((item) => !item.isDeleted);
  }, [editingInvoice]);

  const editTotals = useMemo(() => {
    let subtotal = 0;
    let gstAmount = 0;

    activeEditItems.forEach((item) => {
      subtotal += Number(item.amount || 0);
      gstAmount += Number(item.gstAmount || 0);
    });

    subtotal = Number(subtotal.toFixed(2));
    gstAmount = Number(gstAmount.toFixed(2));

    return {
      subtotal,
      gstAmount,
      totalAmount: Number((subtotal + gstAmount).toFixed(2)),
    };
  }, [activeEditItems]);

  const handleDeleteEditItem = (index) => {
    setEditingInvoice((prev) => {
      if (!prev) {
        return prev;
      }

      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        isDeleted: true,
      };

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const headerPayload = {
        invoiceNo: editingInvoice.invoiceNo,
        buyerId: editingInvoice.buyerId,
        invoiceDate: editingInvoice.invoiceDate,
        subtotal: editTotals.subtotal,
        gstAmount: editTotals.gstAmount,
        totalAmount: editTotals.totalAmount,
        status: editingInvoice.status,
      };

      await invoicesApi.update(editingInvoice.id, headerPayload);

      const updateCalls = editingInvoice.items.map((item) => {
        const payload = {
          invoiceId: editingInvoice.id,
          productId: item.productId,
          productName: item.productName,
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0),
          amount: Number(item.amount || 0),
          gstRate: Number(item.gstRate || 0),
          gstAmount: Number(item.gstAmount || 0),
          totalAmount: Number(item.totalAmount || 0),
        };

        if (item.isDeleted) {
          return item.id
            ? invoiceItemApi.delete(item.id)
            : Promise.resolve();
        }

        if (item.id) {
          return invoiceItemApi.update(item.id, payload);
        }

        return invoiceItemApi.create(payload);
      });

      await Promise.all(updateCalls);

      setEditingInvoice(null);
      await loadInvoices();
    } catch (err) {
      console.error(err);
      setError("Failed to update invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="content invoices-page">
      <div className="invoices-header">
        <h1>Invoices</h1>
      </div>

      {error && <p className="invoices-error">{error}</p>}

      <table className="invoices-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Buyer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && !isLoading ? (
            <tr>
              <td colSpan={6}>No invoices found.</td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={resolveInvoiceId(invoice)}>
                <td>{invoice.invoiceNo}</td>
                <td>{invoice.buyerName || "-"}</td>
                <td>{(invoice.invoiceDate || "").split("T")[0]}</td>
                <td>₹{Number(invoice.totalAmount || 0).toFixed(2)}</td>
                <td>
                  <span
                    className={`status ${(invoice.status || "pending").toLowerCase()}`}
                  >
                    {invoice.status || "Pending"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    type="button"
                    className="btn-view"
                    onClick={() => handleOpenEdit(invoice)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingInvoice && (
        <div className="edit-dialog-overlay">
          <div className="edit-dialog">
            <h2>Edit Invoice</h2>

            <div className="edit-form-grid">
              <label htmlFor="editInvoiceNo">Invoice No</label>
              <input
                id="editInvoiceNo"
                value={editingInvoice.invoiceNo}
                onChange={(e) =>
                  setEditingInvoice((prev) => ({
                    ...prev,
                    invoiceNo: e.target.value,
                  }))
                }
              />

              <label htmlFor="editInvoiceDate">Invoice Date</label>
              <input
                id="editInvoiceDate"
                type="date"
                value={editingInvoice.invoiceDate}
                onChange={(e) =>
                  setEditingInvoice((prev) => ({
                    ...prev,
                    invoiceDate: e.target.value,
                  }))
                }
              />

              <label htmlFor="editStatus">Status</label>
              <select
                id="editStatus"
                value={editingInvoice.status}
                onChange={(e) =>
                  setEditingInvoice((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>

              <label>Buyer</label>
              <input value={editingInvoice.buyerName || "-"} readOnly />
            </div>

            <table className="edit-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {editingInvoice.items.map((item, index) => {
                  if (item.isDeleted) {
                    return null;
                  }

                  return (
                    <tr key={`${item.id || item.productId}-${index}`}>
                      <td>{item.productName}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemFieldChange(index, "qty", Number(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemFieldChange(
                              index,
                              "rate",
                              Number(e.target.value),
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.gstRate}
                          onChange={(e) =>
                            handleItemFieldChange(
                              index,
                              "gstRate",
                              Number(e.target.value),
                            )
                          }
                        />
                      </td>
                      <td>₹{Number(item.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteEditItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="edit-totals">
              <p>Subtotal: ₹{editTotals.subtotal.toFixed(2)}</p>
              <p>GST: ₹{editTotals.gstAmount.toFixed(2)}</p>
              <p>Grand Total: ₹{editTotals.totalAmount.toFixed(2)}</p>
            </div>

            <div className="edit-actions">
              <button
                type="button"
                onClick={() => setEditingInvoice(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;