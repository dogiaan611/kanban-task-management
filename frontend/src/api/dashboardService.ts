import { apiClient } from './axios';

export interface DashboardStats {
    totalWorkspaces: number;
    totalBoards: number;
    totalAssignedCards: number;
    cardsByList: Record<string, number>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
};
