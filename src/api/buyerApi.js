import axiosClient from "./axiosClient";

export const getAllBuyers = () =>
    axiosClient.get("/buyers");
