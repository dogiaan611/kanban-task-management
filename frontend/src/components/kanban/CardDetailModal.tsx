import React, { useEffect, useState } from 'react';
import { X, AlignLeft, CreditCard, Calendar, CheckSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ChecklistBlock from './ChecklistBlock';
import TagsBlock from './TagsBlock';
import CardTimeline from './CardTimeline';
import AttachmentsBlock from './AttachmentsBlock';
import { updateCardDetail } from '../../api/kanbanService';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBoardMembers, type BoardMember } from '../../api/boardService';
import { UserPlus, User } from 'lucide-react';

interface CardDetailModalProps {
    card: {
        id: number;
        title: string;
        description?: string;
        dueDate?: string;
        listId: number;
        tags?: {id: number, name: string, color: string}[];
        assigneeId?: number;
        assigneeName?: string;
        assigneeAvatarUrl?: string;
        createdById?: number;
    };
    listTitle: string;
    onClose: () => void;
    isViewer?: boolean;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, listTitle, onClose, isViewer = false }) => {
    const queryClient = useQueryClient();
    const [titleValue, setTitleValue] = useState(card.title);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descValue, setDescValue] = useState(card.description || '');
    const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.substring(0, 10) : '');
    const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false);

    const { id } = useParams<{ id: string }>();
    const boardId = Number(id);
    const { data: members = [] } = useQuery<BoardMember[]>({
        queryKey: ['boardMembers', boardId],
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId
    });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentMember = members.find(m => m.userId === currentUser.id);
    const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'ROLE_ADMIN';
    const isCreator = card.createdById === currentUser.id;
    const canEdit = isAdmin || isCreator;
    const isDisabled = isViewer || !canEdit;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = ['bg-violet-500', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleAssign = async (userId: number) => {
        try {
            const newAssigneeId = card.assigneeId === userId ? -1 : userId;
            await updateCardDetail(card.id, { assigneeId: newAssigneeId });
            setIsAssignPopoverOpen(false);
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update assignee', error);
        }
    };

    // Đóng modal khi ấn phím Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Đóng modal khi click ra ngoài (backdrop)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSaveTitle = async () => {
        if (!titleValue.trim() || titleValue === card.title) {
            setTitleValue(card.title);
            return;
        }
        try {
            await updateCardDetail(card.id, { title: titleValue.trim() });
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update title', error);
            setTitleValue(card.title);
        }
    };

    const handleSaveDescription = async () => {
        try {
            await updateCardDetail(card.id, { description: descValue });
            setIsEditingDesc(false);
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update description', error);
        }
    };

    const handleSaveDueDate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        setDueDate(dateStr);
        try {
            // dateStr is YYYY-MM-DD. backend expects LocalDateTime, append T00:00:00
            const isoDate = dateStr ? `${dateStr}T00:00:00` : undefined;
            await updateCardDetail(card.id, { dueDate: isoDate });
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update due date', error);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-slate-50 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()} // Chặn event nổi bọt để không đóng khi click vào trong modal
            >
                {/* Header (Nút Close) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-12">
                    <div className="flex justify-center mb-8">
                        <div className="flex flex-col items-center justify-center gap-1 w-full px-8">
                            <input 
                                type="text"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                                disabled={isDisabled}
                                className={`w-full text-2xl font-bold text-slate-800 leading-tight text-center bg-transparent border border-transparent hover:bg-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded px-4 py-1 transition-colors outline-none ${isDisabled ? 'cursor-not-allowed' : ''}`}
                            />
                            <p className="text-sm text-slate-500">
                                in list <span className="font-semibold underline decoration-slate-300">{listTitle}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <TagsBlock cardId={card.id} cardTags={card.tags} isViewer={isDisabled} isAdmin={isAdmin} />
                        
                        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 relative">
                            <div className="flex items-center space-x-3 w-40 shrink-0">
                                <User className="w-5 h-5 text-slate-700" />
                                <h3 className="text-lg font-bold text-slate-800">Assignee</h3>
                            </div>
                            <div className="flex-1">
                                    <button 
                                        disabled={isDisabled}
                                        onClick={() => setIsAssignPopoverOpen(!isAssignPopoverOpen)}
                                        className={`flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-transparent shadow-sm ${isDisabled ? 'cursor-not-allowed' : ''}`}
                                    >
                                        {card.assigneeId ? (
                                            <>
                                                {card.assigneeAvatarUrl ? (
                                                    <img src={card.assigneeAvatarUrl} alt={card.assigneeName} className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(card.assigneeName || 'A')}`}>
                                                        {getInitials(card.assigneeName || 'A')}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-slate-700">{card.assigneeName}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-slate-500">
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600">Unassigned</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {!isDisabled && isAssignPopoverOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsAssignPopoverOpen(false)} />
                                            <div className="absolute top-full left-8 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-2">
                                                <h4 className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">Select Member</h4>
                                                <div className="max-h-48 overflow-y-auto px-2">
                                                    {members.map(member => (
                                                        <button
                                                            key={member.id}
                                                            onClick={() => handleAssign(member.userId)}
                                                            className={`w-full flex items-center space-x-3 px-2 py-2 rounded-lg transition-colors ${card.assigneeId === member.userId ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                                        >
                                                            {member.avatarUrl ? (
                                                                <img src={member.avatarUrl} alt={member.fullName} className="w-6 h-6 rounded-full object-cover" />
                                                            ) : (
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(member.fullName)}`}>
                                                                    {getInitials(member.fullName)}
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-medium">{member.fullName}</span>
                                                            {card.assigneeId === member.userId && <span className="ml-auto text-xs font-bold">✓</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 relative">
                            <div className="flex items-center space-x-3 w-40 shrink-0">
                                <Calendar className="w-5 h-5 text-slate-700" />
                                <h3 className="text-lg font-bold text-slate-800">Due Date</h3>
                            </div>
                            <div className="flex-1">
                                <input 
                                    type="date" 
                                    value={dueDate}
                                    onChange={handleSaveDueDate}
                                    disabled={isDisabled}
                                    className={`border border-slate-300 rounded-md px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 shadow-sm transition-colors ${isDisabled ? 'cursor-not-allowed bg-slate-100' : ''}`}
                                />
                            </div>
                        </div>

                        {(() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                            const currentMember = members.find(m => m.userId === currentUser.id);
                            const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'ROLE_ADMIN';
                            return (
                                <AttachmentsBlock 
                                    cardId={card.id} 
                                    isViewer={isViewer} 
                                    isAdmin={isAdmin} 
                                    currentUserId={currentUser.id} 
                                />
                            );
                        })()}

                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <AlignLeft className="w-5 h-5 text-slate-700" />
                                <h3 className="text-lg font-bold text-slate-800">Description</h3>
                            </div>
                            {isEditingDesc && !isDisabled ? (
                                <div className="ml-8">
                                    <textarea 
                                        value={descValue}
                                        onChange={e => setDescValue(e.target.value)}
                                        className="w-full bg-white p-4 rounded-md border border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-700 text-sm min-h-[100px] mb-2 shadow-sm"
                                        placeholder="Add a more detailed description..."
                                        autoFocus
                                    />
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleSaveDescription} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                                            Save
                                        </button>
                                        <button onClick={() => setIsEditingDesc(false)} className="text-slate-500 hover:text-slate-700 px-3 py-1.5 hover:bg-slate-200 rounded-md text-sm transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => !isDisabled && setIsEditingDesc(true)}
                                    className={`ml-8 bg-slate-100/50 p-4 rounded-md border border-transparent hover:bg-slate-100 text-slate-600 text-sm min-h-[80px] transition-colors shadow-sm ${!isDisabled ? 'cursor-pointer' : ''}`}
                                >
                                    {descValue ? descValue : (isDisabled ? 'No description provided.' : 'Add a more detailed description...')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline (Comments & Activity) */}
                    <CardTimeline 
                        cardId={card.id} 
                        members={members} 
                        isViewer={isViewer} 
                        isAdmin={isAdmin} 
                        isCreator={isCreator} 
                        currentUserId={currentUser.id} 
                    />
                </div>
            </div>
        </div>
    );
};

export default CardDetailModal;
