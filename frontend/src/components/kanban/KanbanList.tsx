import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { Plus, Trash2 } from 'lucide-react';

interface KanbanListProps {
    list: {
        id: number;
        title: string;
        cards: any[];
    };
    index: number;
    onDeleteList: (id: number) => void;
    onCreateCard: (listId: number, title: string) => void;
    onDeleteCard: (cardId: number) => void;
}

const KanbanList: React.FC<KanbanListProps> = ({ list, index, onDeleteList, onCreateCard, onDeleteCard }) => {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    const handleCreateCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;
        onCreateCard(list.id, newCardTitle);
        setNewCardTitle('');
        setIsAddingCard(false);
    };

    return (
        <Draggable draggableId={`list-${list.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                    className={`bg-slate-50 rounded-2xl flex flex-col w-80 min-w-[320px] max-h-full border border-slate-200/60 shadow-sm ${
                        snapshot.isDragging ? 'shadow-xl ring-2 ring-emerald-400 z-50 opacity-90' : ''
                    }`}
                >
                    {/* List Header (Drag Handle) */}
                    <div 
                        {...provided.dragHandleProps}
                        className="px-5 py-4 flex items-center justify-between group cursor-grab active:cursor-grabbing border-b border-slate-200/50"
                    >
                        <h3 className="font-bold text-slate-700 text-base">{list.title}</h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onDeleteList(list.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Droppable Cards Area */}
                    <Droppable droppableId={`list-${list.id}`} type="card">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-[10px] custom-scrollbar flex flex-col gap-3 ${
                                    snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''
                                }`}
                            >
                                {list.cards?.map((card, idx) => (
                                    <KanbanCard key={card.id} card={card} listTitle={list.title} index={idx} onDelete={onDeleteCard} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* List Footer - Add Card */}
                    <div className="p-3 pt-0 mt-2">
                        {isAddingCard ? (
                            <form onSubmit={handleCreateCard} className="bg-white p-3 rounded-xl shadow-sm border border-emerald-200">
                                <textarea
                                    value={newCardTitle}
                                    onChange={(e) => setNewCardTitle(e.target.value)}
                                    placeholder="Enter a title for this card..."
                                    className="w-full text-sm resize-none outline-none text-slate-700 bg-transparent mb-3"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCreateCard(e);
                                        }
                                    }}
                                />
                                <div className="flex items-center space-x-2">
                                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                        Add Card
                                    </button>
                                    <button type="button" onClick={() => setIsAddingCard(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                        X
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAddingCard(true)}
                                className="w-full flex items-center text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add a card
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default KanbanList;
