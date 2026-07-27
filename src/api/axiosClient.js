import axios from "axios";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getWindowOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "";

const defaultApiBaseUrl =
    "http://ec2-35-175-222-129.compute-1.amazonaws.com:5000/api";

export const API_BASE_URL = trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
);

export const API_ORIGIN = (() => {
    try {
        const resolved = new URL(API_BASE_URL, getWindowOrigin() || "http://localhost");
        return resolved.origin;
    } catch {
        return getWindowOrigin();
    }
})();

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;