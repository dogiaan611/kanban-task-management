import React from 'react';
import { Search, X, Users, Tag as TagIcon, Calendar } from 'lucide-react';
import type { BoardMember } from '../../api/boardService';
import type { Tag } from '../../api/tagService';

interface BoardFilterBarProps {
    keyword: string;
    setKeyword: (kw: string) => void;
    assigneeIds: number[];
    setAssigneeIds: (ids: number[]) => void;
    tagIds: number[];
    setTagIds: (ids: number[]) => void;
    members: BoardMember[];
    tags: Tag[];
    onClearFilters: () => void;
}

const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
    keyword, setKeyword, assigneeIds, setAssigneeIds, tagIds, setTagIds, members, tags, onClearFilters
}) => {
    const isFilterActive = keyword.trim() !== '' || assigneeIds.length > 0 || tagIds.length > 0;

    const toggleAssignee = (id: number) => {
        setAssigneeIds(assigneeIds.includes(id) ? assigneeIds.filter(aId => aId !== id) : [...assigneeIds, id]);
    };

    const toggleTag = (id: number) => {
        setTagIds(tagIds.includes(id) ? tagIds.filter(tId => tId !== id) : [...tagIds, id]);
    };

    return (
        <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm flex flex-wrap gap-4 items-start md:items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                />
                {keyword && (
                    <button onClick={() => setKeyword('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filter by Assignee */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                    <Users className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Members</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {members.map(member => {
                        const isSelected = assigneeIds.includes(member.userId);
                        return (
                            <button
                                key={member.userId}
                                onClick={() => toggleAssignee(member.userId)}
                                className={`flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                                    isSelected 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                                title={member.fullName}
                            >
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                        {member.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span>{member.fullName.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            {/* Filter by Tags */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                    <TagIcon className="w-4 h-4 mr-2 text-slate-500" />
                    <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => {
                        const isSelected = tagIds.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                    isSelected 
                                        ? `ring-2 ring-offset-1 ring-emerald-400 ${tag.color} text-slate-800` 
                                        : `${tag.color} text-slate-700 hover:brightness-95 border border-black/5`
                                }`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Clear Filters Button */}
            {isFilterActive && (
                <button
                    onClick={onClearFilters}
                    className="ml-auto flex items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 mr-1.5" />
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default BoardFilterBar;
