import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { createWebSocketClient } from '../../api/webSocketService';
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AppNotification
} from '../../api/notificationService';

const NotificationBell = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    const { data: notifications = [] } = useQuery<AppNotification[]>({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClick = (notification: AppNotification) => {
        if (!notification.read) {
            markReadMutation.mutate(notification.id);
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllMutation.mutate()}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-8">Không có thông báo</p>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors ${!n.read ? 'bg-emerald-50/50' : ''}`}
                                >
                                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
