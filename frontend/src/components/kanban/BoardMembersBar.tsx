import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, X, Trash2, Crown } from 'lucide-react';
import {
    getBoardMembers,
    removeBoardMember,
    type BoardMember
} from '../../api/boardService';
import { inviteBoardMember } from '../../api/invitationService';

const extractErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message
    || err?.response?.data?.error
    || (err?.response?.status === 500 ? 'Lỗi server. Kiểm tra backend đã chạy migration V12 và MailHog.' : null)
    || fallback;

interface BoardMembersBarProps {
    boardId: number;
}

// Tạo màu avatar từ tên người dùng (deterministic)
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-violet-500', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500',
        'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Lấy 2 chữ cái đầu của tên
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const BoardMembersBar: React.FC<BoardMembersBarProps> = ({ boardId }) => {
    const queryClient = useQueryClient();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    const { data: members = [] } = useQuery<BoardMember[]>({
        queryKey: ['boardMembers', boardId],
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId
    });

    const inviteMutation = useMutation({
        mutationFn: (email: string) => inviteBoardMember(boardId, email),
        onSuccess: (data) => {
            setInviteEmail('');
            setErrorMsg('');
            setInviteLink(data.inviteLink);
            setSuccessMsg(`Đã gửi lời mời tới ${data.email}. Kiểm tra Gmail hoặc thông báo trong app.`);
        },
        onError: (err: any) => {
            setSuccessMsg('');
            setInviteLink('');
            setErrorMsg(extractErrorMessage(err, 'Không thể gửi lời mời. Vui lòng thử lại.'));
        }
    });

    const removeMutation = useMutation({
        mutationFn: (userId: number) => removeBoardMember(boardId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] });
        }
    });

    // Đóng popover khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setErrorMsg('');
        setSuccessMsg('');
        setInviteLink('');
        inviteMutation.mutate(inviteEmail.trim());
    };

    const MAX_VISIBLE = 4;
    const visibleMembers = members.slice(0, MAX_VISIBLE);
    const extraCount = members.length - MAX_VISIBLE;

    return (
        <div className="flex items-center space-x-6" ref={popoverRef}>
            {/* Avatar Stack */}
            <div className="flex items-center -space-x-2">
                {visibleMembers.map((member) => (
                    <div
                        key={member.id}
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white ring-1 ring-white/50 shadow-sm cursor-default ${!member.avatarUrl ? getAvatarColor(member.fullName) : 'bg-slate-100'}`}
                        title={`${member.fullName} (${member.role})`}
                    >
                        {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            getInitials(member.fullName)
                        )}
                    </div>
                ))}
                {extraCount > 0 && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 text-xs font-bold border-2 border-white shadow-sm">
                        +{extraCount}
                    </div>
                )}
            </div>


            {/* Invite Button */}
            <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="flex items-center space-x-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all text-sm font-medium shadow-sm"
            >
                <UserPlus className="w-4 h-4" />
                <span>Share</span>
            </button>

            {/* Invite Popover */}
            {isPopoverOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Popover Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Board Members</h3>
                        <button
                            onClick={() => setIsPopoverOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Member List */}
                    <div className="px-3 py-2 max-h-48 overflow-y-auto">
                        {members.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">No members yet</p>
                        ) : (
                            members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 group transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${!member.avatarUrl ? getAvatarColor(member.fullName) : 'bg-slate-100'}`}>
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                getInitials(member.fullName)
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-1">
                                                <p className="text-sm font-semibold text-slate-800">{member.fullName}</p>
                                                {member.role === 'ROLE_ADMIN' && (
                                                    <Crown className="w-3 h-3 text-amber-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400">{member.email}</p>
                                        </div>
                                    </div>
                                    {member.role !== 'ROLE_ADMIN' && (
                                        <button
                                            onClick={() => removeMutation.mutate(member.userId)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Remove member"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Invite Form */}
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Invite by email</p>
                        <p className="text-xs text-slate-400 mb-2">Chỉ mời email đã đăng ký tài khoản Kanban.</p>
                        <form onSubmit={handleInvite} className="flex space-x-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => { setInviteEmail(e.target.value); setErrorMsg(''); setSuccessMsg(''); }}
                                placeholder="name@example.com"
                                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {inviteMutation.isPending ? '...' : 'Invite'}
                            </button>
                        </form>
                        {errorMsg && (
                            <p className="text-rose-500 text-xs mt-2">{errorMsg}</p>
                        )}
                        {successMsg && (
                            <div className="mt-2 space-y-2">
                                <p className="text-emerald-600 text-xs font-medium">✓ {successMsg}</p>
                                {inviteLink && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                                        <p className="text-xs text-slate-500 mb-1">Link chấp nhận lời mời:</p>
                                        <a
                                            href={inviteLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-emerald-700 break-all hover:underline"
                                        >
                                            {inviteLink}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(inviteLink)}
                                            className="mt-1 text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                                        >
                                            Copy link
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardMembersBar;
