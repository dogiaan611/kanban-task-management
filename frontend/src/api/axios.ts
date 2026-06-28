import axios from 'axios';
import toast from 'react-hot-toast';

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

// Interceptor: Xử lý tự động khi Token hết hạn (Lỗi 401)
apiClient.interceptors.response.use(
    (response) => {
        return response; // Trả về bình thường nếu không lỗi
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu backend báo lỗi 401 (Unauthorized - Hết hạn token) và request này chưa từng được thử lại
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu là đang thử lại để tránh lặp vô hạn

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    // Gọi API xin lại Access Token mới bằng Refresh Token
                    const res = await axios.post('http://localhost:8080/api/auth/refreshtoken', {
                        refreshToken: refreshToken
                    });

                    if (res.data && res.data.accessToken) {
                        // Cập nhật lại Access Token mới vào LocalStorage
                        localStorage.setItem('token', res.data.accessToken);

                        // Gắn Access Token mới vào lại cái Request vừa bị lỗi 401 lúc nãy
                        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                        
                        // Gọi lại API đó một lần nữa
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Nếu gọi Refresh Token mà cũng lỗi (Refresh Token hết hạn luôn) -> Đá ra trang Login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                toast.error('Your session has expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Nếu không có Refresh Token hoặc lỗi khác 401, vẫn đá về Login (nếu là 401)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            toast.error('Your session has expired. Please log in again.');
            window.location.href = '/login';
        } else if (error.response) {
            // Global Error Notification
            const message = error.response.data?.message || error.response.data || 'An unexpected error occurred';
            
            // Ignore 404s or specific errors if we don't want to toast them globally, but for now we toast all
            if (error.response.status >= 400 && error.response.status !== 401 && error.response.status !== 404) {
                 toast.error(typeof message === 'string' ? message : 'Error processing request');
            }
        } else {
            toast.error('Network Error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);