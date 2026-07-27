import axiosClient from "./axiosClient";

const SIGNATURE_FIELD_CANDIDATES = ["file", "signature", "signatureFile"];

const createSignatureFormData = (file, fieldName) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};

const uploadWithCandidateFields = async (requestFactory) => {
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

const companyApi = {
  get: () => axiosClient.get("/company"),

  create: (data) => axiosClient.post("/company", data),

  update: (id, data) => axiosClient.put(`/company/${id}`, data),

  uploadSignature: (id, file) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    return uploadWithCandidateFields((fieldName) =>
      axiosClient
        .post(`/company/${id}/signature`, createSignatureFormData(file, fieldName), config)
        .catch(() =>
          axiosClient.put(`/company/${id}/signature`, createSignatureFormData(file, fieldName), config),
        )
        .catch(() =>
          axiosClient.post(
            `/company/${id}/upload-signature`,
            createSignatureFormData(file, fieldName),
            config,
          ),
        )
        .catch(() =>
          axiosClient.put(
            `/company/${id}/upload-signature`,
            createSignatureFormData(file, fieldName),
            config,
          ),
        ),
    );
  },
};

export default companyApi;
