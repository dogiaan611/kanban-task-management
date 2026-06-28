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
        assigneeId?: number;
        assigneeName?: string;
        assigneeAvatarUrl?: string;
    };
    listTitle: string;
    index: number;
    onDelete: (id: number) => void;
    isDragDisabled?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, listTitle, index, onDelete, isDragDisabled = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
        <Draggable draggableId={`card-${card.id}`} index={index} isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    onClick={() => setIsModalOpen(true)}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 group relative ${isDragDisabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
                        snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100 z-50 opacity-90' : 'hover:border-emerald-300 hover:shadow-md transition-all duration-200'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
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
                            <div className="flex items-center justify-between">
                                <p className="text-slate-700 font-medium text-sm leading-relaxed break-words flex-1 pr-2">{card.title}</p>
                                <div className="flex items-center space-x-1 shrink-0">
                                    {card.assigneeId && (
                                        <div className="relative">
                                            {card.assigneeAvatarUrl ? (
                                                <img src={card.assigneeAvatarUrl} alt={card.assigneeName} className="w-6 h-6 rounded-full object-cover shadow-sm border border-slate-200" title={`Assigned to ${card.assigneeName}`} />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm border border-slate-200" title={`Assigned to ${card.assigneeName}`}>
                                                    {card.assigneeName?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
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
