import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';

interface KanbanCardProps {
    card: {
        id: number;
        title: string;
        description: string;
    };
    index: number;
    onDelete: (id: number) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, index, onDelete }) => {
    return (
        <Draggable draggableId={`card-${card.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 group relative cursor-grab active:cursor-grabbing ${
                        snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100 z-50 opacity-90' : 'hover:border-emerald-300 hover:shadow-md transition-all duration-200'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <p className="text-slate-700 font-medium text-sm leading-relaxed pr-6">{card.title}</p>
                        <button
                            onClick={() => onDelete(card.id)}
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all absolute top-3 right-3"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default KanbanCard;
