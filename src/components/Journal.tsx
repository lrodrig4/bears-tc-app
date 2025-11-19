import React, { useState } from 'react';
import { JournalEntry, User } from '../types';
import { StorageService } from '../services/storage';
import { Activity, AlertCircle, CheckCircle2, Save } from 'lucide-react';

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
    const entry: JournalEntry = { id: Date.now().toString(), workoutId, workoutTitle, date: new Date().toISOString(), rating, notes, athleteId: user.id, athleteName: user.name, athleteGroup: user.group, isInjured, painLocation: isInjured ? painLocation : undefined, painLevel: isInjured ? painLevel : undefined };
    StorageService.addJournalEntry(entry);
    setShowSuccess(true);
    setTimeout(() => { onSaved(); }, 2000);
  };

  if (existingEntry || showSuccess) {
      return (<div className="bg-green-50 p-6 rounded-2xl border border-green-100 mt-4 text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto text-green-600"><CheckCircle2 className="w-8 h-8" /></div><h3 className="font-bold text-green-900 text-lg">Complete!</h3></div>);
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 mt-6 shadow-lg">
        <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-brand-600" /> Post-Run Journal</h3></div>
        <div className="mb-6"><div className="flex gap-1 h-10 mb-3">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (<button key={val} onClick={() => setRating(val)} className={`flex-1 rounded-sm transition-all ${rating >= val ? (val <= 3 ? 'bg-green-400' : val <= 7 ? 'bg-orange-400' : 'bg-red-500') : 'bg-slate-100'}`} />))}</div><div className="text-center font-bold text-slate-700">{rating}/10</div></div>
        <div className="mb-4"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="w-full p-3 rounded-xl border border-slate-200 text-sm" /></div>
        <div className="mb-6">{!isInjured ? (<button onClick={() => setIsInjured(true)} className="text-xs font-bold text-slate-400 flex items-center gap-2 hover:text-red-500"><AlertCircle className="w-4 h-4" /> Report Pain</button>) : (<div className="bg-red-50 p-4 rounded-xl"><div className="grid grid-cols-2 gap-3"><div><select value={painLocation} onChange={e => setPainLocation(e.target.value)} className="w-full p-2 text-sm border rounded"><option>Knee</option><option>Shin</option><option>Ankle</option><option>Hamstring</option></select></div><div><input type="number" min="1" max="10" value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className="w-full p-2 text-sm border rounded" /></div></div></div>)}</div>
        <button onClick={handleSave} className="w-full bg-brand-900 text-white font-bold py-3.5 rounded-xl hover:bg-brand-800 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Complete</button>
    </div>
  );
};
export default Journal;