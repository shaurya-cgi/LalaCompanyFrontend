import axiosClient from "./axiosClient";

const SIGNATURE_FIELD_CANDIDATES = ["file", "signature", "signatureFile"];

const createSignatureFormData = (file, fieldName) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

const withSignatureFieldFallback = async (requestFactory) => {
  let lastError = null;

  for (const fieldName of SIGNATURE_FIELD_CANDIDATES) {
    try {
      return await requestFactory(fieldName);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Signature upload failed.");
};

const settingsApi = {
  get: () => axiosClient.get("/settings"),

  update: (payload) => axiosClient.put("/settings", payload),

  uploadSignature: (file) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    return withSignatureFieldFallback((fieldName) =>
      axiosClient
        .put("/settings/signature", createSignatureFormData(file, fieldName), config)
        .catch(() =>
          axiosClient.post("/settings/signature", createSignatureFormData(file, fieldName), config),
        )
        .catch(() =>
          axiosClient.put(
            "/settings/upload-signature",
            createSignatureFormData(file, fieldName),
            config,
          ),
        )
        .catch(() =>
          axiosClient.post(
            "/settings/upload-signature",
            createSignatureFormData(file, fieldName),
            config,
          ),
        ),
    );
  },
};

export default settingsApi;
