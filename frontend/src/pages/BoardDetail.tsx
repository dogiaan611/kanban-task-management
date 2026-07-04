import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, LayoutGrid, Filter } from 'lucide-react';
import KanbanList from '../components/kanban/KanbanList';
import BoardFilterBar from '../components/kanban/BoardFilterBar';
import CalendarView from '../components/kanban/CalendarView';
import CardDetailModal from '../components/kanban/CardDetailModal';
import * as kanbanService from '../api/kanbanService';
import { getBoardById, getBoardMembers } from '../api/boardService';
import { getTagsByBoard } from '../api/tagService';
import { createWebSocketClient } from '../api/webSocketService';

const BoardDetail = () => {
    const { id } = useParams<{ id: string }>();
    const boardId = Number(id);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterAssigneeIds, setFilterAssigneeIds] = useState<number[]>([]);
    const [filterTagIds, setFilterTagIds] = useState<number[]>([]);

    // View State
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    const [selectedCardForModal, setSelectedCardForModal] = useState<any | null>(null);

    // Lấy tên Board từ API
    const { data: boardInfo } = useQuery({
        queryKey: ['board', boardId],
        queryFn: () => getBoardById(boardId),
        enabled: !!boardId
    });

    const { data: lists, isLoading } = useQuery({
        queryKey: ['lists', boardId],
        queryFn: () => kanbanService.getListsByBoard(boardId),
        enabled: !!boardId,
        meta: { boardId }
    });

    const { data: members = [] } = useQuery({
        queryKey: ['boardMembers', boardId],
        queryFn: () => getBoardMembers(boardId),
        enabled: !!boardId
    });

    const { data: tags = [] } = useQuery({
        queryKey: ['tags', boardId],
        queryFn: () => getTagsByBoard(boardId),
        enabled: !!boardId
    });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentMemberRole = members.find((m: any) => m.email === currentUser.email)?.role || 'MEMBER';
    const isViewer = currentMemberRole === 'VIEWER';

    const isFilterActive = filterKeyword.trim() !== '' || filterAssigneeIds.length > 0 || filterTagIds.length > 0;

    const filteredLists = React.useMemo(() => {
        if (!lists) return [];
        if (!isFilterActive) return lists;

        return lists.map((list: any) => ({
            ...list,
            cards: list.cards?.filter((card: any) => {
                let match = true;
                if (filterKeyword.trim()) {
                    const kw = filterKeyword.toLowerCase();
                    match = match && ((card.title?.toLowerCase().includes(kw)) || (card.description?.toLowerCase().includes(kw)));
                }
                if (filterAssigneeIds.length > 0) {
                    match = match && filterAssigneeIds.includes(card.assigneeId);
                }
                if (filterTagIds.length > 0) {
                    match = match && filterTagIds.some(tagId => card.tags?.some((t: any) => t.id === tagId));
                }
                return match;
            })
        }));
    }, [lists, isFilterActive, filterKeyword, filterAssigneeIds, filterTagIds]);

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

    // View mode listener
    useEffect(() => {
        const handleViewChange = (e: any) => setViewMode(e.detail);
        const handleToggleFilter = () => setIsFilterOpen(prev => !prev);
        
        window.addEventListener('requestBoardView', handleViewChange);
        window.addEventListener('toggleBoardFilter', handleToggleFilter);
        
        return () => {
            window.removeEventListener('requestBoardView', handleViewChange);
            window.removeEventListener('toggleBoardFilter', handleToggleFilter);
        };
    }, []);

    // Check modal card from URL
    useEffect(() => {
        const cardId = searchParams.get('cardId');
        if (cardId && lists) {
            let foundCard = null;
            for (const list of lists) {
                const card = list.cards?.find((c: any) => c.id === Number(cardId));
                if (card) {
                    foundCard = card;
                    break;
                }
            }
            if (foundCard) {
                setSelectedCardForModal(foundCard);
            }
        } else if (!cardId) {
            setSelectedCardForModal(null);
        }
    }, [searchParams, lists]);

    const handleCloseCardModal = () => {
        setSelectedCardForModal(null);
        setSearchParams(new URLSearchParams());
    };

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
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-emerald-50/30 overflow-hidden relative">

            {isFilterOpen && (
                <BoardFilterBar
                    members={members}
                    tags={tags}
                    keyword={filterKeyword}
                    setKeyword={setFilterKeyword}
                    assigneeIds={filterAssigneeIds}
                    setAssigneeIds={setFilterAssigneeIds}
                    tagIds={filterTagIds}
                    setTagIds={setFilterTagIds}
                />
            )}

            {/* Board Content */}
            {viewMode === 'board' ? (
                <div className="flex-1 overflow-hidden flex flex-col bg-slate-100 border-none">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 pb-12">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="board" type="list" direction="horizontal" isDropDisabled={isViewer}>
                                {(provided) => (
                                    <div
                                        className="flex items-start gap-4 md:gap-6 h-full flex-nowrap"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {filteredLists?.map((list: any, index: number) => {
                                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                            const currentMember = members.find((m: any) => m.userId === currentUser.id);
                                            const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'ROLE_ADMIN';
                                            return (
                                                <KanbanList
                                                    key={list.id}
                                                    list={list}
                                                    index={index}
                                                    isViewer={isViewer}
                                                    isDragDisabled={isViewer}
                                                    isAdmin={isAdmin}
                                                    onDeleteList={(id) => deleteListMutation.mutate(id)}
                                                    onCreateCard={(listId, title) => createCardMutation.mutate({ listId, title })}
                                                    onDeleteCard={(id) => deleteCardMutation.mutate(id)}
                                                />
                                            );
                                        })}
                                        {provided.placeholder}

                                        {/* Add New List Button */}
                                        {!isViewer && (
                                            <div className="shrink-0 w-72 md:w-80">
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
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden p-4 md:p-6">
                    <CalendarView lists={filteredLists} onCardClick={(card) => {
                        setSearchParams({ cardId: card.id.toString() });
                    }} />
                </div>
            )}

            {selectedCardForModal && (
                <CardDetailModal 
                    card={selectedCardForModal} 
                    listTitle={lists?.find((l: any) => l.cards?.some((c: any) => c.id === selectedCardForModal.id))?.title || 'Unknown List'}
                    onClose={handleCloseCardModal}
                    isViewer={isViewer}
                />
            )}
        </div>
    );
};

export default BoardDetail;
