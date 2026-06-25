import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity as ActivityIcon, MessageSquare, Send, Trash2, MoreHorizontal, CheckSquare } from 'lucide-react';
import * as commentService from '../../api/commentService';
import * as activityService from '../../api/activityService';
import ChecklistBlock from './ChecklistBlock';

interface CardTimelineProps {
    cardId: number;
}

const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
};

const CardTimeline: React.FC<CardTimelineProps> = ({ cardId }) => {
    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState<'checklist' | 'comments' | 'activity'>('checklist');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const { data: comments = [] } = useQuery({
        queryKey: ['comments', cardId],
        queryFn: () => commentService.getCommentsByCard(cardId)
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities', cardId],
        queryFn: () => activityService.getActivitiesByCard(cardId)
    });

    const addCommentMutation = useMutation({
        mutationFn: () => commentService.addComment(cardId, newComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
            setNewComment('');
        }
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => commentService.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bình luận!');
        }
    });

    const updateCommentMutation = useMutation({
        mutationFn: ({ id, content }: { id: number, content: string }) => commentService.updateComment(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
            setEditingCommentId(null);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bình luận!');
        }
    });

    const displayedEvents = activeTab === 'comments' 
        ? comments.map(c => ({ ...c, type: 'comment' as const })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : activities.map(a => ({ ...a, type: 'activity' as const })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="mt-8 border-t border-slate-200 pt-8">
            {/* Tabs */}
            <div className="flex items-center space-x-6 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('checklist')}
                    className={`pb-3 flex items-center space-x-2 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
                        activeTab === 'checklist' 
                            ? 'border-emerald-500 text-slate-800' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist</span>
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 flex items-center space-x-2 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
                        activeTab === 'comments' 
                            ? 'border-emerald-500 text-slate-800' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments</span>
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-3 flex items-center space-x-2 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
                        activeTab === 'activity' 
                            ? 'border-emerald-500 text-slate-800' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <ActivityIcon className="w-4 h-4" />
                    <span>Activity Log</span>
                </button>
            </div>

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
                <div className="bg-slate-100/30 p-4 rounded-xl border border-slate-200">
                    <ChecklistBlock cardId={cardId} />
                </div>
            )}

            {/* Comment Input */}
            {activeTab === 'comments' && (
                <div className="flex items-start space-x-4 mb-8">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                        Me
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-shadow shadow-sm">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full p-4 outline-none resize-none text-sm text-slate-700 min-h-[80px]"
                        />
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => { if(newComment.trim()) addCommentMutation.mutate(); }}
                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                            >
                                <span>Save</span>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline List */}
            {activeTab !== 'checklist' && (
                <div className="space-y-6">
                    {displayedEvents.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-4">
                            {activeTab === 'comments' ? 'No comments yet. Be the first to comment!' : 'No activity recorded yet.'}
                        </div>
                    ) : displayedEvents.map(event => (
                        <div key={`${event.type}-${event.id}`} className="flex items-start space-x-4">
                            {event.userAvatarUrl ? (
                                <img src={event.userAvatarUrl} alt={event.userFullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold flex-shrink-0 text-sm">
                                    {event.userFullName ? event.userFullName.charAt(0).toUpperCase() : 'S'}
                                </div>
                            )}
                            
                            <div className="flex-1">
                                {event.type === 'comment' ? (
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-bold text-slate-800 text-sm">{event.userFullName}</span>
                                            <span className="text-xs text-slate-400">{timeAgo(event.createdAt)}</span>
                                        </div>
                                        <div className="group flex items-center space-x-2">
                                            <div className="inline-block bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-700 max-w-full break-words">
                                                {editingCommentId === event.id ? (
                                                    <div className="flex flex-col space-y-2 min-w-[200px]">
                                                        <textarea 
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full p-2 border border-slate-200 rounded outline-none resize-none min-h-[60px]"
                                                        />
                                                        <div className="flex space-x-2 justify-end">
                                                            <button 
                                                                onClick={() => setEditingCommentId(null)}
                                                                className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    if(editContent.trim()) {
                                                                        updateCommentMutation.mutate({ id: event.id, content: editContent.trim() });
                                                                    }
                                                                }}
                                                                disabled={!editContent.trim() || updateCommentMutation.isPending}
                                                                className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (event as any).content
                                                )}
                                            </div>
                                            
                                            {(currentUser.id === event.userId || currentUser.id === (event as any).userId) && editingCommentId !== event.id && (
                                                <div className="relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                                                    className={`p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-all ${openMenuId === event.id ? 'opacity-100 bg-slate-100 text-slate-700' : 'opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                
                                                {openMenuId === event.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute bottom-full left-0 mb-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                                            <button 
                                                                onClick={() => {
                                                                    setOpenMenuId(null);
                                                                    setEditingCommentId(event.id);
                                                                    setEditContent((event as any).content);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setOpenMenuId(null);
                                                                    if(window.confirm('Delete this comment?')) {
                                                                        deleteCommentMutation.mutate(event.id);
                                                                    }
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-sm mt-1.5">
                                        <span className="font-bold text-slate-700">{event.userFullName}</span>
                                        <span className="text-slate-600">{(event as any).action}</span>
                                        {(event as any).detail && <span className="font-medium text-slate-800">{(event as any).detail}</span>}
                                        <span className="text-xs text-slate-400 ml-2">{timeAgo(event.createdAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CardTimeline;
