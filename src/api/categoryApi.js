import axiosClient from "./axiosClient";

const categoryApi = {
    getAll: () =>
        axiosClient.get("/category"),

    getById: (id) =>
        axiosClient.get(`/category/${id}`),

    create: (category) =>
        axiosClient.post("/category", category),

    update: (id, category) =>
        axiosClient.put(`/category/${id}`, category),

    delete: (id) =>
        axiosClient.delete(`/category/${id}`)
};

export default categoryApi;