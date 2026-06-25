import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';
import CardDetailModal from './CardDetailModal';

interface KanbanCardProps {
    card: {
        id: number;
        title: string;
        description: string;
        tags?: {id: number, name: string, color: string}[];
    };
    listTitle: string;
    index: number;
    onDelete: (id: number) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, listTitle, index, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
        <Draggable draggableId={`card-${card.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    onClick={() => setIsModalOpen(true)}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 group relative cursor-grab active:cursor-grabbing ${
                        snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100 z-50 opacity-90' : 'hover:border-emerald-300 hover:shadow-md transition-all duration-200'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-6">
                            {card.tags && card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {card.tags.map(tag => (
                                        <div 
                                            key={tag.id} 
                                            className={`h-2 w-10 rounded-full ${tag.color}`} 
                                            title={tag.name}
                                        />
                                    ))}
                                </div>
                            )}
                            <p className="text-slate-700 font-medium text-sm leading-relaxed">{card.title}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all absolute top-3 right-3"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
            {isModalOpen && (
                <CardDetailModal 
                    card={{...card, listId: 0}} // Placeholder for listId if not in card object
                    listTitle={listTitle}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default KanbanCard;
