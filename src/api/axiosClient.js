import axios from "axios";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getWindowOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "";

const defaultApiBaseUrl =
    "https://localhost:7034/api";

    
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

console.log("API_BASE_URL", API_BASE_URL);
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;