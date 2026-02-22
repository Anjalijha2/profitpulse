import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { message } from 'antd';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401s, 403s, 500s
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            const clearAuth = useAuthStore.getState().clearAuth;
            clearAuth();
            message.error('Session expired. Please log in again.');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Dispatch a custom event that the router can catch — don't do full page redirect 
            // as it wipes Zustand's in-memory auth state
            window.dispatchEvent(new CustomEvent('app:forbidden'));
        } else if (error.response?.status === 500) {
            message.error('Server error occurred.');
        } else if (!error.response) {
            message.error('Unable to connect to the server.');
        }
        return Promise.reject(error.response?.data || error);
    }
);
