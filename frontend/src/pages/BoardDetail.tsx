import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, LayoutGrid, Search, Filter, X, User, Calendar } from 'lucide-react';
import KanbanList from '../components/kanban/KanbanList';
import BoardMembersBar from '../components/kanban/BoardMembersBar';
import CalendarView from '../components/kanban/CalendarView';
import * as kanbanService from '../api/kanbanService';
import { getBoardById, getBoardMembers } from '../api/boardService';
import { createWebSocketClient } from '../api/webSocketService';

const BoardDetail = () => {
    const { id } = useParams<{ id: string }>();
    const boardId = Number(id);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    // State quản lý chế độ xem (Board / Lịch)
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');

    // State cho tìm kiếm và bộ lọc
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null);

    // Lấy tên Board từ API
    const { data: boardInfo } = useQuery({
        queryKey: ['board', boardId],
        queryFn: () => getBoardById(boardId),
        enabled: !!boardId
    });

    // Lấy danh sách thành viên của board phục vụ bộ lọc
    const { data: members = [] } = useQuery({
        queryKey: ['boardMembers', boardId],
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId
    });

    const { data: lists, isLoading } = useQuery({
        queryKey: ['lists', boardId],
        queryFn: () => kanbanService.getListsByBoard(boardId),
        enabled: !!boardId,
        meta: { boardId }
    });

    // Gom danh sách các tag duy nhất từ các cards hiện có để làm bộ lọc
    const uniqueTags = useMemo(() => {
        const tagsMap = new Map<number, { id: number; name: string; color: string }>();
        lists?.forEach((list: any) => {
            list.cards?.forEach((card: any) => {
                card.tags?.forEach((tag: any) => {
                    tagsMap.set(tag.id, tag);
                });
            });
        });
        return Array.from(tagsMap.values());
    }, [lists]);

    useEffect(() => {
        if (!boardId) return;

        const client = createWebSocketClient();
        
        client.onConnect = () => {
            console.log('Connected to WS for board', boardId);
            client.subscribe(`/topic/board/${boardId}`, (message) => {
                console.log('Board updated via WS:', message.body);
                queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
            });
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [boardId, queryClient]);

    const createListMutation = useMutation({
        mutationFn: (title: string) => kanbanService.createList(boardId, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
            setIsAddingList(false);
            setNewListTitle('');
        }
    });

    const deleteListMutation = useMutation({
        mutationFn: (listId: number) => kanbanService.deleteList(listId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] })
    });

    const createCardMutation = useMutation({
        mutationFn: ({ listId, title }: { listId: number, title: string }) => kanbanService.createCard(listId, title),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] })
    });

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: number) => kanbanService.deleteCard(cardId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] })
    });

    const updateListPosMutation = useMutation({
        mutationFn: ({ listId, pos }: { listId: number, pos: number }) => kanbanService.updateListPosition(listId, pos)
    });

    const updateCardPosMutation = useMutation({
        mutationFn: ({ cardId, pos, parentId }: { cardId: number, pos: number, parentId?: number }) => kanbanService.updateCardPosition(cardId, pos, parentId)
    });

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (newListTitle.trim()) {
            createListMutation.mutate(newListTitle);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, type, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Clone current state for optimistic update
        const currentLists = Array.from((lists as any[]) || []);

        if (type === 'list') {
            // Reordering lists
            const listId = Number(draggableId.split('-')[1]);
            const movedList = currentLists.splice(source.index, 1)[0] as any;
            currentLists.splice(destination.index, 0, movedList);

            // Calculate new position
            let newPos = 0;
            if (destination.index === 0) {
                newPos = (currentLists[1]?.position || 65536) / 2;
            } else if (destination.index === currentLists.length - 1) {
                newPos = currentLists[destination.index - 1].position + 65536;
            } else {
                newPos = (currentLists[destination.index - 1].position + currentLists[destination.index + 1].position) / 2;
            }

            movedList.position = newPos;
            queryClient.setQueryData(['lists', boardId], currentLists);
            updateListPosMutation.mutate({ listId, pos: newPos });
            
        } else if (type === 'card') {
            // Reordering cards
            const sourceListId = Number(source.droppableId.split('-')[1]);
            const destListId = Number(destination.droppableId.split('-')[1]);
            const cardId = Number(draggableId.split('-')[1]);

            const sourceList = currentLists.find(l => l.id === sourceListId);
            const destList = currentLists.find(l => l.id === destListId);

            if (!sourceList || !destList) return;

            const sourceCards = Array.from((sourceList.cards as any[]) || []);
            const destCards = sourceListId === destListId ? sourceCards : Array.from((destList.cards as any[]) || []);

            const movedCard = sourceCards.splice(source.index, 1)[0] as any;
            destCards.splice(destination.index, 0, movedCard);

            let newPos = 0;
            if (destination.index === 0) {
                newPos = (destCards[1]?.position || 65536) / 2;
            } else if (destination.index === destCards.length - 1) {
                newPos = destCards[destination.index - 1].position + 65536;
            } else {
                newPos = (destCards[destination.index - 1].position + destCards[destination.index + 1].position) / 2;
            }

            movedCard.position = newPos;

            sourceList.cards = sourceCards;
            if (sourceListId !== destListId) {
                destList.cards = destCards;
                updateCardPosMutation.mutate({ cardId, pos: newPos, parentId: destListId });
            } else {
                updateCardPosMutation.mutate({ cardId, pos: newPos });
            }

            queryClient.setQueryData(['lists', boardId], currentLists);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50/30 overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-3 bg-white/40 backdrop-blur-sm border-b border-slate-200/40 shrink-0">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Tìm kiếm text */}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cards..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all text-slate-700 font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Bộ lọc Tag */}
                    <div className="relative">
                        <select
                            value={selectedTagId || ''}
                            onChange={(e) => setSelectedTagId(e.target.value ? Number(e.target.value) : null)}
                            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 text-slate-700 font-medium cursor-pointer"
                        >
                            <option value="">All Tags</option>
                            {uniqueTags.map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Bộ lọc Assignee */}
                    <div className="relative">
                        <select
                            value={selectedAssigneeId || ''}
                            onChange={(e) => setSelectedAssigneeId(e.target.value ? Number(e.target.value) : null)}
                            className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 text-slate-700 font-medium cursor-pointer"
                        >
                            <option value="">All Assignees</option>
                            {members.map(member => (
                                <option key={member.id} value={member.userId}>{member.fullName}</option>
                            ))}
                        </select>
                        <User className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Nút Clear Filters */}
                    {(searchQuery || selectedTagId !== null || selectedAssigneeId !== null) && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedTagId(null);
                                setSelectedAssigneeId(null);
                            }}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/60 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Chuyển đổi View Mode */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'board'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Board</span>
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'calendar'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board Area hoặc Calendar Area */}
            <div className="flex-1 overflow-hidden p-8 flex flex-col">
                {viewMode === 'calendar' ? (
                    <CalendarView lists={lists || []} />
                ) : (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="board" type="list" direction="horizontal">
                                {(provided) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex items-start space-x-6 h-full"
                                    >
                                        {lists?.map((list: any, index: number) => {
                                            // Thực hiện lọc cards tại client
                                            const filteredCards = list.cards?.filter((card: any) => {
                                                // Tìm kiếm text
                                                if (searchQuery.trim()) {
                                                    const query = searchQuery.toLowerCase();
                                                    const matchTitle = card.title?.toLowerCase().includes(query);
                                                    const matchDesc = card.description?.toLowerCase().includes(query);
                                                    if (!matchTitle && !matchDesc) return false;
                                                }
                                                // Lọc theo tag
                                                if (selectedTagId !== null) {
                                                    const hasTag = card.tags?.some((t: any) => t.id === selectedTagId);
                                                    if (!hasTag) return false;
                                                }
                                                // Lọc theo assignee
                                                if (selectedAssigneeId !== null) {
                                                    if (card.assigneeId !== selectedAssigneeId) return false;
                                                }
                                                return true;
                                            }) || [];

                                            const filteredList = {
                                                ...list,
                                                cards: filteredCards
                                            };

                                            return (
                                                <KanbanList
                                                    key={list.id}
                                                    list={filteredList}
                                                    index={index}
                                                    onDeleteList={(id) => deleteListMutation.mutate(id)}
                                                    onCreateCard={(listId, title) => createCardMutation.mutate({ listId, title })}
                                                    onDeleteCard={(id) => deleteCardMutation.mutate(id)}
                                                />
                                            );
                                        })}
                                        {provided.placeholder}

                                        {/* Add New List Button */}
                                        <div className="shrink-0 w-80">
                                            {isAddingList ? (
                                                <form onSubmit={handleCreateList} className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-200">
                                                    <input
                                                        type="text"
                                                        value={newListTitle}
                                                        onChange={(e) => setNewListTitle(e.target.value)}
                                                        placeholder="Enter list title..."
                                                        className="w-full px-3 py-2 text-sm outline-none text-slate-700 bg-slate-50 rounded-lg mb-3 border border-slate-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                                            Add List
                                                        </button>
                                                        <button type="button" onClick={() => setIsAddingList(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => setIsAddingList(true)}
                                                    className="w-full flex items-center px-5 py-4 bg-white/50 hover:bg-white text-slate-600 font-medium rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-300 transition-all group"
                                                >
                                                    <Plus className="w-5 h-5 mr-2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                                    Add another list
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )}
            </div>


        </div>
    );
};

export default BoardDetail;
