
import React, { useState, useEffect } from 'react';
import { User, ParsedWorkout } from '../types';
import { StorageService } from '../services/storage';
import { calculateSplit } from '../utils/timeMath';
import { GROUP_THEMES, getRandomTheme } from '../utils/themes';
import { X, Wand2, Printer, Copy, RefreshCw, Palette } from 'lucide-react';
import Select from './ui/Select';

interface SmartGrouperProps {
  workout: ParsedWorkout;
  onClose: () => void;
}

const SmartGrouper: React.FC<SmartGrouperProps> = ({ workout, onClose }) => {
  const [theme, setTheme] = useState<string>('CEREAL'); // Use string for Select compatibility
  const [groups, setGroups] = useState<{ name: string; athletes: User[] }[]>([]);
  const [targetInterval, setTargetInterval] = useState('0'); // String index

  useEffect(() => {
    generateGroups();
  }, [theme]);

  const generateGroups = () => {
    // 1. Get all athletes and filter out those without VDOTs (or 0)
    const allAthletes = StorageService.getAllUsers().filter(u => u.role === 'athlete' && u.vdot && u.vdot > 0);
    
    // 2. Sort by VDOT descending (Fastest first)
    allAthletes.sort((a, b) => (b.vdot || 0) - (a.vdot || 0));

    // 3. Determine Group Size (Target 4-6 people)
    const total = allAthletes.length;
    if (total === 0) return;

    const targetGroupSize = 5;
    const numGroups = Math.ceil(total / targetGroupSize);
    
    // 4. Chunk them
    const newGroups = [];
    const themeNames = [...(GROUP_THEMES[theme as keyof typeof GROUP_THEMES] || [])]; 

    for (let i = 0; i < numGroups; i++) {
      const start = i * targetGroupSize;
      const end = start + targetGroupSize;
      const chunk = allAthletes.slice(start, end);
      
      // Assign Name
      const groupName = themeNames.length > 0 ? themeNames.shift()! : `Group ${i + 1}`;
      
      if (chunk.length > 0) {
        newGroups.push({
            name: groupName,
            athletes: chunk
        });
      }
    }

    setGroups(newGroups);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = groups.map(g => {
        const athletes = g.athletes.map(a => a.name).join(', ');
        return `${g.name}: ${athletes}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    alert('Groups copied to clipboard!');
  };

  const targetItem = workout.items[Number(targetInterval)];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-brand-400" /> Smart Packs
                </h2>
                <p className="text-brand-200 text-sm mt-1">
                    Auto-sorted by ability. Theme: <span className="font-bold text-white">{theme}</span>
                </p>
            </div>
            <button onClick={onClose} className="text-brand-300 hover:text-white">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Controls */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-end gap-2 w-full lg:w-auto">
                <div className="flex-1 min-w-[200px]">
                    <Select 
                        label="Theme"
                        icon={<Palette className="w-3 h-3" />}
                        value={theme}
                        onChange={setTheme}
                        options={Object.keys(GROUP_THEMES)}
                    />
                </div>
                <button onClick={() => setTheme(getRandomTheme())} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm mb-[1px]" title="Random Theme">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 w-full lg:w-auto min-w-[250px]">
                <Select
                    label="Show Splits For"
                    value={targetInterval}
                    onChange={setTargetInterval}
                    options={workout.items.map((item, idx) => ({
                        label: `${item.distance}${item.unit} @ ${item.zone}`,
                        value: String(idx)
                    }))}
                />
            </div>

            <div className="flex gap-2 mt-2 lg:mt-0 w-full lg:w-auto">
                <button onClick={handleCopy} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all">
                    <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all">
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-100 min-h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="printable-groups">
                {groups.length === 0 && <div className="col-span-2 text-center py-12"><p className="text-slate-400">No athletes with VDOT data found.</p></div>}
                
                {groups.map((group, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
                        <div className="bg-brand-50 px-4 py-3 border-b border-brand-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-brand-900 uppercase tracking-wide">{group.name}</h3>
                            <span className="text-[10px] font-bold bg-brand-200 text-brand-800 px-2 py-1 rounded-full border border-brand-300">
                                ~ {group.athletes.length > 0 ? group.athletes[0].vdot?.toFixed(1) : 0} VDOT
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {group.athletes.map(athlete => {
                                // Calculate Split for this specific athlete
                                const split = targetItem ? calculateSplit(targetItem.distance, targetItem.unit, targetItem.zone, athlete.vdot || 0) : 'N/A';
                                
                                return (
                                    <div key={athlete.id} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{athlete.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">PR: {athlete.fivekmTime}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-mono font-black text-brand-600 leading-none tracking-tight">{split}</div>
                                            <div className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Target</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SmartGrouper;
