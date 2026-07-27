import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import InvoiceTemplate from "../components/InvoiceTemplate";

const GLOBAL_SIGNATURE_URL = "https://lala-company-frontend-bucket.s3.amazonaws.com/signature.png";
const LOCAL_SIGNATURE_URL = `${import.meta.env.BASE_URL}signature.png`;

const blobToDataUrl =
  (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const fetchAsDataUrl = async (url) => {
  if (!url) {
    return "";
  }

  if (String(url).startsWith("data:image")) {
    return String(url);
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return "";
    }

    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return "";
  }
};

const detectImageFormat = (dataUrl) => {
  const normalized = String(dataUrl || "").toLowerCase();
  if (normalized.startsWith("data:image/jpeg") || normalized.startsWith("data:image/jpg")) {
    return "JPEG";
  }

  return "PNG";
};

const getSignatureDataUrl = async () => {
  const remote = await fetchAsDataUrl(GLOBAL_SIGNATURE_URL);
  if (remote) {
    return remote;
  }

  return fetchAsDataUrl(LOCAL_SIGNATURE_URL);
};

const waitForImages = async (container) => {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) {
    return;
  }

  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });

          // Avoid hanging forever on broken image links.
          setTimeout(done, 2500);
        }),
    ),
  );
};

const renderInvoiceCanvas = async ({ company, buyer, invoice, items, showSignature }) => {
  const signatureForPdf = showSignature ? LOCAL_SIGNATURE_URL : "";

  const mountNode = document.createElement("div");
  mountNode.style.position = "fixed";
  mountNode.style.left = "-100000px";
  mountNode.style.top = "0";
  mountNode.style.width = "794px";
  mountNode.style.background = "#ffffff";
  mountNode.style.zIndex = "-1";
  document.body.appendChild(mountNode);

  const root = createRoot(mountNode);

  root.render(
    React.createElement(InvoiceTemplate, {
      company: {
        ...(company || {}),
        signImagePath: signatureForPdf,
      },
      buyer,
      invoice,
      items,
      showSignature,
    }),
  );

  await new Promise((resolve) => setTimeout(resolve, 80));
  await waitForImages(mountNode);

  const canvas = await html2canvas(mountNode, {
    scale: Math.min(2, window.devicePixelRatio || 2),
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  root.unmount();
  if (mountNode.parentNode) {
    mountNode.parentNode.removeChild(mountNode);
  }

  return canvas;
};

const buildPdfFromCanvas = (canvas) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png", 1.0);

  let remaining = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  remaining -= pageHeight;

  while (remaining > 0) {
    position = remaining - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    remaining -= pageHeight;
  }

  return pdf;
};

const createInvoicePdf = async ({ company, buyer, invoice, items, showSignature }) => {
  const canvas = await renderInvoiceCanvas({
    company,
    buyer,
    invoice,
    items: items || invoice?.items || [],
    showSignature,
  });

  const pdf = buildPdfFromCanvas(canvas);

  if (!showSignature) {
    return pdf;
  }

  const signatureDataUrl = await getSignatureDataUrl();
  if (!signatureDataUrl) {
    return pdf;
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const signatureWidth = 44;
  const signatureHeight = 18;
  const x = pageWidth - signatureWidth - 16;
  const y = pageHeight - 63;
  const imageFormat = detectImageFormat(signatureDataUrl);

  const totalPages = pdf.getNumberOfPages();
  pdf.setPage(totalPages);

  try {
    pdf.addImage(
      signatureDataUrl,
      imageFormat,
      x,
      y,
      signatureWidth,
      signatureHeight,
      undefined,
      "FAST",
    );
  } catch {
    pdf.addImage(
      signatureDataUrl,
      imageFormat === "PNG" ? "JPEG" : "PNG",
      x,
      y,
      signatureWidth,
      signatureHeight,
      undefined,
      "FAST",
    );
  }

  return pdf;
};

export const downloadInvoicePdf = async ({ fileName, company, buyer, invoice, items }) => {
  const pdf = await createInvoicePdf({
    company,
    buyer,
    invoice,
    items,
    showSignature: true,
  });

  pdf.save(fileName || "invoice.pdf");
};

export const printInvoicePdf = async ({ company, buyer, invoice, items }) => {
  const pdf = await createInvoicePdf({
    company,
    buyer,
    invoice,
    items,
    showSignature: false,
  });

  const blobUrl = URL.createObjectURL(pdf.output("blob"));
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.src = blobUrl;

  document.body.appendChild(frame);

  frame.onload = () => {
    setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    }, 200);
  };

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    if (frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }
  }, 60000);
};
