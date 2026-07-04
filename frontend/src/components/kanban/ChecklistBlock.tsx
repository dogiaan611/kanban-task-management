import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Trash2, UserPlus, User } from 'lucide-react';
import { getChecklistsByCard, createChecklist, updateChecklist, deleteChecklist, type ChecklistItem } from '../../api/checklistService';
import { getAvatarColor, getInitials } from '../../utils/stringUtils';

export interface BoardMember {
    id: number;
    userId: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

interface ChecklistBlockProps {
    cardId: number;
    members: BoardMember[];
    isViewer?: boolean;
    isAdmin?: boolean;
    isCreator?: boolean;
    currentUserId?: number;
}

const ChecklistBlock: React.FC<ChecklistBlockProps> = ({ cardId, members = [], isViewer = false, isAdmin = false, isCreator = false, currentUserId }) => {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [assignPopoverId, setAssignPopoverId] = useState<number | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChecklists();
    }, [cardId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setAssignPopoverId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await getChecklistsByCard(cardId);
            setItems(data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        try {
            const newItem = await createChecklist(cardId, newItemTitle.trim());
            setItems([...items, newItem]);
            setNewItemTitle('');
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to add item:', error);
        }
    };

    const handleToggleComplete = async (item: ChecklistItem) => {
        const updatedItems = items.map(i => i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i);
        setItems(updatedItems);

        try {
            await updateChecklist(item.id, { isCompleted: !item.isCompleted });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to update item:', error);
            setItems(items);
        }
    };

    const handleAssignMember = async (item: ChecklistItem, userId: number) => {
        const isUnassigning = item.assigneeId === userId;
        const newAssigneeId = isUnassigning ? -1 : userId;
        
        // Optimistic update
        const member = members.find(m => m.userId === userId);
        const updatedItems = items.map(i => i.id === item.id ? {
            ...i,
            assigneeId: isUnassigning ? undefined : userId,
            assigneeName: isUnassigning ? undefined : member?.fullName,
            assigneeAvatarUrl: isUnassigning ? undefined : member?.avatarUrl
        } : i);
        setItems(updatedItems);
        setAssignPopoverId(null);

        try {
            await updateChecklist(item.id, { assigneeId: newAssigneeId });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to assign member to checklist item:', error);
            setItems(items);
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await deleteChecklist(id);
            setItems(items.filter(i => i.id !== id));
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    if (loading) {
        return <div className="text-slate-500 text-sm py-4 animate-pulse">Loading checklist...</div>;
    }

    const completedCount = items.filter(i => i.isCompleted).length;
    const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

    return (
        <div className="pt-2">
            {/* Progress Bar */}
            <div className="flex items-center space-x-3 mb-4">
                <span className="text-xs font-bold text-slate-500 w-8">{progress}%</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 mb-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-start group relative">
                        <div className="flex-shrink-0 pt-1">
                            {(() => {
                                const canCheck = isAdmin || isCreator || item.assigneeId === currentUserId;
                                const disableCheck = isViewer || !canCheck;
                                return (
                                    <input 
                                        type="checkbox"
                                        checked={item.isCompleted}
                                        onChange={() => handleToggleComplete(item)}
                                        disabled={disableCheck}
                                        className={`w-4 h-4 rounded border-slate-300 focus:ring-blue-500 ${disableCheck ? 'cursor-not-allowed opacity-60 text-slate-400' : 'text-blue-600 cursor-pointer'}`}
                                    />
                                );
                            })()}
                        </div>
                        <div className="ml-3 flex-1 flex flex-col sm:flex-row sm:items-center">
                            <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                                {item.title}
                            </span>
                            
                            {/* Assignee Selection */}
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                {(() => {
                                    const canManageAssignee = isAdmin || isCreator;
                                    const disableAssign = isViewer || !canManageAssignee;
                                    return (
                                        <button 
                                            onClick={() => !disableAssign && setAssignPopoverId(assignPopoverId === item.id ? null : item.id)}
                                            disabled={disableAssign}
                                            className={`flex items-center justify-center rounded-full p-1 transition-colors ${!disableAssign ? 'hover:bg-slate-200 cursor-pointer' : 'cursor-not-allowed'}`}
                                            title={item.assigneeName ? `Assigned to ${item.assigneeName}` : 'Assign member'}
                                        >
                                            {item.assigneeId ? (
                                                item.assigneeAvatarUrl ? (
                                                    <img src={item.assigneeAvatarUrl} alt={item.assigneeName} className="w-5 h-5 rounded-full object-cover shadow-sm border border-slate-200" />
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm border border-slate-200 ${getAvatarColor(item.assigneeName || 'A')}`}>
                                                        {getInitials(item.assigneeName || 'A')}
                                                    </div>
                                                )
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-300 border-dashed hover:bg-slate-200 hover:text-slate-700 hover:border-slate-400">
                                                    <UserPlus className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })()}

                                {(!isViewer && (isAdmin || isCreator)) && (
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                
                                {/* Always show avatar if assigned, even if not hovering */}
                                {item.assigneeId && assignPopoverId !== item.id && (
                                     <div className="absolute right-8 top-0 opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                                         {item.assigneeAvatarUrl ? (
                                             <img src={item.assigneeAvatarUrl} alt={item.assigneeName} className="w-5 h-5 rounded-full object-cover shadow-sm border border-slate-200" />
                                         ) : (
                                             <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm border border-slate-200 ${getAvatarColor(item.assigneeName || 'A')}`}>
                                                 {getInitials(item.assigneeName || 'A')}
                                             </div>
                                         )}
                                     </div>
                                )}
                                
                            </div>
                        </div>

                        {/* Popover */}
                        {assignPopoverId === item.id && (
                            <div ref={popoverRef} className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-30 py-2">
                                <h4 className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">Assign To</h4>
                                <div className="max-h-48 overflow-y-auto">
                                    {members.map(member => (
                                        <button
                                            key={member.id}
                                            onClick={() => handleAssignMember(item, member.userId)}
                                            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors ${item.assigneeId === member.userId ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.fullName} className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${getAvatarColor(member.fullName)}`}>
                                                    {getInitials(member.fullName)}
                                                </div>
                                            )}
                                            <span className="truncate flex-1 text-left">{member.fullName}</span>
                                            {item.assigneeId === member.userId && <span className="text-xs font-bold text-emerald-600">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Item Form */}
            {(!isViewer && (isAdmin || isCreator)) && (
                <form onSubmit={handleAddItem} className="mt-2">
                    <div className="flex items-center space-x-2">
                        <input 
                            type="text"
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            placeholder="Add an item..."
                            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-shadow"
                        />
                        <button 
                            type="submit"
                            disabled={!newItemTitle.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ChecklistBlock;
