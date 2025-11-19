
import React, { useState, useEffect } from 'react';
import { ScheduledWorkout, TrainingGroup, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { ChevronLeft, ChevronRight, Trash2, Copy, Filter } from 'lucide-react';
import Select from './ui/Select';

interface CalendarProps {
  workouts: ScheduledWorkout[];
  onSelectDate: (date: string) => void;
  onDeleteWorkout: (id: string) => void;
  onRepeatWorkout: (workout: ParsedWorkout) => void;
}

const Calendar: React.FC<CalendarProps> = ({ workouts, onSelectDate, onDeleteWorkout, onRepeatWorkout }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [filterGroup, setFilterGroup] = useState<string>('All'); // String for Select
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
      setGroups(StorageService.getGroups());
  }, []);

  // Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  // Empty slots for start of month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border border-slate-100 bg-slate-50/50"></div>);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    // Filter Logic
    const dayWorkouts = workouts.filter(w => {
        const dateMatch = w.date === dateStr;
        const groupMatch = filterGroup === 'All' || w.groups.includes(filterGroup);
        return dateMatch && groupMatch;
    });

    days.push(
      <div 
        key={d} 
        onClick={() => onSelectDate(dateStr)}
        className={`h-28 border border-slate-100 p-1 relative cursor-pointer hover:bg-blue-50 transition-colors ${isToday ? 'bg-brand-50 ring-1 ring-inset ring-brand-200' : 'bg-white'}`}
      >
        <span className={`text-xs font-bold p-1 rounded ${isToday ? 'text-brand-600 bg-brand-100' : 'text-slate-400'}`}>{d}</span>
        
        <div className="mt-1 space-y-1 overflow-y-auto h-20 scrollbar-thin scrollbar-thumb-slate-200">
            {dayWorkouts.map(w => (
                <div key={w.id} className="group relative bg-white border-l-4 border-brand-500 pl-2 pr-1 py-1 rounded-r border-y border-r border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate">{w.groups.length > 3 ? 'All Groups' : w.groups.map(g => g).join(', ')}</div>
                    <div className="font-bold text-xs text-slate-800 leading-tight line-clamp-2">{w.workout.title}</div>
                    
                    {/* Hover Actions */}
                    <div className="absolute right-1 top-1 hidden group-hover:flex gap-1 bg-white/90 backdrop-blur-sm p-0.5 rounded shadow-sm border border-slate-100">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onRepeatWorkout(w.workout); }}
                            className="text-brand-600 hover:bg-brand-50 p-1 rounded"
                            title="Clone"
                        >
                            <Copy className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteWorkout(w.id); }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
                 <h2 className="font-black text-2xl text-slate-800 tracking-tight">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Group Filter */}
            <div className="w-full md:w-64">
                <Select 
                    icon={<Filter className="w-3 h-3" />}
                    value={filterGroup}
                    onChange={setFilterGroup}
                    options={["All", ...groups]}
                    placeholder="Filter by Group"
                />
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 bg-slate-50 gap-px border-b border-slate-200">
            {days}
        </div>
    </div>
  );
};

export default Calendar;
