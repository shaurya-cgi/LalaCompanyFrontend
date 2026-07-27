import React, { useEffect, useState } from "react";
import "./Settings.css";
import companyApi from "../api/companyApi";
import { API_ORIGIN } from "../api/axiosClient";

const defaultForm = {
  companyName: "",
  address: "",
  phone: "",
  email: "",
  gstin: "",
  state: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
};

const resolveAssetUrl = (value) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
};

const normalizeCompanyRecord = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  return payload || null;
};

const toCompanyPayload = (companyId, formData) => ({
  ...(companyId ? { id: companyId } : {}),
  companyName: formData.companyName,
  gstin: formData.gstin,
  mobile: formData.phone,
  email: formData.email,
  billingAddress: formData.address,
  state: formData.state,
  bankName: formData.bankName,
  ifscCode: formData.ifsc,
  accNumber: formData.accountNumber,
});

function Settings() {
  const [companyId, setCompanyId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const res = await companyApi.get();
      const settings = normalizeCompanyRecord(res.data) || {};

      setCompanyId(settings.id ?? null);

      setFormData({
        companyName: settings.companyName || "",
        address: settings.address || settings.billingAddress || "",
        phone: settings.phone || settings.mobile || "",
        email: settings.email || "",
        gstin: settings.gstin || "",
        state: settings.state || "",
        bankName: settings.bankName || "",
        accountNumber: settings.accountNumber || settings.accNumber || "",
        ifsc: settings.ifsc || settings.ifscCode || "",
      });

      setSignatureUrl(
        resolveAssetUrl(
          settings.signatureUrl || settings.signaturePath || settings.signImagePath || "",
        ),
      );
    } catch (error) {
      console.error(error);
      setMessage("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const payload = toCompanyPayload(companyId, formData);

      if (companyId) {
        await companyApi.update(companyId, payload);
      } else {
        const createRes = await companyApi.create(payload);
        const created = normalizeCompanyRecord(createRes.data);
        setCompanyId(created?.id ?? null);
      }

      setMessage("Settings saved successfully.");
      await loadSettings();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSignature = async () => {
    if (!selectedSignature) {
      alert("Please choose a signature image first.");
      return;
    }

    setIsUploadingSignature(true);
    setMessage("");

    try {
      let activeCompanyId = companyId;

      if (!activeCompanyId) {
        const createRes = await companyApi.create(toCompanyPayload(null, formData));
        const created = normalizeCompanyRecord(createRes.data);
        activeCompanyId = created?.id ?? null;
        setCompanyId(activeCompanyId);
      }

      if (!activeCompanyId) {
        throw new Error("Company settings must be created before signature upload.");
      }

      const uploadRes = await companyApi.uploadSignature(activeCompanyId, selectedSignature);
      const uploadedPath =
        uploadRes?.data?.signatureUrl ||
        uploadRes?.data?.signaturePath ||
        uploadRes?.data?.signImagePath ||
        uploadRes?.data?.path ||
        "";

      if (uploadedPath) {
        setSignatureUrl(resolveAssetUrl(uploadedPath));
      }

      setSelectedSignature(null);
      setMessage("Signature updated successfully.");
      await loadSettings();
    } catch (error) {
      console.error(error);
      setMessage("Failed to upload signature.");
    } finally {
      setIsUploadingSignature(false);
    }
  };

  return (
    <div className="content settings-page">
      <h1>Settings</h1>

      {message && <p className="settings-message">{message}</p>}

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-grid">
          <label htmlFor="companyName">Company Name</label>
          <input id="companyName" value={formData.companyName} onChange={handleChange} />

          <label htmlFor="address">Address</label>
          <textarea id="address" rows={3} value={formData.address} onChange={handleChange} />

          <label htmlFor="phone">Phone</label>
          <input id="phone" value={formData.phone} onChange={handleChange} />

          <label htmlFor="email">Email</label>
          <input id="email" value={formData.email} onChange={handleChange} />

          <label htmlFor="gstin">GSTIN</label>
          <input id="gstin" value={formData.gstin} onChange={handleChange} />

          <label htmlFor="state">State</label>
          <input id="state" value={formData.state} onChange={handleChange} />

          <label htmlFor="bankName">Bank Name</label>
          <input id="bankName" value={formData.bankName} onChange={handleChange} />

          <label htmlFor="accountNumber">Account Number</label>
          <input id="accountNumber" value={formData.accountNumber} onChange={handleChange} />

          <label htmlFor="ifsc">IFSC</label>
          <input id="ifsc" value={formData.ifsc} onChange={handleChange} />

        </div>

        <div className="settings-actions">
          <button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <section className="signature-card">
        <h2>Signature Management</h2>

        <div className="signature-preview-wrap">
          <p>Current Signature Preview</p>
          {signatureUrl ? (
            <img src={signatureUrl} alt="Current Signature" className="signature-preview" />
          ) : (
            <p>No signature uploaded.</p>
          )}
        </div>

        <div className="signature-upload-row">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setSelectedSignature(event.target.files?.[0] || null)}
          />
          <button
            type="button"
            disabled={isUploadingSignature || !selectedSignature}
            onClick={handleUploadSignature}
          >
            {isUploadingSignature ? "Uploading..." : "Upload New Signature"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;