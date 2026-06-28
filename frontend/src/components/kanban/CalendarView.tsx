import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
    lists: any[];
    onCardClick: (card: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ lists, onCardClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const cards = lists?.flatMap(list => list.cards || []) || [];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-800">{format(currentDate, dateFormat)}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors">
                        Today
                    </button>
                    <div className="flex space-x-1 border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={prevMonth} className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-slate-200"></div>
                        <button onClick={nextMonth} className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)] bg-slate-200 gap-px overflow-y-auto custom-scrollbar">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());
                    
                    const dayCards = cards.filter(card => {
                        if (!card.dueDate) return false;
                        const cardDate = parseISO(card.dueDate);
                        return isSameDay(cardDate, day);
                    });

                    return (
                        <div 
                            key={day.toString()} 
                            className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-slate-50 flex flex-col ${!isCurrentMonth ? 'opacity-60 bg-slate-50/50' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-2 shrink-0">
                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                                {dayCards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => onCardClick(card)}
                                        className="text-xs px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded-md cursor-pointer hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm flex items-center"
                                        title={card.title}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shrink-0"></div>
                                        <span className="truncate">{card.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
