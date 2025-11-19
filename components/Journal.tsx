
import React, { useState } from 'react';
import { JournalEntry, User } from '../types';
import { StorageService } from '../services/storage';
import { Activity, AlertCircle, CheckCircle2, Save, ChevronRight } from 'lucide-react';

interface JournalProps {
  workoutId: string;
  workoutTitle: string;
  user: User;
  onSaved: () => void;
  existingEntry?: JournalEntry;
}

const Journal: React.FC<JournalProps> = ({ workoutId, workoutTitle, user, onSaved, existingEntry }) => {
  const [rating, setRating] = useState(existingEntry?.rating || 5);
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [isInjured, setIsInjured] = useState(existingEntry?.isInjured || false);
  const [painLocation, setPainLocation] = useState(existingEntry?.painLocation || 'Knee');
  const [painLevel, setPainLevel] = useState(existingEntry?.painLevel || 3);
  
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (existingEntry) return;

    const entry: JournalEntry = {
        id: Date.now().toString(),
        workoutId,
        workoutTitle,
        date: new Date().toISOString(),
        rating,
        notes,
        athleteId: user.id,
        athleteName: user.name,
        athleteGroup: user.group,
        isInjured,
        painLocation: isInjured ? painLocation : undefined,
        painLevel: isInjured ? painLevel : undefined
    };
    StorageService.addJournalEntry(entry);
    setShowSuccess(true);
    setTimeout(() => {
        onSaved();
    }, 2000);
  };

  if (existingEntry || showSuccess) {
      return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 mt-4 shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 shadow-inner text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-green-900 text-lg">Workout Complete!</h3>
              <p className="text-green-700 text-sm mb-4">Great job logging your effort.</p>
              
              {existingEntry && (
                <div className="w-full bg-white/60 rounded-xl p-4 text-left border border-green-100">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Effort Score</span>
                        <span className="font-bold text-slate-800">{existingEntry.rating}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Notes</span>
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">{existingEntry.notes || '-'}</span>
                    </div>
                </div>
              )}
          </div>
      );
  }

  // Helper for RPE Description
  const getRPEText = (r: number) => {
      if (r <= 2) return "Very Easy (Recovery)";
      if (r <= 4) return "Moderate (Aerobic)";
      if (r <= 6) return "Hard (Tempo)";
      if (r <= 8) return "Very Hard (Race Pace)";
      return "Max Effort (All Out)";
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 mt-6 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600" /> Post-Run Journal
            </h3>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                How did it feel?
            </div>
        </div>
        
        <div className="mb-6">
            <div className="flex justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Easy</span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Max</span>
            </div>
            
            {/* Interactive RPE Bar */}
            <div className="flex gap-1 h-10 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                    const isActive = rating >= val;
                    const isSelected = rating === val;
                    // Gradient logic
                    let bgClass = 'bg-slate-100';
                    if (isActive) {
                        if (val <= 3) bgClass = 'bg-green-400';
                        else if (val <= 7) bgClass = 'bg-orange-400';
                        else bgClass = 'bg-red-500';
                    }

                    return (
                        <button
                            key={val}
                            onClick={() => setRating(val)}
                            className={`flex-1 rounded-sm transition-all duration-200 ${bgClass} ${isSelected ? 'scale-110 z-10 shadow-md ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                        />
                    );
                })}
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in">
                <span className="font-bold text-slate-700 text-lg">{rating}<span className="text-sm text-slate-400 font-normal">/10</span></span>
                <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{getRPEText(rating)}</span>
            </div>
        </div>

        <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Pacing was good, legs felt fresh..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none placeholder:text-slate-300 min-h-[80px] resize-none"
            />
        </div>

        {/* Smart Injury Toggle */}
        <div className="mb-6">
             {!isInjured ? (
                 <button 
                    onClick={() => setIsInjured(true)}
                    className="text-xs font-bold text-slate-400 flex items-center gap-2 hover:text-red-500 transition-colors"
                 >
                    <AlertCircle className="w-4 h-4" /> Report Pain or Injury
                 </button>
             ) : (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                     <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Injury Report
                        </h4>
                        <button onClick={() => setIsInjured(false)} className="text-[10px] font-bold text-red-400 underline">Cancel</button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label className="block text-[10px] font-bold text-red-700 mb-1">Location</label>
                             <select value={painLocation} onChange={e => setPainLocation(e.target.value)} className="w-full p-2 text-sm border border-red-200 rounded bg-white text-red-900 focus:ring-red-500">
                                 <option>Knee</option>
                                 <option>Shin</option>
                                 <option>Ankle</option>
                                 <option>Foot</option>
                                 <option>Hamstring</option>
                                 <option>Quad</option>
                                 <option>Hip</option>
                                 <option>Calf/Achilles</option>
                                 <option>Lower Back</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold text-red-700 mb-1">Pain (1-10)</label>
                             <input 
                                type="number" 
                                min="1" max="10" 
                                value={painLevel} 
                                onChange={e => setPainLevel(Number(e.target.value))} 
                                className="w-full p-2 text-sm border border-red-200 rounded bg-white text-red-900 focus:ring-red-500"
                             />
                         </div>
                     </div>
                 </div>
             )}
        </div>

        <button 
            onClick={handleSave}
            className="w-full bg-brand-900 text-white font-bold py-3.5 rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2 active:scale-95"
        >
            <Save className="w-4 h-4" /> Complete & Save
        </button>
    </div>
  );
};

export default Journal;
