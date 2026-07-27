import axios from "axios";

export const API_BASE_URL = "https://localhost:7034/api";
export const API_ORIGIN = "https://localhost:7034";

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;