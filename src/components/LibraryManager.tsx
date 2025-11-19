import React, { useState, useEffect } from 'react';
import { LibraryItem, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { Search, Trash2, CheckCircle, BookOpen } from 'lucide-react';

interface LibraryManagerProps { onLoadWorkout: (workout: ParsedWorkout) => void; }

const LibraryManager: React.FC<LibraryManagerProps> = ({ onLoadWorkout }) => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { setLibrary(StorageService.getLibrary()); }, []);
  const filteredLibrary = library.filter(item => item.workout.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6"><BookOpen className="w-6 h-6 text-brand-600" /><h2 className="text-xl font-bold text-slate-800">Workout Library</h2></div>
        <div className="relative mb-6"><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 p-3 border border-slate-200 rounded-lg" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredLibrary.map(item => (<div key={item.id} className="group border rounded-xl p-4 relative"><h3 className="font-bold text-slate-800">{item.workout.title}</h3><p className="text-xs text-slate-500 mt-1">{item.workout.description}</p><div className="flex flex-wrap gap-1 mt-2">{item.tags.map(t => (<span key={t} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{t}</span>))}</div><div className="mt-3 pt-3 border-t"><button onClick={() => onLoadWorkout(item.workout)} className="w-full bg-brand-50 text-brand-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"><CheckCircle className="w-3 h-3" /> Use</button></div><button onClick={(e) => { e.stopPropagation(); if(confirm("Delete?")) { StorageService.deleteFromLibrary(item.id); setLibrary(prev => prev.filter(i => i.id !== item.id)); } }} className="absolute top-3 right-3 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>))}</div>
    </div>
  );
};
export default LibraryManager;