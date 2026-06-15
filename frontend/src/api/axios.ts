import axios from 'axios';

// Tạo một instance axios với cấu hình mặc định
export const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Địa chỉ Backend của chúng ta
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động đính kèm Token (nếu có) vào mọi Request gửi đi
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);