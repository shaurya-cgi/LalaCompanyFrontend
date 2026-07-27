import axiosClient from "./axiosClient";

const buyerApi = {
    getAll: () =>
        axiosClient.get("/buyers"),

    getById: (id) =>
        axiosClient.get(`/buyers/${id}`),

    create: (buyer) =>
        axiosClient.post("/buyers", buyer),

    update: (id, buyer) =>
        axiosClient.put(`/buyers/${id}`, buyer),

    delete: (id) =>
        axiosClient.delete(`/buyers/${id}`)
};

export default buyerApi;