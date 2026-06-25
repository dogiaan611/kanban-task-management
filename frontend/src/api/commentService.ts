import { apiClient } from './axios';

export interface Comment {
    id: number;
    content: string;
    userId: number;
    userFullName: string;
    userAvatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export const getCommentsByCard = async (cardId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/card/${cardId}`);
    return response.data;
};

export const addComment = async (cardId: number, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/comments/card/${cardId}`, { content });
    return response.data;
};

export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
    const response = await apiClient.put(`/comments/${commentId}`, { content });
    return response.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
};
