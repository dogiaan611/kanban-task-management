import { apiClient } from './axios';

export const getListsByBoard = async (boardId: number) => {
    const response = await apiClient.get(`/lists/board/${boardId}`);
    return response.data;
};

export const createList = async (boardId: number, title: string) => {
    const response = await apiClient.post('/lists', { boardId, title });
    return response.data;
};

export const updateListPosition = async (listId: number, position: number) => {
    const response = await apiClient.put(`/lists/${listId}/position`, { position });
    return response.data;
};

export const deleteList = async (listId: number) => {
    const response = await apiClient.delete(`/lists/${listId}`);
    return response.data;
};

export const createCard = async (listId: number, title: string) => {
    const response = await apiClient.post('/cards', { listId, title, description: '' });
    return response.data;
};

export const updateCardPosition = async (cardId: number, position: number, parentId?: number) => {
    const response = await apiClient.put(`/cards/${cardId}/position`, { position, parentId });
    return response.data;
};

export const deleteCard = async (cardId: number) => {
    const response = await apiClient.delete(`/cards/${cardId}`);
    return response.data;
};

export const updateCardDetail = async (cardId: number, data: { description?: string; dueDate?: string; assigneeId?: number }) => {
    const response = await apiClient.put(`/cards/${cardId}`, data);
    return response.data;
};
