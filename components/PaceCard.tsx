
import React, { useState } from 'react';
import { PaceData, Zone } from '../types';
import { calculateSplit } from '../utils/timeMath';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaceCardProps {
  paces: PaceData;
}

const PaceCard: React.FC<PaceCardProps> = ({ paces }) => {
  const [expanded, setExpanded] = useState(true);

  // Distances to show in the matrix
  const splitDistances = [
    { label: '200m', val: 200, unit: 'm' },
    { label: '300m', val: 300, unit: 'm' },
    { label: '400m', val: 400, unit: 'm' },
    { label: '600m', val: 600, unit: 'm' },
    { label: '800m', val: 800, unit: 'm' },
    { label: '1k', val: 1000, unit: 'm' },
    { label: 'Mile', val: 1609, unit: 'm' },
  ];

  const activeZones = [
    Zone.STEADY,
    Zone.TEMPO,
    Zone.THRESHOLD,
    Zone.CV,
    Zone.RACE_5K,
    Zone.RACE_3200,
    Zone.RACE_1600,
    Zone.RACE_800,
    Zone.RACE_400
  ];

  return (
    <div className="space-y-6">
      
      {/* Base Zones - Visual Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Training Zones</h3>
        
        {/* Recovery */}
        <div className="bg-white border-l-4 border-green-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-green-800 uppercase tracking-wide text-sm">Recovery</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.recovery} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-green-700">Why:</span> Promotes blood flow & repair.
             <br/>
             <span className="font-bold text-red-600">Caution:</span> Going too fast adds stress and delays recovery. Keep it effortless.
           </p>
        </div>

        {/* Foundation */}
        <div className="bg-white border-l-4 border-emerald-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wide text-sm">Foundation / Easy</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.foundation} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-emerald-700">Why:</span> Builds aerobic volume, capillaries, and mitochondria.
             <br/>
             <span className="font-bold text-red-600">Caution:</span> Too fast enters the "grey zone". Keep it conversational.
           </p>
        </div>

         {/* Steady */}
         <div className="bg-white border-l-4 border-yellow-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-yellow-800 uppercase tracking-wide text-sm">Steady State</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.steady} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-yellow-700">Why:</span> High-end aerobic conditioning.
             <br/>
             <span className="font-bold text-red-600">Feel:</span> Rhythm running. Faster than easy, slower than tempo.
           </p>
        </div>

        {/* Tempo */}
        <div className="bg-white border-l-4 border-orange-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-orange-800 uppercase tracking-wide text-sm">Tempo</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.tempo} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-orange-700">Why:</span> Increases lactate clearance efficiency.
             <br/>
             <span className="font-bold text-red-600">Feel:</span> Comfortably Hard. Sustainable for 20-40 mins.
           </p>
        </div>

        {/* Threshold */}
        <div className="bg-white border-l-4 border-rose-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-rose-800 uppercase tracking-wide text-sm">Lactate Threshold</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.threshold} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-rose-700">Why:</span> The upper limit of aerobic running.
             <br/>
             <span className="font-bold text-red-600">Feel:</span> Hard but controlled. 60 min race pace effort.
           </p>
        </div>

        {/* CV */}
        <div className="bg-white border-l-4 border-fuchsia-500 rounded-r-lg shadow-sm p-4">
           <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-bold text-fuchsia-800 uppercase tracking-wide text-sm">Critical Velocity (CV)</h4>
                <span className="font-mono font-bold text-xl text-slate-800">{paces.cv} <span className="text-xs text-slate-400 font-sans">/mi</span></span>
           </div>
           <p className="text-xs text-slate-600 leading-relaxed">
             <span className="font-bold text-fuchsia-700">Why:</span> Expands VO2 Max and fast-twitch endurance.
             <br/>
             <span className="font-bold text-red-600">Feel:</span> Approx 30-35 min race pace. Hard.
           </p>
        </div>
      </div>

      {/* Race Paces */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Race Equivalents</h3>
        <div className="grid grid-cols-2 gap-3">
             <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">5K Pace</div>
                <div className="text-lg font-bold text-brand-800 font-mono">{paces.race5k}/mi</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">3200m Pace</div>
                <div className="text-lg font-bold text-violet-800 font-mono">{paces.race3200}/mi</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">1600m Pace</div>
                <div className="text-lg font-bold text-purple-800 font-mono">{paces.race1600}/mi</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">800m Pace</div>
                <div className="text-lg font-bold text-pink-800 font-mono">{paces.race800}/mi</div>
             </div>
             <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm col-span-2">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">400m Pace</div>
                <div className="text-lg font-bold text-red-800 font-mono">{paces.race400}/mi</div>
             </div>
        </div>
      </div>

      {/* Detailed Splits Matrix */}
      <div className="pt-2">
        <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm font-bold text-brand-600 uppercase tracking-wider mb-3 hover:text-brand-800 transition-colors bg-brand-50 p-2 rounded-lg"
        >
            <span>Detailed Interval Splits</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm animate-in slide-in-from-top-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 font-bold sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[1px_0_5px_rgba(0,0,0,0.05)]">Zone</th>
                                {splitDistances.map(d => (
                                    <th key={d.label} className="px-3 py-3 font-semibold whitespace-nowrap text-center min-w-[60px]">{d.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeZones.map((zone, idx) => (
                                <tr key={zone} className={idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-50"}>
                                    <td className="px-3 py-2 font-bold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200 truncate max-w-[100px] text-[10px] uppercase tracking-tight shadow-[1px_0_5px_rgba(0,0,0,0.05)]" title={zone}>
                                        {zone.replace('Race', '')}
                                    </td>
                                    {splitDistances.map(dist => (
                                        <td key={`${zone}-${dist.label}`} className="px-2 py-2 font-mono text-slate-600 whitespace-nowrap text-center">
                                            {calculateSplit(dist.val, 'm', zone, paces.vdot)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PaceCard;
