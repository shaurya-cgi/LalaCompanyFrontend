import React from "react";
import "./InvoiceTemplate.css";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-IN");
};

const money = (value) => Number(value || 0).toFixed(2);

const joinParts = (parts) =>
  parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(", ");

const getBuyerAddress = (buyer = {}) =>
  buyer.address ||
  buyer.billingAddress ||
  joinParts([buyer.billingAddress, buyer.city, buyer.state, buyer.pinCode]) ||
  "-";

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const convertBelowThousand = (value) => {
  if (value === 0) {
    return "";
  }

  let text = "";
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundred > 0) {
    text += `${ones[hundred]} Hundred`;
    if (remainder > 0) {
      text += " ";
    }
  }

  if (remainder < 20) {
    text += ones[remainder];
  } else {
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    text += tens[ten];
    if (one > 0) {
      text += ` ${ones[one]}`;
    }
  }

  return text.trim();
};

const numberToIndianWords = (value) => {
  const number = Math.floor(Number(value || 0));

  if (number === 0) {
    return "Rupees Zero Only";
  }

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const hundred = number % 1000;

  const parts = [];

  if (crore > 0) {
    parts.push(`${convertBelowThousand(crore)} Crore`);
  }

  if (lakh > 0) {
    parts.push(`${convertBelowThousand(lakh)} Lakh`);
  }

  if (thousand > 0) {
    parts.push(`${convertBelowThousand(thousand)} Thousand`);
  }

  if (hundred > 0) {
    parts.push(convertBelowThousand(hundred));
  }

  return `Rupees ${parts.join(" ").trim()} Only`;
};

function InvoiceTemplate({
  company,
  buyer,
  invoice,
  items,
  showSignature,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = Number(invoice?.subtotal || 0);
  const gstAmount = Number(invoice?.gstAmount || 0);
  const grandTotal = Number(invoice?.totalAmount || subtotal + gstAmount);

  return (
    <div className="invoice-a4-root">
      <header className="invoice-header">
        <div className="invoice-logo-wrap">
          {company?.logoUrl ? <img src={company.logoUrl} alt="Company Logo" className="invoice-logo" /> : null}
        </div>
        <div className="invoice-company-block">
          <h1>{company?.companyName || "Company Name"}</h1>
          <p>{company?.address || company?.billingAddress || "-"}</p>
          <p>{joinParts([company?.city, company?.state, company?.pinCode]) || "-"}</p>
          <p>GSTIN: {company?.gstin || "-"}</p>
          <p>Mobile: {company?.phone || company?.mobile || "-"}</p>
          <p>Email: {company?.email || "-"}</p>
        </div>
      </header>

      <section className="invoice-title-section">
        <h2>TAX INVOICE</h2>
      </section>

      <section className="invoice-meta-grid">
        <div className="meta-left">
          <h3>Bill To</h3>
          <p><strong>Name:</strong> {buyer?.name || buyer?.partyName || "-"}</p>
          <p><strong>GSTIN:</strong> {buyer?.gstin || "-"}</p>
          <p><strong>Billing Address:</strong> {getBuyerAddress(buyer)}</p>
          <p><strong>City:</strong> {buyer?.city || "-"}</p>
          <p><strong>State:</strong> {buyer?.state || "-"}</p>
          <p><strong>Pincode:</strong> {buyer?.pinCode || "-"}</p>
        </div>
        <div className="meta-right">
          <p><strong>Invoice No:</strong> {invoice?.invoiceNo || "-"}</p>
          <p><strong>Invoice Date:</strong> {formatDate(invoice?.invoiceDate)}</p>
        </div>
      </section>

      <section>
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>GST %</th>
              <th>GST Amount</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, index) => {
              const qty = Number(item.qty ?? item.quantity ?? 0);
              const rate = Number(item.rate || 0);
              const gstRate = Number(item.gstRate ?? item.gst ?? 0);
              const amount = Number(item.amount ?? qty * rate);
              const lineGst = Number(item.gstAmount ?? (amount * gstRate) / 100);
              const lineTotal = Number(item.totalAmount ?? amount + lineGst);

              return (
                <tr key={`${item.id || item.productId || index}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.productName || "-"}</td>
                  <td className="cell-right">{qty.toFixed(2)}</td>
                  <td className="cell-right">{money(rate)}</td>
                  <td className="cell-right">{gstRate.toFixed(2)}%</td>
                  <td className="cell-right">{money(lineGst)}</td>
                  <td className="cell-right">{money(lineTotal)}</td>
                </tr>
              );
            })}
            {safeItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">No items</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className="invoice-totals-wrap">
        <div className="invoice-totals">
          <p><span>Sub Total</span><strong>{money(subtotal)}</strong></p>
          <p><span>GST Amount</span><strong>{money(gstAmount)}</strong></p>
          <p className="grand-total"><span>Grand Total</span><strong>{money(grandTotal)}</strong></p>
        </div>
      </section>

      <section className="amount-words">
        <p><strong>Amount in Words:</strong> {numberToIndianWords(grandTotal)}</p>
      </section>

      <section className="invoice-bank-section">
        <h3>Bank Details</h3>
        <p><strong>Bank Name:</strong> {company?.bankName || "-"}</p>
        <p><strong>Account Number:</strong> {company?.accountNumber || company?.accNumber || "-"}</p>
        <p><strong>IFSC Code:</strong> {company?.ifsc || company?.ifscCode || "-"}</p>
      </section>

      <section className="invoice-bottom-row">
        <div className="declaration-box">
          <h3>Declaration</h3>
          <p>Certified that the particulars given above are true and correct.</p>
        </div>
        <div className="signature-box">
          {showSignature && company?.signatureUrl ? (
            <img src={company.signatureUrl} alt="Authorized Signature" className="signature-image" />
          ) : (
            <div className="signature-placeholder" />
          )}
          <p>Authorized Signatory</p>
        </div>
      </section>

      <footer className="invoice-footer">
        <p>Thank you for your business.</p>
      </footer>
    </div>
  );
}

export default InvoiceTemplate;
