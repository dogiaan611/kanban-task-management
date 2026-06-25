import { apiClient } from './axios';

export interface Attachment {
    id: number;
    cardId: number;
    userId: number;
    userFullName: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
}

export const uploadAttachment = async (cardId: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/cards/${cardId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getAttachments = async (cardId: number): Promise<Attachment[]> => {
    const response = await apiClient.get(`/cards/${cardId}/attachments`);
    return response.data;
};

export const deleteAttachment = async (attachmentId: number): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
};
