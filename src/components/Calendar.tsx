import React, { useState, useEffect } from 'react';
import { ScheduledWorkout, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { ChevronLeft, ChevronRight, Trash2, Copy, Filter, Move } from 'lucide-react';
import Select from './ui/Select';

interface CalendarProps {
  workouts: ScheduledWorkout[];
  onSelectDate: (date: string) => void;
  onDeleteWorkout: (id: string) => void;
  onRepeatWorkout: (workout: ParsedWorkout) => void;
  onMoveWorkout?: (workoutId: string, newDate: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ workouts, onSelectDate, onDeleteWorkout, onRepeatWorkout, onMoveWorkout }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [groups, setGroups] = useState<string[]>([]);
  const [draggedWorkout, setDraggedWorkout] = useState<string | null>(null);

  useEffect(() => { setGroups(StorageService.getGroups()); }, []);

  const handleDragStart = (e: React.DragEvent, workoutId: string) => {
    setDraggedWorkout(workoutId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', workoutId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newDate: string) => {
    e.preventDefault();
    if (draggedWorkout && onMoveWorkout) {
      onMoveWorkout(draggedWorkout, newDate);
    }
    setDraggedWorkout(null);
  };

  const handleDragEnd = () => {
    setDraggedWorkout(null);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-24 border border-slate-100 bg-slate-50/50"></div>);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const dayWorkouts = workouts.filter(w => w.date === dateStr && (filterGroup === 'All' || w.groups.includes(filterGroup)));
    days.push(
      <div
        key={d}
        onClick={() => onSelectDate(dateStr)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, dateStr)}
        className={`h-28 border border-slate-100 p-1 relative cursor-pointer hover:bg-blue-50 transition-colors ${
          isToday ? 'bg-brand-50 ring-1 ring-inset ring-brand-200' : 'bg-white'
        }`}
      >
        <span className={`text-xs font-bold p-1 rounded ${isToday ? 'text-brand-600 bg-brand-100' : 'text-slate-400'}`}>{d}</span>
        <div className="mt-1 space-y-1 overflow-y-auto h-20 scrollbar-thin scrollbar-thumb-slate-200">
            {dayWorkouts.map(w => (
                <div
                  key={w.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, w.id)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-white border-l-4 border-brand-500 pl-2 pr-1 py-1 rounded-r border-y border-r border-slate-100 shadow-sm hover:shadow-md transition-all ${
                    draggedWorkout === w.id ? 'opacity-50' : ''
                  } cursor-move`}
                >
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5 truncate flex items-center gap-1">
                      <Move className="w-2.5 h-2.5 text-brand-400" />
                      {w.groups.length > 3 ? 'All Groups' : w.groups.join(', ')}
                    </div>
                    <div className="font-bold text-xs text-slate-800 leading-tight line-clamp-2">{w.workout.title}</div>
                    <div className="absolute right-1 top-1 hidden group-hover:flex gap-1 bg-white/90 backdrop-blur-sm p-0.5 rounded shadow-sm border border-slate-100">
                         <button onClick={(e) => { e.stopPropagation(); onRepeatWorkout(w.workout); }} className="text-brand-600 hover:bg-brand-50 p-1 rounded" title="Copy Workout"><Copy className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteWorkout(w.id); }} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Delete Workout"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
                 <h2 className="font-black text-2xl text-slate-800 tracking-tight">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-white rounded-md text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1.5 hover:bg-white rounded-md text-slate-600 text-xs font-bold">Today</button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-white rounded-md text-slate-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-medium">Drag to reschedule</span>
              </div>
              <div className="w-full md:w-64"><Select icon={<Filter className="w-3 h-3" />} value={filterGroup} onChange={setFilterGroup} options={["All", ...groups]} placeholder="Filter by Group" /></div>
            </div>
        </div>
        <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>))}</div>
        <div className="grid grid-cols-7 bg-slate-50 gap-px border-b border-slate-200">{days}</div>
    </div>
  );
};
export default Calendar;
