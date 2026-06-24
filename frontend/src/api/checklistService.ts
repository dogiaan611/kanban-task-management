import { apiClient } from './axios';

export interface ChecklistItem {
    id: number;
    title: string;
    isCompleted: boolean;
    position: number;
    createdAt: string;
}

export const getChecklistsByCard = async (cardId: number): Promise<ChecklistItem[]> => {
    const response = await apiClient.get(`/cards/${cardId}/checklists`);
    return response.data;
};

export const createChecklist = async (cardId: number, title: string): Promise<ChecklistItem> => {
    const response = await apiClient.post(`/cards/${cardId}/checklists`, { title });
    return response.data;
};

export const updateChecklist = async (id: number, data: { title?: string; isCompleted?: boolean; position?: number }): Promise<ChecklistItem> => {
    const response = await apiClient.put(`/checklists/${id}`, data);
    return response.data;
};

export const deleteChecklist = async (id: number): Promise<void> => {
    await apiClient.delete(`/checklists/${id}`);
};
