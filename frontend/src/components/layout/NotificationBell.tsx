import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { createWebSocketClient } from '../../api/webSocketService';
import { getNotifications, type AppNotification } from '../../api/notificationService';

const NotificationBell = () => {
    const queryClient = useQueryClient();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    const { data: notifications = [] } = useQuery<AppNotification[]>({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!userId) return;

        const client = createWebSocketClient();
        client.onConnect = () => {
            client.subscribe(`/topic/user/${userId}/notifications`, () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            });
        };
        client.activate();

        return () => { client.deactivate(); };
    }, [userId, queryClient]);

    return (
        <NavLink
            to="/notifications"
            className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                    isActive
                        ? 'bg-white text-emerald-600 shadow-md shadow-black/10'
                        : 'text-white/80 hover:bg-white/20 hover:text-white'
                }`
            }
        >
            <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </NavLink>
    );
};

export default NotificationBell;
