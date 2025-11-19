import React, { useState, useEffect } from 'react';
import { User, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { calculateSplit } from '../utils/timeMath';
import { GROUP_THEMES, getRandomTheme } from '../utils/themes';
import { X, Wand2, Printer, Copy, RefreshCw, Palette } from 'lucide-react';
import Select from './ui/Select';

interface SmartGrouperProps { workout: ParsedWorkout; onClose: () => void; }

const SmartGrouper: React.FC<SmartGrouperProps> = ({ workout, onClose }) => {
  const [theme, setTheme] = useState<string>('CEREAL');
  const [groups, setGroups] = useState<{ name: string; athletes: User[] }[]>([]);
  const [targetInterval, setTargetInterval] = useState('0');

  useEffect(() => {
    const allAthletes = StorageService.getAllUsers().filter(u => u.role === 'athlete' && u.vdot && u.vdot > 0);
    allAthletes.sort((a, b) => (b.vdot || 0) - (a.vdot || 0));
    if (allAthletes.length === 0) return;
    const targetGroupSize = 5;
    const numGroups = Math.ceil(allAthletes.length / targetGroupSize);
    const newGroups = [];
    const themeNames = [...(GROUP_THEMES[theme as keyof typeof GROUP_THEMES] || [])]; 
    for (let i = 0; i < numGroups; i++) {
      const chunk = allAthletes.slice(i * targetGroupSize, (i * targetGroupSize) + targetGroupSize);
      if (chunk.length > 0) newGroups.push({ name: themeNames.length > 0 ? themeNames.shift()! : `Group ${i + 1}`, athletes: chunk });
    }
    setGroups(newGroups);
  }, [theme]);

  const targetItem = workout.items[Number(targetInterval)];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-brand-900 text-white p-6 flex justify-between items-start"><div><h2 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="w-6 h-6" /> Smart Packs</h2><p className="text-sm">Theme: {theme}</p></div><button onClick={onClose}><X className="w-6 h-6" /></button></div>
        <div className="bg-slate-50 p-4 flex gap-4"><Select label="Theme" icon={<Palette className="w-3 h-3" />} value={theme} onChange={setTheme} options={Object.keys(GROUP_THEMES)} /><button onClick={() => setTheme(getRandomTheme())}><RefreshCw className="w-4 h-4" /></button><Select label="Split" value={targetInterval} onChange={setTargetInterval} options={workout.items.map((item, idx) => ({ label: `${item.distance}${item.unit} @ ${item.zone}`, value: String(idx) }))} /></div>
        <div className="p-6 overflow-y-auto bg-slate-100"><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{groups.map((group, idx) => (<div key={idx} className="bg-white rounded-xl shadow-sm"><div className="bg-brand-50 px-4 py-3 border-b font-extrabold text-brand-900">{group.name}</div><div className="divide-y">{group.athletes.map(athlete => (<div key={athlete.id} className="px-4 py-3 flex justify-between"><span>{athlete.name}</span><span className="font-mono font-bold">{targetItem ? calculateSplit(targetItem.distance, targetItem.unit, targetItem.zone, athlete.vdot || 0) : ''}</span></div>))}</div></div>))}</div></div>
      </div>
    </div>
  );
};
export default SmartGrouper;