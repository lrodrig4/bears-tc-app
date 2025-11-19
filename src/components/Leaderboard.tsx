import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Trophy, Flame, MapPin } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [athletes, setAthletes] = useState<User[]>([]);
  const [tab, setTab] = useState<'streak' | 'attendance'>('streak');

  useEffect(() => { setAthletes(StorageService.getAllUsers().filter(u => u.role === 'athlete')); }, []);

  const sortedAthletes = [...athletes].sort((a, b) => {
      if (tab === 'streak') return StorageService.getUserStreak(b.id) - StorageService.getUserStreak(a.id);
      const aCount = StorageService.getAttendance().filter(r => r.userId === a.id).length;
      const bCount = StorageService.getAttendance().filter(r => r.userId === b.id).length;
      return bCount - aCount;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="bg-brand-900 p-4 text-white">
           <h2 className="font-bold text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Team Leaderboard</h2>
           <div className="flex gap-2 mt-3"><button onClick={() => setTab('streak')} className={`flex-1 text-xs font-bold py-1.5 rounded ${tab === 'streak' ? 'bg-white text-brand-900' : 'bg-brand-800 text-brand-200'}`}>Streak</button><button onClick={() => setTab('attendance')} className={`flex-1 text-xs font-bold py-1.5 rounded ${tab === 'attendance' ? 'bg-white text-brand-900' : 'bg-brand-800 text-brand-200'}`}>Total</button></div>
       </div>
       <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
           {sortedAthletes.map((athlete, idx) => {
               const streak = StorageService.getUserStreak(athlete.id);
               const checkins = StorageService.getAttendance().filter(r => r.userId === athlete.id).length;
               const value = tab === 'streak' ? streak : checkins;
               return (<div key={athlete.id} className="p-3 flex items-center justify-between hover:bg-slate-50"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</div><div><div className="font-bold text-sm text-slate-800">{athlete.name}</div><div className="text-[10px] text-slate-400">{athlete.group}</div></div></div><div className="font-mono font-bold text-lg flex items-center gap-1 text-slate-700">{value} {tab === 'streak' ? <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> : <MapPin className="w-4 h-4 text-brand-500" />}</div></div>);
           })}
       </div>
    </div>
  );
};
export default Leaderboard;