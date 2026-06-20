import { apiClient } from './axios';

// Định nghĩa kiểu dữ liệu trả về từ Backend để TypeScript gợi ý code cho chuẩn
export interface Workspace {
    id: number;
    name: string;
    description: string;
    userRole: string; // Quyền của người dùng hiện tại (VD: ROLE_ADMIN)
    createdAt: string;
}

// Gọi API lấy danh sách Workspace của mình (có tìm kiếm)
export const getWorkspaces = async (q?: string): Promise<Workspace[]> => {
    const params = q ? { q } : {};
    const response = await apiClient.get('/workspaces', { params });
    return response.data;
};

// Gọi API tạo Workspace mới
export const createWorkspace = async (name: string, description: string): Promise<Workspace> => {
    const response = await apiClient.post('/workspaces', { name, description });
    return response.data;
};

// Gọi API xóa Workspace
export const deleteWorkspace = async (id: number): Promise<void> => {
    await apiClient.delete(`/workspaces/${id}`);
};