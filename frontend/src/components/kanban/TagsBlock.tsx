import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag as TagIcon, Plus, X, Check, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as tagService from '../../api/tagService';

export interface Tag {
    id: number;
    name: string;
    color: string;
}

interface TagsBlockProps {
    cardId: number;
    cardTags?: Tag[];
    isViewer?: boolean;
    isAdmin?: boolean;
}

const TAG_COLORS = [
    { name: 'Red', hex: 'bg-rose-500 hover:bg-rose-600' },
    { name: 'Orange', hex: 'bg-orange-500 hover:bg-orange-600' },
    { name: 'Amber', hex: 'bg-amber-500 hover:bg-amber-600' },
    { name: 'Green', hex: 'bg-emerald-500 hover:bg-emerald-600' },
    { name: 'Blue', hex: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Purple', hex: 'bg-violet-500 hover:bg-violet-600' },
    { name: 'Pink', hex: 'bg-pink-500 hover:bg-pink-600' },
    { name: 'Gray', hex: 'bg-slate-500 hover:bg-slate-600' }
];

const TagsBlock: React.FC<TagsBlockProps> = ({ cardId, cardTags = [], isViewer = false, isAdmin = false }) => {
    const { id } = useParams<{ id: string }>();
    const boardId = Number(id);
    const queryClient = useQueryClient();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[3].hex);
    const popoverRef = useRef<HTMLDivElement>(null);

    const { data: boardTags = [] } = useQuery({
        queryKey: ['tags', boardId],
        queryFn: () => tagService.getTagsByBoard(boardId),
        enabled: !!boardId && isPopoverOpen
    });

    const addTagToCardMutation = useMutation({
        mutationFn: (tagId: number) => tagService.addTagToCard(cardId, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lists'] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        }
    });

    const removeTagFromCardMutation = useMutation({
        mutationFn: (tagId: number) => tagService.removeTagFromCard(cardId, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lists'] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        }
    });

    const createTagMutation = useMutation({
        mutationFn: () => tagService.createTag(boardId, newTagName, newTagColor),
        onSuccess: (newTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags', boardId] });
            setIsCreateMode(false);
            setNewTagName('');
            addTagToCardMutation.mutate(newTag.id);
        }
    });

    const deleteTagMutation = useMutation({
        mutationFn: (tagId: number) => tagService.deleteTag(tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', boardId] });
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        }
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsPopoverOpen(false);
                setIsCreateMode(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTag = (tag: tagService.Tag) => {
        if (cardTags.some(t => t.id === tag.id)) {
            removeTagFromCardMutation.mutate(tag.id);
        } else {
            addTagToCardMutation.mutate(tag.id);
        }
    };

    return (
        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 relative" ref={popoverRef}>
            <div className="flex items-center space-x-3 w-40 shrink-0">
                <TagIcon className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-slate-800">Labels</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {cardTags.map(tag => (
                    <span 
                        key={tag.id} 
                        className={`px-3 py-1 rounded-md text-white text-sm font-medium ${tag.color} ${!isViewer ? 'cursor-pointer hover:opacity-100' : 'cursor-default'} opacity-90 transition-opacity`}
                        onClick={() => !isViewer && setIsPopoverOpen(true)}
                    >
                        {tag.name || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                    </span>
                ))}
                
                {!isViewer && (
                    <button 
                        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                        className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-200/60 hover:bg-slate-300/60 text-slate-600 transition-colors"
                        title="Add labels"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isPopoverOpen && (
                <div className="absolute top-full left-8 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm">
                            {isCreateMode ? 'Create label' : 'Labels'}
                        </h4>
                        <button onClick={() => { setIsPopoverOpen(false); setIsCreateMode(false); }} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {!isCreateMode ? (
                        <>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {boardTags.map(tag => {
                                    const isSelected = cardTags.some(t => t.id === tag.id);
                                    return (
                                        <div 
                                            key={tag.id}
                                            onClick={() => toggleTag(tag)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-md text-white text-sm font-medium cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 ${tag.color} group`}
                                        >
                                            <span>{tag.name}</span>
                                            <div className="flex items-center space-x-1">
                                                {isSelected && <Check className="w-4 h-4 text-white" />}
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to delete this label?')) {
                                                                deleteTagMutation.mutate(tag.id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-black/20 rounded transition-all opacity-80 hover:opacity-100"
                                                        title="Delete label"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <button 
                                onClick={() => setIsCreateMode(true)}
                                className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors"
                            >
                                Create a new label
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={newTagName}
                                    onChange={e => setNewTagName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                    placeholder="Label name..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Color</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TAG_COLORS.map(c => (
                                        <div 
                                            key={c.hex}
                                            onClick={() => setNewTagColor(c.hex)}
                                            className={`h-8 rounded-md cursor-pointer ${c.hex} flex items-center justify-center transition-transform hover:scale-105`}
                                        >
                                            {newTagColor === c.hex && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2 pt-2 border-t border-slate-100">
                                <button 
                                    onClick={() => createTagMutation.mutate()}
                                    disabled={createTagMutation.isPending}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Create
                                </button>
                                <button 
                                    onClick={() => setIsCreateMode(false)}
                                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TagsBlock;
