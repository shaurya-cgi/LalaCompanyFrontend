import axiosClient from "./axiosClient";

const invoicesApi = {
	getAll: () => axiosClient.get("/invoice"),

	getById: (id) => axiosClient.get(`/invoice/${id}`),

	create: (invoice) => axiosClient.post("/invoice", invoice),

	update: (id, invoice) => axiosClient.put(`/invoice/${id}`, invoice),
};

export default invoicesApi;
