import React from 'react';
import { ScheduledWorkout } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AthleteCalendarProps {
  workouts: ScheduledWorkout[];
  userGroup: string;
  onSelectDate: (date: string) => void;
}

const AthleteCalendar: React.FC<AthleteCalendarProps> = ({ workouts, userGroup, onSelectDate }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-20 border border-slate-100 bg-slate-50/50"></div>);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const today = new Date();
    const isToday = today.toISOString().split('T')[0] === dateStr;
    const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);

    // Filter workouts for this athlete's group
    const dayWorkouts = workouts.filter(w => w.date === dateStr && w.groups.includes(userGroup));

    days.push(
      <div
        key={d}
        onClick={() => onSelectDate(dateStr)}
        className={`h-20 border border-slate-100 p-1 relative cursor-pointer hover:bg-brand-50 transition-colors ${
          isToday ? 'bg-brand-100 ring-2 ring-inset ring-brand-400' : isPast ? 'bg-slate-50' : 'bg-white'
        }`}
      >
        <span className={`text-xs font-bold p-1 rounded ${
          isToday ? 'text-brand-700 bg-brand-200' : isPast ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {d}
        </span>

        <div className="mt-1 overflow-hidden">
          {dayWorkouts.length > 0 ? (
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm">
              {dayWorkouts[0].workout.title.length > 20
                ? dayWorkouts[0].workout.title.substring(0, 20) + '...'
                : dayWorkouts[0].workout.title
              }
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-brand-50 to-white">
        <h2 className="font-black text-lg text-slate-800 tracking-tight">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1.5 hover:bg-white rounded-md text-slate-600 text-xs font-bold transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-white rounded-md text-slate-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 bg-slate-50 gap-px">
        {days}
      </div>

      {/* Legend */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-100 ring-2 ring-brand-400"></div>
          <span className="text-slate-600">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-500"></div>
          <span className="text-slate-600">Workout Scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default AthleteCalendar;
