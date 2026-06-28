import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity as ActivityIcon, MessageSquare, Send, Trash2, MoreHorizontal, CheckSquare, Paperclip, File as FileIcon, Loader2 } from 'lucide-react';
import * as commentService from '../../api/commentService';
import * as activityService from '../../api/activityService';
import { uploadAttachment } from '../../api/attachmentService';
import ChecklistBlock from './ChecklistBlock';

import { type BoardMember } from '../../api/boardService';

interface CardTimelineProps {
    cardId: number;
    members: BoardMember[];
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

const CardTimeline: React.FC<CardTimelineProps> = ({ cardId, members }) => {
    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState<'checklist' | 'comments' | 'activity'>('checklist');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isUploadingCommentFile, setIsUploadingCommentFile] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploadingEditFile, setIsUploadingEditFile] = useState(false);
    const editFileInputRef = React.useRef<HTMLInputElement>(null);

    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionCursorPos, setMentionCursorPos] = useState<number | null>(null);
    const [selectedMentions, setSelectedMentions] = useState<{id: number, name: string}[]>([]);
    const [mentionPos, setMentionPos] = useState({ top: 40, left: 16 });
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const editAreaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, isEdit: boolean) => {
        const val = e.target.value;
        if (isEdit) {
            setEditContent(val);
        } else {
            setNewComment(val);
        }

        // Auto-expand textarea
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.substring(0, cursorPosition);

        // Tính toán tọa độ hiển thị popup tương đối theo con trỏ
        const lines = textBeforeCursor.split('\n');
        const currentLineIndex = lines.length - 1;
        const currentLineText = lines[currentLineIndex];
        
        const topOffset = isEdit ? 8 : 12; // padding top
        const lineHeight = 20; // text-sm line-height
        const top = topOffset + (currentLineIndex + 1) * lineHeight + 4;
        const leftOffset = isEdit ? 12 : 16; // padding left
        const left = Math.min(leftOffset + currentLineText.length * 7, e.target.clientWidth - 260); // 7px per char approx, avoid overflow
        
        setMentionPos({ top, left });

        const match = textBeforeCursor.match(/@(\S*)$/);
        
        if (match) {
            setMentionQuery(match[1]);
            setMentionCursorPos(cursorPosition);
        } else {
            setMentionQuery(null);
            setMentionCursorPos(null);
        }
    };

    const handleSelectMention = (user: BoardMember, isEdit: boolean) => {
        const val = isEdit ? editContent : newComment;
        if (mentionCursorPos === null) return;
        
        const textBeforeCursor = val.substring(0, mentionCursorPos);
        const textAfterCursor = val.substring(mentionCursorPos);
        
        const match = textBeforeCursor.match(/@(\S*)$/);
        if (!match) return;

        const start = mentionCursorPos - match[0].length;
        // Chèn @Tên (thay vì @[Tên](id)) để nhìn đẹp hơn
        const newText = val.substring(0, start) + `@${user.fullName} ` + textAfterCursor;
        
        setSelectedMentions(prev => {
            if (!prev.find(m => m.id === user.userId)) {
                return [...prev, { id: user.userId, name: user.fullName }];
            }
            return prev;
        });

        if (isEdit) {
            setEditContent(newText);
            setTimeout(() => editAreaRef.current?.focus(), 0);
        } else {
            setNewComment(newText);
            setTimeout(() => textareaRef.current?.focus(), 0);
        }
        
        setMentionQuery(null);
        setMentionCursorPos(null);
    };

    const renderMentionPopup = (isEdit: boolean) => {
        if (mentionQuery === null) return null;
        const q = mentionQuery.toLowerCase();
        const filteredMembers = members.filter(m => (m.fullName || '').toLowerCase().includes(q));
        if (filteredMembers.length === 0) return null;
        
        return (
            <div 
                className="absolute z-50 bg-white border border-slate-200 shadow-xl rounded-lg w-64 max-h-48 overflow-y-auto"
                style={{ top: `${mentionPos.top}px`, left: `${mentionPos.left}px` }}
            >
                {filteredMembers.map(m => {
                    const name = m.fullName || 'Unknown';
                    return (
                        <button 
                            key={m.userId}
                            onClick={() => handleSelectMention(m, isEdit)}
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm flex items-center space-x-2 transition-colors border-b border-slate-50 last:border-0"
                        >
                            {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt={name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="font-medium text-slate-700 truncate">{name}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const { data: comments = [] } = useQuery({
        queryKey: ['comments', cardId],
        queryFn: () => commentService.getCommentsByCard(cardId)
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities', cardId],
        queryFn: () => activityService.getActivitiesByCard(cardId)
    });

    const addCommentMutation = useMutation({
        mutationFn: () => {
            // Lọc ra những ID thực sự còn nằm trong text
            const actualMentionedIds = selectedMentions
                .filter(m => newComment.includes(`@${m.name}`))
                .map(m => m.id);
            return commentService.addComment(cardId, newComment, actualMentionedIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
            setNewComment('');
            setSelectedMentions([]);
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
        mutationFn: ({ id, content }: { id: number, content: string }) => {
            // Nếu có mention mới khi edit, ta vẫn truyền mentionedIds
            const actualMentionedIds = selectedMentions
                .filter(m => content.includes(`@${m.name}`))
                .map(m => m.id);
            // Hiện tại API edit comment của backend chưa nhận mentionedIds, nhưng truyền vào cũng không sao
            return commentService.updateComment(id, content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
            setEditingCommentId(null);
            setSelectedMentions([]);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bình luận!');
        }
    });

    const uploadCommentAttachmentMutation = useMutation({
        mutationFn: (file: File) => uploadAttachment(cardId, file),
        onSuccess: (data) => {
            const isImage = data.fileType?.startsWith('image/');
            const markdown = isImage ? `\n![${data.fileName}](${data.fileUrl})` : `\n[${data.fileName}](${data.fileUrl})`;
            setNewComment(prev => prev + markdown);
        },
        onSettled: () => setIsUploadingCommentFile(false)
    });

    const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploadingCommentFile(true);
            uploadCommentAttachmentMutation.mutate(e.target.files[0]);
        }
        e.target.value = '';
    };

    const uploadEditAttachmentMutation = useMutation({
        mutationFn: (file: File) => uploadAttachment(cardId, file),
        onSuccess: (data) => {
            const isImage = data.fileType?.startsWith('image/');
            const markdown = isImage ? `\n![${data.fileName}](${data.fileUrl})` : `\n[${data.fileName}](${data.fileUrl})`;
            setEditContent(prev => prev + markdown);
        },
        onSettled: () => setIsUploadingEditFile(false)
    });

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploadingEditFile(true);
            uploadEditAttachmentMutation.mutate(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const renderCommentContent = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
                return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="max-w-full rounded-lg my-2 max-h-64 object-contain border border-slate-200" />;
            }
            const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);
            if (linkMatch) {
                return (
                    <button key={i} onClick={() => handleDownload(linkMatch[2], linkMatch[1])} className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1 my-1 bg-emerald-50 w-fit px-3 py-1.5 rounded-md text-sm border border-emerald-100 transition-colors">
                        <FileIcon className="w-4 h-4"/>
                        <span className="font-medium truncate max-w-xs">{linkMatch[1]}</span>
                    </button>
                );
            }
            
            // Tự động tìm @Tên dựa trên danh sách members
            const mentionRegexStr = members.map(m => m.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            
            if (!mentionRegexStr) {
                return <p key={i} className="min-h-[1.2rem] whitespace-pre-wrap">{line}</p>;
            }

            const mentionRegex = new RegExp(`@(${mentionRegexStr})`, 'g');
            const parts = [];
            let lastIndex = 0;
            let match;
            
            while ((match = mentionRegex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                }
                parts.push(
                    <span key={`mention-${i}-${match.index}`} className="text-blue-600 font-bold bg-blue-50 px-1 rounded mx-0.5 border border-blue-100">
                        @{match[1]}
                    </span>
                );
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < line.length) {
                parts.push(line.substring(lastIndex));
            }

            return <p key={i} className="min-h-[1.2rem] whitespace-pre-wrap">{parts}</p>;
        });
    };

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
                    <ChecklistBlock cardId={cardId} members={members} />
                </div>
            )}

            {/* Comment Input */}
            {activeTab === 'comments' && (
                <div className="flex items-start space-x-4 mb-8">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Me" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0 text-xs border-2 border-white shadow-sm">
                            Me
                        </div>
                    )}
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-shadow shadow-sm">
                        <div className="w-full relative">
                            <textarea 
                                ref={textareaRef}
                                value={newComment}
                                onChange={(e) => handleTextareaChange(e, false)}
                                onClick={(e) => handleTextareaChange(e as any, false)}
                                onKeyUp={(e) => handleTextareaChange(e as any, false)}
                                placeholder="Write a comment... (Type @ to mention someone)"
                                className="w-full px-4 py-3 outline-none resize-none text-sm text-slate-700 bg-transparent rounded-t-xl overflow-hidden"
                                rows={1}
                            />
                            {renderMentionPopup(false)}
                        </div>
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                            <div className="flex items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingCommentFile}
                                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
                                    title="Attach a file"
                                >
                                    {isUploadingCommentFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleCommentFileChange} className="hidden" />
                            </div>
                            <button 
                                onClick={() => { if(newComment.trim()) addCommentMutation.mutate(); }}
                                disabled={!newComment.trim() || addCommentMutation.isPending || isUploadingCommentFile}
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
                                                    <div className="flex flex-col space-y-2 min-w-[200px] w-full">
                                                        <div className="w-full relative bg-white border border-slate-200 rounded focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-shadow shadow-sm">
                                                            <textarea 
                                                                ref={editAreaRef}
                                                                value={editContent}
                                                                onChange={(e) => handleTextareaChange(e, true)}
                                                                onClick={(e) => handleTextareaChange(e as any, true)}
                                                                onKeyUp={(e) => handleTextareaChange(e as any, true)}
                                                                className="w-full px-3 py-2 outline-none resize-none text-sm text-slate-700 rounded overflow-hidden"
                                                                rows={1}
                                                            />
                                                            {renderMentionPopup(true)}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <button
                                                                    onClick={() => editFileInputRef.current?.click()}
                                                                    disabled={isUploadingEditFile}
                                                                    className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors flex items-center"
                                                                    title="Attach a file"
                                                                >
                                                                    {isUploadingEditFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                                                                </button>
                                                                <input type="file" ref={editFileInputRef} onChange={handleEditFileChange} className="hidden" />
                                                            </div>
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
                                                                    disabled={!editContent.trim() || updateCommentMutation.isPending || isUploadingEditFile}
                                                                    className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center space-x-1"
                                                                >
                                                                    <span>Save</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    renderCommentContent((event as any).content)
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
