import axiosClient from "./axiosClient";

const buyerProductPriceApi = {
    getAll: () =>
        axiosClient.get("/buyerproductprices"),

    getById: (id) =>
        axiosClient.get(`/buyerproductprices/${id}`),

    getByBuyer: (buyerId) =>
        axiosClient.get(`/buyerproductprices/buyer/${buyerId}`),

    getByProduct: (productId) =>
        axiosClient.get(`/buyerproductprices/product/${productId}`),

    getByProductId: (productId) =>
        axiosClient.get(`/buyerproductprices/product/${productId}`),

    create: (data) =>
        axiosClient.post("/buyerproductprices", data),

    update: (id, data) =>
        axiosClient.put(`/buyerproductprices/${id}`, data),

    delete: (id) =>
        axiosClient.delete(`/buyerproductprices/${id}`)
};

export default buyerProductPriceApi;