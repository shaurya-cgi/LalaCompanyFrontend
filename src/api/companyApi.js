import axiosClient from "./axiosClient";

const companyApi = {
  get: () => axiosClient.get("/company"),

  create: (data) => axiosClient.post("/company", data),

  update: (id, data) => axiosClient.put(`/company/${id}`, data),

  uploadSignature: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post(`/company/${id}/signature`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default companyApi;
