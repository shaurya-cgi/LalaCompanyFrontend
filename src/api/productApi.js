import axiosClient from "./axiosClient";

const productApi = {
    getAll: () =>
        axiosClient.get("/products"),

    getById: (id) =>
        axiosClient.get(`/products/${id}`),

    create: (product) =>
        axiosClient.post("/products", product),

    update: (id, product) =>
        axiosClient.put(`/products/${id}`, product),

    delete: (id) =>
        axiosClient.delete(`/products/${id}`)
};

export default productApi;