import React, { useEffect, useState } from 'react';
import { X, AlignLeft, CreditCard, Calendar } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import ChecklistBlock from './ChecklistBlock';
import { updateCardDetail } from '../../api/kanbanService';

interface CardDetailModalProps {
    card: {
        id: number;
        title: string;
        description?: string;
        dueDate?: string;
        listId: number;
    };
    listTitle: string;
    onClose: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, listTitle, onClose }) => {
    const queryClient = useQueryClient();
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descValue, setDescValue] = useState(card.description || '');
    const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.substring(0, 10) : '');

    // Đóng modal khi ấn phím Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Đóng modal khi click ra ngoài (backdrop)
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSaveDescription = async () => {
        try {
            await updateCardDetail(card.id, { description: descValue });
            setIsEditingDesc(false);
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update description', error);
        }
    };

    const handleSaveDueDate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        setDueDate(dateStr);
        try {
            // dateStr is YYYY-MM-DD. backend expects LocalDateTime, append T00:00:00
            const isoDate = dateStr ? `${dateStr}T00:00:00` : undefined;
            await updateCardDetail(card.id, { dueDate: isoDate });
            queryClient.invalidateQueries({ queryKey: ['lists'] });
        } catch (error) {
            console.error('Failed to update due date', error);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-slate-50 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()} // Chặn event nổi bọt để không đóng khi click vào trong modal
            >
                {/* Header (Nút Close) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-12">
                    {/* Tiêu đề Card */}
                    <div className="flex items-start space-x-4 mb-8">
                        <CreditCard className="w-6 h-6 text-slate-700 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{card.title}</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                in list <span className="font-semibold underline decoration-slate-300">{listTitle}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-8">
                        {/* Cột chính (Bên trái) */}
                        <div className="col-span-3 space-y-8">
                            
                            {/* Mô tả */}
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <AlignLeft className="w-5 h-5 text-slate-700" />
                                    <h3 className="text-lg font-bold text-slate-800">Description</h3>
                                </div>
                                {isEditingDesc ? (
                                    <div className="ml-8">
                                        <textarea 
                                            value={descValue}
                                            onChange={e => setDescValue(e.target.value)}
                                            className="w-full bg-white p-4 rounded-md border border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-700 text-sm min-h-[100px] mb-2"
                                            placeholder="Add a more detailed description..."
                                            autoFocus
                                        />
                                        <div className="flex items-center space-x-2">
                                            <button onClick={handleSaveDescription} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                                                Save
                                            </button>
                                            <button onClick={() => setIsEditingDesc(false)} className="text-slate-500 hover:text-slate-700 px-3 py-1.5 hover:bg-slate-200 rounded-md text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => setIsEditingDesc(true)}
                                        className="ml-8 bg-slate-100/50 p-4 rounded-md border border-transparent hover:bg-slate-100 text-slate-600 text-sm min-h-[80px] cursor-pointer transition-colors"
                                    >
                                        {descValue ? descValue : 'Add a more detailed description...'}
                                    </div>
                                )}
                            </div>

                            {/* Checklist Block */}
                            <div className="ml-8">
                                <ChecklistBlock cardId={card.id} />
                            </div>

                        </div>

                        {/* Cột tính năng phụ (Bên phải) */}
                        <div className="col-span-1 space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add to card</h4>
                            <button className="w-full flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <span>Checklist</span>
                            </button>
                            
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">Options</h4>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Due Date</label>
                                <input 
                                    type="date" 
                                    value={dueDate}
                                    onChange={handleSaveDueDate}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDetailModal;
