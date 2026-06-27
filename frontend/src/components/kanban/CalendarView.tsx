import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import CardDetailModal from './CardDetailModal';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Card {
    id: number;
    title: string;
    description: string;
    dueDate?: string;
    assigneeName?: string;
    tags?: Tag[];
}

interface List {
    id: number;
    title: string;
    cards: Card[];
}

interface CalendarViewProps {
    lists: List[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ lists }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedCard, setSelectedCard] = useState<any | null>(null);

    // Gom tất cả cards có dueDate từ các list
    const cardsWithDueDate = useMemo(() => {
        const cards: (Card & { listTitle: string })[] = [];
        lists?.forEach(list => {
            list.cards?.forEach(card => {
                if (card.dueDate) {
                    cards.push({ ...card, listTitle: list.title });
                }
            });
        });
        return cards;
    }, [lists]);

    // Các thông số của tháng hiện tại
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month, 1);
    // Ngày cuối cùng của tháng
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Số ngày trong tháng
    const daysInMonth = lastDayOfMonth.getDate();
    // Thứ của ngày đầu tiên (0: Chủ nhật, 1: Thứ hai, ...)
    // Chuyển về: 0: Thứ hai, 1: Thứ ba... để lịch bắt đầu bằng Thứ hai
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    // Chuyển tháng
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Tạo mảng chứa các ô trong Grid lịch (bao gồm cả các ô trống của tháng trước)
    const calendarCells = useMemo(() => {
        const cells = [];
        // Ô trống tháng trước
        for (let i = 0; i < startDayIndex; i++) {
            cells.push({ day: null, dateStr: null });
        }
        // Các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Format YYYY-MM-DD
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cells.push({ day, dateStr, date });
        }
        return cells;
    }, [year, month, daysInMonth, startDayIndex]);

    // Lọc card thuộc về một ngày cụ thể
    const getCardsForDate = (dateStr: string) => {
        return cardsWithDueDate.filter(card => {
            if (!card.dueDate) return false;
            // card.dueDate định dạng ISO string (ví dụ "2026-06-27T17:00:00")
            return card.dueDate.startsWith(dateStr);
        });
    };

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden h-full">
            {/* Header Lịch */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-800">
                        {monthNames[month]} {year}
                    </h2>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-200/60 text-slate-600 rounded-lg transition-colors border border-slate-200 bg-white"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1.5 hover:bg-slate-200/60 text-sm font-semibold text-slate-700 rounded-lg transition-colors border border-slate-200 bg-white"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-200/60 text-slate-600 rounded-lg transition-colors border border-slate-200 bg-white"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid các thứ trong tuần */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/20 text-center py-2 shrink-0">
                {dayNames.map((day, idx) => (
                    <div key={idx} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Lịch Tháng */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-100/40 gap-px overflow-y-auto">
                {calendarCells.map((cell, idx) => {
                    const isToday = cell.dateStr === todayStr;
                    const dayCards = cell.dateStr ? getCardsForDate(cell.dateStr) : [];

                    return (
                        <div
                            key={idx}
                            className={`bg-white min-h-[100px] p-2 flex flex-col group/day transition-colors ${
                                cell.day ? 'hover:bg-slate-50/40' : 'bg-slate-50/20 pointer-events-none'
                            }`}
                        >
                            {cell.day && (
                                <div className="flex items-center justify-between mb-1 shrink-0">
                                    <span
                                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                                            isToday
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-slate-600 group-hover/day:bg-slate-100'
                                        }`}
                                    >
                                        {cell.day}
                                    </span>
                                    {dayCards.length > 0 && (
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {dayCards.length} {dayCards.length === 1 ? 'card' : 'cards'}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Danh sách các Cards có deadline vào ngày này */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-0.5">
                                {dayCards.map(card => {
                                    // Parse thời gian
                                    const timeStr = card.dueDate
                                        ? new Date(card.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '';

                                    return (
                                        <div
                                            key={card.id}
                                            onClick={() => setSelectedCard(card)}
                                            className="bg-white border border-slate-200/80 hover:border-emerald-400 p-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer text-left group"
                                        >
                                            {/* Tags */}
                                            {card.tags && card.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {card.tags.map(t => (
                                                        <span key={t.id} className={`w-3 h-1 rounded-full ${t.color}`} title={t.name} />
                                                    ))}
                                                </div>
                                            )}
                                            {/* Card Title */}
                                            <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-emerald-700 truncate">
                                                {card.title}
                                            </p>
                                            {/* Due time & Assignee */}
                                            <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-medium">
                                                <span className="flex items-center">
                                                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                                                    {timeStr}
                                                </span>
                                                {card.assigneeName && (
                                                    <span className="bg-slate-100 px-1 py-0.5 rounded text-[8px] max-w-[50px] truncate" title={card.assigneeName}>
                                                        {card.assigneeName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal chi tiết của Card khi click từ Lịch */}
            {selectedCard && (
                <CardDetailModal
                    card={{ ...selectedCard, listId: 0 }}
                    listTitle={selectedCard.listTitle}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </div>
    );
};

export default CalendarView;
