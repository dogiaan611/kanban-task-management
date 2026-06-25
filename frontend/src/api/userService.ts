import { apiClient } from './axios';

export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string | null;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return response.data;
};

export const updateProfile = async (fullName: string, avatarUrl: string | null): Promise<UserProfile> => {
    const response = await apiClient.put('/users/me/profile', { fullName, avatarUrl });
    return response.data;
};

export const updatePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/users/me/password', { oldPassword, newPassword });
};
