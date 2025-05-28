import { logout } from '@/utils/storage';
import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const client = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

const TokenInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.headers) {
        config.headers.Authorization = `Bearer ${localStorage.token}`;
    }
    return config;
};

const ResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
    return response.data;
};

const ErrorInterceptor = (error: AxiosError) => {
    const data = error.response ? error.response.data : null;

    if (error?.response?.status === 403) {
        logout();
		return (window.location.href = '/login');
    }

    return Promise.reject(data || error.message);
};

client.interceptors.request.use(TokenInterceptor);
client.interceptors.response.use(ResponseInterceptor, ErrorInterceptor);

export default client;
