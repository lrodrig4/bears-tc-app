import React, { useState } from 'react';
import { PaceData, Zone } from '../types';
import { calculateSplit } from '../utils/timeMath';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaceCardProps { paces: PaceData; }

interface PaceZoneInfo {
  name: string;
  pace: string;
  color: string;
  feel: string;
  benefit: string;
}

const PaceCard: React.FC<PaceCardProps> = ({ paces }) => {
  const [expanded, setExpanded] = useState(true);
  const splitDistances = [{ label: '200m', val: 200 }, { label: '400m', val: 400 }, { label: '800m', val: 800 }, { label: '1k', val: 1000 }, { label: 'Mile', val: 1609 }];
  const activeZones = [Zone.STEADY, Zone.TEMPO, Zone.THRESHOLD, Zone.CV, Zone.RACE_5K, Zone.RACE_3200, Zone.RACE_1600];

  const trainingZones: PaceZoneInfo[] = [
    {
      name: 'Recovery',
      pace: paces.recovery,
      color: 'green',
      feel: 'Very comfortable, conversational pace. Should feel easy throughout.',
      benefit: 'Promotes muscle repair, increases blood flow, and aids recovery between hard sessions.'
    },
    {
      name: 'Foundation',
      pace: paces.foundation,
      color: 'emerald',
      feel: 'Comfortable, sustainable pace. Can hold conversation but with some effort.',
      benefit: 'Builds aerobic base, strengthens heart, improves fat utilization and endurance capacity.'
    },
    {
      name: 'Steady',
      pace: paces.steady,
      color: 'teal',
      feel: 'Moderate effort, rhythm-focused. Breathing is deeper but controlled.',
      benefit: 'Enhances aerobic efficiency, builds muscular endurance, and bridges easy and hard training.'
    },
    {
      name: 'Tempo',
      pace: paces.tempo,
      color: 'orange',
      feel: 'Comfortably hard. Breathing is labored but rhythmic. Can say short phrases.',
      benefit: 'Improves lactate clearance, raises anaerobic threshold, and builds mental toughness.'
    },
    {
      name: 'Lactate Threshold',
      pace: paces.threshold,
      color: 'amber',
      feel: 'Hard effort, at the edge of comfort. Breathing is heavy, talking is difficult.',
      benefit: 'Pushes lactate threshold higher, improves sustained speed, critical for race performance.'
    },
    {
      name: 'Critical Velocity (CV)',
      pace: paces.cv,
      color: 'red',
      feel: 'Very hard, near race effort. Breathing is rapid and deep, minimal talking possible.',
      benefit: 'Maximizes VO2max, improves running economy, prepares body for race-day intensity.'
    },
    {
      name: '5K Race Pace',
      pace: paces.race5k,
      color: 'rose',
      feel: 'Hard, sustained race effort. Focus on rhythm and maintaining form under fatigue.',
      benefit: 'Specific race preparation, builds confidence at target pace, improves speed endurance.'
    },
    {
      name: '3200m / 3K Pace',
      pace: paces.race3200,
      color: 'pink',
      feel: 'Fast and uncomfortable. High effort with controlled aggression throughout.',
      benefit: 'Develops speed endurance, strengthens neuromuscular power, prepares for mid-distance racing.'
    },
    {
      name: '1600m / Mile Pace',
      pace: paces.race1600,
      color: 'fuchsia',
      feel: 'Very fast, requires mental focus. Breathing is maximal, legs burn quickly.',
      benefit: 'Builds top-end speed, improves anaerobic capacity, enhances kick and finishing speed.'
    },
    {
      name: '800m Pace',
      pace: paces.race800,
      color: 'purple',
      feel: 'Extremely hard sprint effort. Near max heart rate, very high leg turnover.',
      benefit: 'Develops explosive speed, improves lactate tolerance, builds raw power and acceleration.'
    },
    {
      name: '400m Pace',
      pace: paces.race400,
      color: 'violet',
      feel: 'All-out sprint. Maximum effort with focus on form and powerful drive.',
      benefit: 'Maximizes speed and power output, improves neuromuscular recruitment, sharpens racing mechanics.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">My Paces</h3>
        {trainingZones.map((zone) => (
          <div key={zone.name} className={`bg-white border-l-4 border-${zone.color}-500 rounded-r-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className={`font-bold text-${zone.color}-800`}>{zone.name}</h4>
              <span className="font-mono font-bold text-lg">{zone.pace}</span>
            </div>
            <p className="text-xs text-slate-600 italic mb-1">{zone.feel}</p>
            <p className="text-xs text-slate-700 font-medium">{zone.benefit}</p>
          </div>
        ))}
      </div>
      <div className="pt-2"><button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between text-sm font-bold text-brand-600 bg-brand-50 p-2 rounded-lg"><span>Interval Splits</span>{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
        {expanded && (<div className="bg-white border rounded-lg overflow-hidden mt-2"><table className="w-full text-xs text-left"><thead className="bg-slate-50"><tr><th className="px-2 py-2">Zone</th>{splitDistances.map(d => <th key={d.label} className="px-2 py-2">{d.label}</th>)}</tr></thead><tbody className="divide-y">{activeZones.map(zone => (<tr key={zone}><td className="px-2 py-2 font-bold">{zone.replace('Race', '')}</td>{splitDistances.map(d => <td key={d.label} className="px-2 py-2 font-mono">{calculateSplit(d.val, 'm', zone, paces.vdot)}</td>)}</tr>))}</tbody></table></div>)}
      </div>
    </div>
  );
};
export default PaceCard;