import { API_ORIGIN } from "../api/axiosClient";

const SIGNATURE_FIELD_CANDIDATES = [
  "signatureUrl",
  "signaturePath",
  "signImagePath",
  "signature",
  "signUrl",
  "path",
  "url",
];

const NESTED_SOURCE_CANDIDATES = ["data", "company", "settings", "result", "item", "payload"];

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const EMBEDDED_URL_PATTERN = /^(?:data:|blob:)/i;

const getNonEmptyString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getWindowOrigin = () =>
  typeof window !== "undefined" ? getNonEmptyString(window.location.origin) : "";

export const extractSignatureValue = (source) => {
  if (!source || typeof source !== "object") {
    return "";
  }

  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const key of SIGNATURE_FIELD_CANDIDATES) {
      const candidate = getNonEmptyString(current[key]);
      if (candidate) {
        return candidate;
      }
    }

    for (const nestedKey of NESTED_SOURCE_CANDIDATES) {
      const nested = current[nestedKey];
      if (nested && typeof nested === "object") {
        queue.push(nested);
      }
    }
  }

  return "";
};

export const resolveAssetUrl = (value) => {
  const pathOrUrl = getNonEmptyString(value);

  if (!pathOrUrl) {
    return "";
  }

  if (EMBEDDED_URL_PATTERN.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
    if (pathOrUrl.startsWith("//")) {
      const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
      return `${protocol}${pathOrUrl}`;
    }

    return pathOrUrl;
  }

  const baseOrigin = getNonEmptyString(API_ORIGIN) || getWindowOrigin();

  if (!baseOrigin) {
    return pathOrUrl;
  }

  return `${baseOrigin.replace(/\/+$/, "")}/${pathOrUrl.replace(/^\/+/, "")}`;
};
