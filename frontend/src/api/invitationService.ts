import axios from 'axios';
import { apiClient } from './axios';

export interface Invitation {
    token: string;
    email: string;
    workspaceName: string;
    invitedByName: string;
    status: string;
    expiresAt: string;
    inviteLink: string;
}

export interface Workspace {
    id: number;
    name: string;
    description: string;
    role: string;
    createdAt: string;
}

export const getInvitation = async (token: string): Promise<Invitation> => {
    const response = await axios.get(`http://localhost:8080/api/invitations/${token}`);
    return response.data;
};

export const acceptInvitation = async (token: string): Promise<Workspace> => {
    const response = await apiClient.post(`/invitations/${token}/accept`);
    return response.data;
};

export const inviteBoardMember = async (boardId: number, email: string): Promise<Invitation> => {
    const response = await apiClient.post(`/boards/${boardId}/invitations`, { email });
    return response.data;
};
