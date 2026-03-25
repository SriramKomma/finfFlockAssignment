import axios from "axios";
import Cookies from "js-cookie";

const isProd = process.env.NODE_ENV === "production";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://taskmaster-backend-z4m7.onrender.com/api/v1" : "http://127.0.0.1:8000/api/v1");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAccessToken = () => Cookies.get("access_token");
export const getRefreshToken = () => Cookies.get("refresh_token");

export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set("access_token", accessToken, { expires: 1 }); // 1 day generic config, actually access is short
  Cookies.set("refresh_token", refreshToken, { expires: 7 }); // 7 days
};

export const clearTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops if refresh fails
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh" && originalRequest.url !== "/auth/login") {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh?refresh_token=${refreshToken}`);
          const { access_token, refresh_token: new_refresh_token } = res.data;
          
          setTokens(access_token, new_refresh_token);
          
          api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
