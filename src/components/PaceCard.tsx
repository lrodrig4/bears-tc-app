import React, { useState } from 'react';
import { PaceData, Zone } from '../types';
import { calculateSplit } from '../utils/timeMath';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaceCardProps { paces: PaceData; }

const PaceCard: React.FC<PaceCardProps> = ({ paces }) => {
  const [expanded, setExpanded] = useState(true);
  const splitDistances = [{ label: '200m', val: 200 }, { label: '400m', val: 400 }, { label: '800m', val: 800 }, { label: '1k', val: 1000 }, { label: 'Mile', val: 1609 }];
  const activeZones = [Zone.STEADY, Zone.TEMPO, Zone.THRESHOLD, Zone.CV, Zone.RACE_5K, Zone.RACE_3200, Zone.RACE_1600];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase">Training Zones</h3>
        <div className="bg-white border-l-4 border-green-500 rounded-r-lg shadow-sm p-4"><div className="flex justify-between mb-2"><h4 className="font-bold text-green-800">Recovery</h4><span className="font-mono font-bold">{paces.recovery}</span></div><p className="text-xs text-slate-600">Promotes repair.</p></div>
        <div className="bg-white border-l-4 border-emerald-500 rounded-r-lg shadow-sm p-4"><div className="flex justify-between mb-2"><h4 className="font-bold text-emerald-800">Foundation</h4><span className="font-mono font-bold">{paces.foundation}</span></div><p className="text-xs text-slate-600">Builds aerobic volume.</p></div>
        <div className="bg-white border-l-4 border-orange-500 rounded-r-lg shadow-sm p-4"><div className="flex justify-between mb-2"><h4 className="font-bold text-orange-800">Tempo</h4><span className="font-mono font-bold">{paces.tempo}</span></div><p className="text-xs text-slate-600">Lactate clearance.</p></div>
      </div>
      <div className="pt-2"><button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between text-sm font-bold text-brand-600 bg-brand-50 p-2 rounded-lg"><span>Interval Splits</span>{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
        {expanded && (<div className="bg-white border rounded-lg overflow-hidden mt-2"><table className="w-full text-xs text-left"><thead className="bg-slate-50"><tr><th className="px-2 py-2">Zone</th>{splitDistances.map(d => <th key={d.label} className="px-2 py-2">{d.label}</th>)}</tr></thead><tbody className="divide-y">{activeZones.map(zone => (<tr key={zone}><td className="px-2 py-2 font-bold">{zone.replace('Race', '')}</td>{splitDistances.map(d => <td key={d.label} className="px-2 py-2 font-mono">{calculateSplit(d.val, 'm', zone, paces.vdot)}</td>)}</tr>))}</tbody></table></div>)}
      </div>
    </div>
  );
};
export default PaceCard;