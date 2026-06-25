import { apiClient } from './axios';

export interface Activity {
    id: number;
    userId: number | null;
    userFullName: string;
    userAvatarUrl: string | null;
    action: string;
    detail: string | null;
    createdAt: string;
}

export const getActivitiesByCard = async (cardId: number): Promise<Activity[]> => {
    const response = await apiClient.get(`/activities/card/${cardId}`);
    return response.data;
};
