import axiosClient from "./axiosClient";

const settingsApi = {
  get: () => axiosClient.get("/settings"),

  update: (payload) => axiosClient.put("/settings", payload),

  uploadSignature: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    return axiosClient
      .put("/settings/signature", formData, config)
      .catch(() => axiosClient.post("/settings/signature", formData, config))
      .catch(() => axiosClient.put("/settings/upload-signature", formData, config))
      .catch(() => axiosClient.post("/settings/upload-signature", formData, config));
  },
};

export default settingsApi;
