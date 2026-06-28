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

// Gọi API lấy thông tin một Board cụ thể
export const getBoardById = async (id: number): Promise<Board> => {
    const response = await apiClient.get(`/boards/${id}`);
    return response.data;
};

export interface BoardMember {
    id: number;
    userId: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

export const getBoardMembers = async (boardId: number): Promise<BoardMember[]> => {
    const response = await apiClient.get(`/boards/${boardId}/members`);
    return response.data;
};

export const addBoardMember = async (boardId: number, email: string): Promise<BoardMember> => {
    const response = await apiClient.post(`/boards/${boardId}/members`, { email });
    return response.data;
};

export const removeBoardMember = async (boardId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${userId}`);
};

export const updateBoardMemberRole = async (boardId: number, userId: number, role: string): Promise<void> => {
    await apiClient.put(`/boards/${boardId}/members/${userId}/role`, { role });
};