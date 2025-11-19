import React, { useState } from 'react';
import { PaceData, Zone } from '../types';
import { calculateSplit } from '../utils/timeMath';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaceCardProps { paces: PaceData; }

const PaceCard: React.FC<PaceCardProps> = ({ paces }) => {
  const [expanded, setExpanded] = useState(true);
  const splitDistances = [
    { label: '200m', val: 200 },
    { label: '300m', val: 300 },
    { label: '400m', val: 400 },
    { label: '600m', val: 600 },
    { label: '800m', val: 800 },
    { label: '1k', val: 1000 },
    { label: 'Mile', val: 1609 }
  ];
  const activeZones = [Zone.STEADY, Zone.TEMPO, Zone.THRESHOLD, Zone.CV, Zone.RACE_5K, Zone.RACE_3200, Zone.RACE_1600, Zone.RACE_800];

  return (
    <div className="space-y-8">
      {/* Training Zones */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">TRAINING ZONES</h3>

        {/* Recovery */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">RECOVERY</h4>
            <span className="font-mono font-bold text-base">{paces.recovery} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> Promotes blood flow & repair.</p>
          <p className="text-xs text-amber-700"><span className="font-bold">Caution:</span> Going too fast adds stress and delays recovery. Keep it effortless.</p>
        </div>

        {/* Foundation / Easy */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">FOUNDATION / EASY</h4>
            <span className="font-mono font-bold text-base">{paces.foundation} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> Builds aerobic volume, capillaries, and mitochondria.</p>
          <p className="text-xs text-amber-700"><span className="font-bold">Caution:</span> Too fast enters the "grey zone". Keep it conversational.</p>
        </div>

        {/* Steady State */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">STEADY STATE</h4>
            <span className="font-mono font-bold text-base">{paces.steady} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> High-end aerobic conditioning.</p>
          <p className="text-xs text-slate-600"><span className="font-bold">Feel:</span> Rhythm running. Faster than easy, slower than tempo.</p>
        </div>

        {/* Tempo */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">TEMPO</h4>
            <span className="font-mono font-bold text-base">{paces.tempo} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> Increases lactate clearance efficiency.</p>
          <p className="text-xs text-slate-600"><span className="font-bold">Feel:</span> Comfortably Hard. Sustainable for 20-40 mins.</p>
        </div>

        {/* Lactate Threshold */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">LACTATE THRESHOLD</h4>
            <span className="font-mono font-bold text-base">{paces.threshold} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> The upper limit of aerobic running.</p>
          <p className="text-xs text-slate-600"><span className="font-bold">Feel:</span> Hard but controlled. 60 min race pace effort.</p>
        </div>

        {/* Critical Velocity */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-slate-800 uppercase text-sm">CRITICAL VELOCITY (CV)</h4>
            <span className="font-mono font-bold text-base">{paces.cv} /mi</span>
          </div>
          <p className="text-xs text-slate-700 mb-1"><span className="font-bold">Why:</span> Expands VO2 Max and fast-twitch endurance.</p>
          <p className="text-xs text-slate-600"><span className="font-bold">Feel:</span> Approx 30-35 min race pace. Hard.</p>
        </div>
      </div>

      {/* Race Equivalents */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">RACE EQUIVALENTS</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gradient-to-r from-rose-50 to-white rounded-lg shadow-sm p-3 border border-rose-200">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-slate-800 text-sm">5K PACE</h4>
              <span className="font-mono font-bold text-lg text-rose-700">{paces.race5k}/mi</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-white rounded-lg shadow-sm p-3 border border-pink-200">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-slate-800 text-sm">3200M PACE</h4>
              <span className="font-mono font-bold text-lg text-pink-700">{paces.race3200}/mi</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-fuchsia-50 to-white rounded-lg shadow-sm p-3 border border-fuchsia-200">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-slate-800 text-sm">1600M PACE</h4>
              <span className="font-mono font-bold text-lg text-fuchsia-700">{paces.race1600}/mi</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg shadow-sm p-3 border border-purple-200">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-slate-800 text-sm">800M PACE</h4>
              <span className="font-mono font-bold text-lg text-purple-700">{paces.race800}/mi</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-white rounded-lg shadow-sm p-3 border border-violet-200">
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold text-slate-800 text-sm">400M PACE</h4>
              <span className="font-mono font-bold text-lg text-violet-700">{paces.race400}/mi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Interval Splits */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">DETAILED INTERVAL SPLITS</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-brand-600 bg-brand-50 p-2 rounded-lg hover:bg-brand-100 transition-colors"
        >
          <span>{expanded ? 'Hide' : 'Show'} Interval Splits Table</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-slate-700">Zone</th>
                  {splitDistances.map(d => (
                    <th key={d.label} className="px-3 py-2 text-center font-bold text-slate-700">{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeZones.map(zone => (
                  <tr key={zone} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-800">{zone.replace(' Race', '').replace('Lactate Threshold', 'LT')}</td>
                    {splitDistances.map(d => (
                      <td key={d.label} className="px-3 py-2 font-mono text-center text-slate-700">
                        {calculateSplit(d.val, 'm', zone, paces.vdot)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaceCard;