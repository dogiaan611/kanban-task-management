import { apiClient } from './axios';

export interface Tag {
    id: number;
    name: string;
    color: string;
}

export const getTagsByBoard = async (boardId: number): Promise<Tag[]> => {
    const response = await apiClient.get(`/tags/board/${boardId}`);
    return response.data;
};

export const createTag = async (boardId: number, name: string, color: string): Promise<Tag> => {
    const response = await apiClient.post(`/tags/board/${boardId}`, { name, color });
    return response.data;
};

export const deleteTag = async (tagId: number): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}`);
};

export const addTagToCard = async (cardId: number, tagId: number): Promise<void> => {
    await apiClient.post(`/tags/card/${cardId}/tag/${tagId}`);
};

export const removeTagFromCard = async (cardId: number, tagId: number): Promise<void> => {
    await apiClient.delete(`/tags/card/${cardId}/tag/${tagId}`);
};
