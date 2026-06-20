import { apiClient } from './axios';

export interface Board {
    id: number;
    workspaceId: number;
    name: string;
    createdAt: string;
}

// Gọi API lấy danh sách Board nằm trong một Workspace cụ thể
export const getBoardsByWorkspace = async (workspaceId: number): Promise<Board[]> => {
    const response = await apiClient.get(`/boards/workspace/${workspaceId}`);
    return response.data;
};

// Gọi API tạo Board mới
export const createBoard = async (workspaceId: number, name: string): Promise<Board> => {
    const response = await apiClient.post('/boards', { workspaceId, name });
    return response.data;
};

// Gọi API xóa Board
export const deleteBoard = async (id: number): Promise<void> => {
    await apiClient.delete(`/boards/${id}`);
};