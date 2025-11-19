import React, { useEffect, useState } from 'react';
import { ParsedWorkout, PaceData, Zone } from '../types';
import { calculateSplit } from '../utils/timeMath';
import { getCoachAdvice } from '../services/geminiService';
import { Loader2, Trophy, Timer, Footprints, Info } from 'lucide-react';

interface WorkoutViewerProps { workout: ParsedWorkout; paces: PaceData; athletePr: string; vdot: number; }

const WorkoutViewer: React.FC<WorkoutViewerProps> = ({ workout, paces, athletePr, vdot }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { const f = async () => { setLoading(true); try { setAdvice(await getCoachAdvice(workout, athletePr)); } catch {} finally { setLoading(false); } }; if (workout.items.length > 0) f(); }, [workout, athletePr]);
  const totalVolume = workout.items.reduce((acc, item) => acc + (item.unit === 'mi' ? item.distance : item.distance/1609) * item.reps, 0);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-6"><div className="flex justify-between mb-2"><div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-brand-400" /><h2 className="font-bold text-lg">{workout.title}</h2></div><div className="bg-white/10 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Footprints className="w-3 h-3" /> {totalVolume.toFixed(1)} mi</div></div><p className="text-brand-100 text-sm opacity-90">{workout.description}</p></div>
        <div className="bg-brand-50/50 p-4 border-b border-slate-100"><h3 className="text-[10px] font-bold text-brand-900 uppercase mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Strategy</h3>{loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <p className="text-sm text-slate-700 italic border-l-2 border-brand-300 pl-3">"{advice}"</p>}</div>
        <div className="divide-y divide-slate-50">{workout.items.map((item, idx) => (<div key={idx} className="p-4 flex items-center justify-between"><div className="flex flex-col gap-1"><span className="text-lg font-black text-slate-800">{item.reps} x {item.distance}{item.unit}</span><span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border bg-slate-100">{item.zone}</span></div><div className="text-right bg-slate-50 px-3 py-2 rounded-lg"><span className="block text-xl font-mono font-black text-brand-900">{calculateSplit(item.distance, item.unit, item.zone, vdot)}</span></div></div>))}</div>
      </div>
    </div>
  );
};
export default WorkoutViewer;