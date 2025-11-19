
import React, { useEffect, useState } from 'react';
import { ParsedWorkout, PaceData, Zone } from '../types';
import { calculateSplit, milesToMeters } from '../utils/timeMath';
import { getCoachAdvice } from '../services/geminiService';
import { Loader2, Trophy, Timer, Footprints, Info } from 'lucide-react';

interface WorkoutViewerProps {
  workout: ParsedWorkout;
  paces: PaceData;
  athletePr: string;
  vdot: number;
}

const WorkoutViewer: React.FC<WorkoutViewerProps> = ({ workout, paces, athletePr, vdot }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      try {
        const tip = await getCoachAdvice(workout, athletePr);
        if (isMounted) setAdvice(tip);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoadingAdvice(false);
      }
    };
    
    if (workout.items.length > 0) {
        fetchAdvice();
    }
    
    return () => { isMounted = false; };
  }, [workout, athletePr]);

  const getBadgeColor = (zone: Zone) => {
      switch(zone) {
          case Zone.RECOVERY: return "bg-green-100 text-green-800 border-green-200";
          case Zone.FOUNDATION: return "bg-emerald-100 text-emerald-800 border-emerald-200";
          case Zone.STEADY: return "bg-yellow-100 text-yellow-800 border-yellow-200";
          case Zone.TEMPO: return "bg-orange-100 text-orange-800 border-orange-200";
          case Zone.THRESHOLD: return "bg-rose-100 text-rose-800 border-rose-200";
          case Zone.CV: return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
          case Zone.RACE_5K: return "bg-brand-100 text-brand-800 border-brand-200";
          case Zone.RACE_3200: return "bg-violet-100 text-violet-800 border-violet-200";
          case Zone.RACE_1600: return "bg-purple-100 text-purple-800 border-purple-200";
          case Zone.RACE_800: return "bg-pink-100 text-pink-800 border-pink-200";
          case Zone.RACE_400: return "bg-red-100 text-red-800 border-red-200";
          default: return "bg-gray-100 text-gray-600 border-gray-200";
      }
  };

  // Calculate Total Volume
  const totalVolumeMiles = workout.items.reduce((acc, item) => {
      let dist = item.distance * item.reps;
      if (item.unit === 'm') dist = dist / 1609.34;
      if (item.unit === 'km') dist = dist * 0.621371;
      return acc + dist;
  }, 0);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-brand-400" />
                        <h2 className="font-bold text-lg tracking-tight">{workout.title}</h2>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold text-brand-100 border border-white/10">
                        <Footprints className="w-3 h-3" />
                        {totalVolumeMiles.toFixed(1)} mi vol
                    </div>
                </div>
                <p className="text-brand-100 text-sm leading-relaxed opacity-90">{workout.description}</p>
            </div>
        </div>

        {/* AI Advice */}
        <div className="bg-brand-50/50 p-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-brand-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Strategy
            </h3>
            {loadingAdvice ? (
                <div className="flex items-center gap-2 text-brand-600 text-sm animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Formulating strategy...
                </div>
            ) : (
                <p className="text-sm text-slate-700 italic font-medium border-l-2 border-brand-300 pl-3">"{advice}"</p>
            )}
        </div>

        {/* Splits Table */}
        <div className="divide-y divide-slate-50">
          {workout.items.map((item, idx) => {
            const splitTime = calculateSplit(item.distance, item.unit, item.zone, vdot);
            const badgeColor = getBadgeColor(item.zone);

            return (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800 tabular-nums tracking-tight">
                        {item.reps}<span className="text-slate-400 text-sm font-normal mx-1">x</span>{item.distance}{item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${badgeColor}`}>
                      {item.zone}
                    </span>
                    {item.recovery && (
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Timer className="w-3 h-3" /> {item.recovery}
                        </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 group-hover:border-brand-200 group-hover:bg-white transition-all">
                  <span className="block text-xl font-mono font-black text-brand-900 tracking-tighter">
                    {splitTime}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Pace</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutViewer;
