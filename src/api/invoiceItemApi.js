import axiosClient from "./axiosClient";

const invoiceItemApi = {
  getAll: () => axiosClient.get("/invoiceitems"),

  getById: (id) => axiosClient.get(`/invoiceitems/${id}`),

  create: (invoiceItem) => axiosClient.post("/invoiceitems", invoiceItem),

  update: (id, invoiceItem) => axiosClient.put(`/invoiceitems/${id}`, invoiceItem),

  delete: (id) => axiosClient.delete(`/invoiceitems/${id}`),
};

export default invoiceItemApi;
