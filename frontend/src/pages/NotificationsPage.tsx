import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from '../api/notificationService';
import { Bell, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';

const NotificationsPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;

    const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    useEffect(() => {
        if (!userId) return;
        const client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/user/${userId}/notifications`, () => {
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                });
            },
        });
        client.activate();
        return () => {
            client.deactivate();
        };
    }, [queryClient, userId]);

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read) {
            markReadMutation.mutate(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 px-8 pb-8 pt-0 mt-2">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Notifications
                    </h1>
                    <p className="text-slate-500 mt-2">
                        You have <span className="font-bold text-emerald-600">{unreadCount}</span> unread notifications.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                        Mark all as read
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No notifications yet</h3>
                    <p className="text-slate-500">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group flex items-start p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                notification.read
                                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                                    : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md ring-1 ring-emerald-500/10'
                            }`}
                        >
                            {!notification.read && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            )}
                            
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className={`text-base font-semibold mb-1 truncate flex items-center gap-2 ${
                                    notification.read ? 'text-slate-700' : 'text-slate-900'
                                }`}>
                                    {notification.title}
                                    {!notification.read && (
                                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                                            New
                                        </span>
                                    )}
                                </h4>
                                <p className={`text-sm mb-3 ${
                                    notification.read ? 'text-slate-500' : 'text-slate-600'
                                }`}>
                                    {notification.message}
                                </p>
                                <div className="flex items-center text-xs text-slate-400 font-medium">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                                <ExternalLink className="w-5 h-5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
