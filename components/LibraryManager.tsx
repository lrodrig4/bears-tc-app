
import React, { useState, useEffect } from 'react';
import { LibraryItem, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { Search, Trash2, CheckCircle, BookOpen } from 'lucide-react';

interface LibraryManagerProps {
  onLoadWorkout: (workout: ParsedWorkout) => void;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({ onLoadWorkout }) => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      setLibrary(StorageService.getLibrary());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Remove this workout from library?")) {
        StorageService.deleteFromLibrary(id);
        setLibrary(prev => prev.filter(i => i.id !== id));
      }
  };

  const filteredLibrary = library.filter(item => {
      const q = searchQuery.toLowerCase();
      return item.workout.title.toLowerCase().includes(q) || 
             item.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-800">Workout Library</h2>
        </div>

        {/* Search */}
        <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input 
                className="w-full pl-10 p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Search by title or tags (e.g. 'Tempo', 'Hills')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Grid */}
        {filteredLibrary.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-sm">
                    {searchQuery ? 'No matching workouts found.' : 'Library is empty. Save generated workouts in the Builder to see them here.'}
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLibrary.map(item => (
                    <div key={item.id} className="group border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-md transition-all bg-white relative">
                        <div className="pr-8">
                            <h3 className="font-bold text-slate-800">{item.workout.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.workout.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map(t => (
                                    <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{t}</span>
                                ))}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-400 font-mono mb-2">{item.workout.items.length} Intervals</p>
                                <button 
                                    onClick={() => onLoadWorkout(item.workout)}
                                    className="w-full bg-brand-50 text-brand-700 border border-brand-200 py-2 rounded-lg text-xs font-bold hover:bg-brand-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-3 h-3" /> Use This Workout
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="absolute top-3 right-3 text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default LibraryManager;
