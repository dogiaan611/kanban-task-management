import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Trash2 } from 'lucide-react';
import { getChecklistsByCard, createChecklist, updateChecklist, deleteChecklist, type ChecklistItem } from '../../api/checklistService';

interface ChecklistBlockProps {
    cardId: number;
}

const ChecklistBlock: React.FC<ChecklistBlockProps> = ({ cardId }) => {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChecklists();
    }, [cardId]);

    const loadChecklists = async () => {
        try {
            setLoading(true);
            const data = await getChecklistsByCard(cardId);
            // Sort by createdAt or position
            setItems(data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to load checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        try {
            const newItem = await createChecklist(cardId, newItemTitle.trim());
            setItems([...items, newItem]);
            setNewItemTitle('');
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to add item:', error);
        }
    };

    const handleToggleComplete = async (item: ChecklistItem) => {
        // Optimistic update
        const updatedItems = items.map(i => i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i);
        setItems(updatedItems);

        try {
            await updateChecklist(item.id, { isCompleted: !item.isCompleted });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to update item:', error);
            // Revert on error
            setItems(items);
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            await deleteChecklist(id);
            setItems(items.filter(i => i.id !== id));
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    if (loading) {
        return <div className="text-slate-500 text-sm py-4 animate-pulse">Loading checklist...</div>;
    }

    const completedCount = items.filter(i => i.isCompleted).length;
    const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

    return (
        <div className="pt-2">

            {/* Progress Bar */}
            <div className="flex items-center space-x-3 mb-4">
                <span className="text-xs font-bold text-slate-500 w-8">{progress}%</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 mb-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-start group">
                        <div className="flex-shrink-0 pt-1">
                            <input 
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => handleToggleComplete(item)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                        </div>
                        <div className="ml-3 flex-1">
                            <span className={`text-sm ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                                {item.title}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="mt-2">
                <div className="flex items-center space-x-2">
                    <input 
                        type="text"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="Add an item..."
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                        type="submit"
                        disabled={!newItemTitle.trim()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChecklistBlock;
