import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getInvitation, acceptInvitation } from '../api/invitationService';

const AcceptInvite = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [acceptError, setAcceptError] = useState('');

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isLoggedIn = !!localStorage.getItem('token');

    const { data: invitation, isLoading, error } = useQuery({
        queryKey: ['invitation', token],
        queryFn: () => getInvitation(token!),
        enabled: !!token,
        retry: false,
    });

    const acceptMutation = useMutation({
        mutationFn: () => acceptInvitation(token!),
        onSuccess: (workspace) => {
            navigate(`/workspace/${workspace.id}`);
        },
        onError: (err: any) => {
            setAcceptError(err?.response?.data?.message || 'Không thể chấp nhận lời mời.');
        },
    });

    const emailMatches = currentUser && invitation
        ? currentUser.email?.toLowerCase() === invitation.email.toLowerCase()
        : false;

    const redirectPath = `/invite/${token}`;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Lời mời không hợp lệ</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Lời mời này không tồn tại, đã hết hạn hoặc đã được sử dụng.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-1">Lời mời tham gia Workspace</h1>
                    <p className="text-slate-400 text-sm">Bạn được mời tham gia cộng tác trên Kanban</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Workspace</p>
                        <p className="text-lg font-bold text-slate-800">{invitation.workspaceName}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-slate-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Người mời</p>
                            <p className="font-semibold text-slate-700">{invitation.invitedByName}</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email mời</p>
                            <p className="font-semibold text-slate-700 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {invitation.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        Hết hạn: {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                {!isLoggedIn && (
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 text-center mb-4">
                            Đăng nhập bằng tài khoản <strong>{invitation.email}</strong> để chấp nhận lời mời.
                        </p>
                        <Link
                            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                            className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                )}

                {isLoggedIn && !emailMatches && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-amber-700">
                            Bạn đang đăng nhập với <strong>{currentUser?.email}</strong>, nhưng lời mời được gửi tới <strong>{invitation.email}</strong>.
                            Vui lòng đăng nhập đúng tài khoản.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('refreshToken');
                                localStorage.removeItem('user');
                                navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
                            }}
                            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                            Đăng xuất và đăng nhập lại
                        </button>
                    </div>
                )}

                {isLoggedIn && emailMatches && (
                    <div className="space-y-3">
                        {acceptError && (
                            <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg text-center border border-rose-200">
                                {acceptError}
                            </div>
                        )}
                        <button
                            onClick={() => acceptMutation.mutate()}
                            disabled={acceptMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {acceptMutation.isPending ? 'Đang xử lý...' : 'Chấp nhận lời mời'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptInvite;
