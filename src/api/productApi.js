import axiosClient from "./axiosClient";

const productApi = {
    getAll: () =>
        axiosClient.get("/products"),

    getById: (id) =>
        axiosClient.get(`/products/${id}`),

    create: (data) =>
        axiosClient.post("/products", data),

    update: (id, data) =>
        axiosClient.put(`/products/${id}`, data),

    delete: (id) =>
        axiosClient.delete(`/products/${id}`)
};

export default productApi;