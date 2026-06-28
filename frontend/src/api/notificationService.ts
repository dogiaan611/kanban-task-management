import { apiClient } from './axios';

export interface AppNotification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
};

export const markNotificationRead = async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
};
