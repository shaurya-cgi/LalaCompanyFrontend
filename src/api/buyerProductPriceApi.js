import axiosClient from "./axiosClient";

const buyerProductPriceApi = {
  getAll: () => axiosClient.get("/buyerproductprices"),

  getById: (id) => axiosClient.get(`/buyerproductprices/${id}`),

  getByProductId: (productId) =>
    axiosClient.get(`/buyerproductprices/product/${productId}`),

  getByBuyerId: (buyerId) => axiosClient.get(`/buyerproductprices/buyer/${buyerId}`),

  create: (payload) => axiosClient.post("/buyerproductprices", payload),

  update: (id, payload) => axiosClient.put(`/buyerproductprices/${id}`, payload),

  delete: (id) => axiosClient.delete(`/buyerproductprices/${id}`),
};

export default buyerProductPriceApi;