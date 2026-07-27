import axiosClient from "./axiosClient";

const companyApi = {
  get: () => axiosClient.get("/company"),

  create: (data) => axiosClient.post("/company", data),

  update: (id, data) => axiosClient.put(`/company/${id}`, data),
};

export default companyApi;
