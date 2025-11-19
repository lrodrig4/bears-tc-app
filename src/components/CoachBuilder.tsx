import React, { useState, useEffect } from 'react';
import { ParsedWorkout, TrainingGroup, ScheduledWorkout, LibraryItem, WorkoutItem, Zone } from '../types';
import { parseWorkoutWithAI } from '../services/geminiService';
import { StorageService } from '../services/storage';
import { Loader2, Send, Calendar, Users, CheckCircle, Save, Share2, Plus, X, Megaphone, Activity, Gauge, Battery } from 'lucide-react';
import Select from './ui/Select';

interface CoachBuilderProps {
  selectedDate: string;
  onWorkoutScheduled: () => void;
  prefilledWorkout?: ParsedWorkout | null;
}

const CoachBuilder: React.FC<CoachBuilderProps> = ({ selectedDate, onWorkoutScheduled, prefilledWorkout }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [groups, setGroups] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [phase, setPhase] = useState('Base Phase');
  const [focus, setFocus] = useState('Aerobic Development');
  const [fatigue, setFatigue] = useState('Normal');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualItems, setManualItems] = useState<WorkoutItem[]>([]);
  const [tempDist, setTempDist] = useState(400);
  const [tempUnit, setTempUnit] = useState<'m'|'km'|'mi'>('m');
  const [tempReps, setTempReps] = useState(1);
  const [tempZone, setTempZone] = useState<string>(Zone.STEADY);
  const [tempRec, setTempRec] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<TrainingGroup[]>([]);
  const [dailyMessage, setDailyMessage] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedWorkout | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState(''); 
  const [savingToLib, setSavingToLib] = useState(false);

  useEffect(() => {
      const loadedGroups = StorageService.getGroups();
      setGroups(loadedGroups);
      if (loadedGroups.length > 0) setSelectedGroups([loadedGroups[0]]);
  }, []);

  useEffect(() => {
      if (prefilledWorkout) {
          setParsedResult(prefilledWorkout);
          setMode('ai');
      }
  }, [prefilledWorkout]);

  const handleAnalyze = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const workout = await parseWorkoutWithAI(aiInput, { phase, focus, fatigue });
      setParsedResult(workout);
    } catch (error) { alert("Failed to parse workout."); } finally { setLoading(false); }
  };

  const addManualItem = () => {
      setManualItems([...manualItems, { distance: Number(tempDist), unit: tempUnit, reps: Number(tempReps), zone: tempZone as Zone, recovery: tempRec || undefined }]);
  };

  const generateManualWorkout = () => {
      if (!manualTitle || manualItems.length === 0) { alert("Add title and intervals."); return; }
      setParsedResult({ title: manualTitle, description: manualDesc, items: manualItems });
      setManualTitle(''); setManualDesc(''); setManualItems([]);
  };

  const handleSchedule = () => {
      if (!parsedResult) return;
      StorageService.saveWorkoutToSchedule({ id: Date.now().toString(), date: selectedDate, groups: selectedGroups, workout: parsedResult, dailyMessage: dailyMessage.trim() });
      setAiInput(''); setParsedResult(null); setShareUrl(''); setDailyMessage(''); onWorkoutScheduled();
  };

  const handleSaveToLibrary = () => {
      if (!parsedResult) return;
      StorageService.saveToLibrary({ id: Date.now().toString(), workout: parsedResult, tags: tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0) });
      setSavingToLib(false); setTagsInput(''); alert("Saved!");
  };

  const renderParsedResult = () => (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
        <div className="flex justify-between items-start mb-2">
            <div><h3 className="font-bold text-slate-800 mb-1">{parsedResult?.title}</h3><p className="text-slate-600 text-xs">{parsedResult?.description}</p></div>
            <div className="flex gap-2">
                <button onClick={() => setSavingToLib(!savingToLib)} className="p-2 rounded border text-slate-400 hover:text-brand-600 hover:bg-white"><Save className="w-4 h-4" /></button>
                <button onClick={() => { const url = `${window.location.origin}?share=${btoa(JSON.stringify(parsedResult))}`; setShareUrl(url); }} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded border border-transparent"><Share2 className="w-4 h-4" /></button>
            </div>
        </div>
        {savingToLib && <div className="mb-4 p-2 bg-white rounded border flex gap-2"><input className="flex-1 text-xs p-2 bg-slate-50 rounded border" placeholder="Tags..." value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} /><button onClick={handleSaveToLibrary} className="bg-brand-600 text-white text-xs font-bold px-3 rounded">Save</button></div>}
        <div className="mb-4"><label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Megaphone className="w-3 h-3" /> Coach's Note</label><input value={dailyMessage} onChange={e => setDailyMessage(e.target.value)} placeholder="e.g. 'Bus leaves at 3:00pm'" className="w-full text-sm p-2 border rounded bg-white" /></div>
        <ul className="text-xs text-slate-600 mb-4 space-y-1 border-t border-slate-200 pt-2">{parsedResult?.items.map((item, i) => (<li key={i}>• {item.reps} x {item.distance}{item.unit} @ {item.zone} {item.recovery && `(${item.recovery})`}</li>))}</ul>
        {shareUrl && <div className="mb-4 p-3 bg-white border rounded-lg"><div className="text-xs font-bold text-brand-600 mb-1 uppercase">Public Link</div><div className="flex gap-2"><input readOnly value={shareUrl} className="flex-1 text-[10px] bg-slate-50 p-2 rounded border text-slate-500" /><button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-brand-100 text-brand-700 p-2 rounded"><Share2 className="w-3 h-3" /></button></div></div>}
        <div className="flex gap-2 mt-4"><button onClick={() => { setParsedResult(null); setShareUrl(''); }} className="flex-1 bg-white border text-slate-600 py-2 rounded-lg font-bold">Edit</button><button onClick={handleSchedule} className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Schedule</button></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><span className="w-2 h-6 bg-brand-500 rounded-full"></span> Workout Builder</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto"><button onClick={() => { setMode('ai'); setParsedResult(null); }} className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded ${mode === 'ai' ? 'bg-white shadow text-brand-800' : 'text-slate-500'}`}>AI Gen</button><button onClick={() => { setMode('manual'); setParsedResult(null); }} className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded ${mode === 'manual' ? 'bg-white shadow text-brand-800' : 'text-slate-500'}`}>Manual</button></div>
      </div>
      <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-100 flex items-center gap-3 text-brand-900 text-sm font-medium"><Calendar className="w-4 h-4" /> Scheduling for: <span className="font-bold">{new Date(selectedDate).toDateString()}</span></div>
      <div><label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Assign Groups</label><div className="flex flex-wrap gap-2 mb-6">{groups.map(g => (<button key={g} onClick={() => setSelectedGroups(prev => prev.includes(g) ? prev.filter(i => i !== g) : [...prev, g])} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${selectedGroups.includes(g) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200'}`}>{g}</button>))}</div></div>
      {mode === 'ai' && !parsedResult && (<div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><Select label="Phase" icon={<Activity className="w-3 h-3" />} value={phase} onChange={setPhase} options={["Base Phase", "Build Phase", "Peak / Competition", "Taper"]} /><Select label="Focus" icon={<Gauge className="w-3 h-3" />} value={focus} onChange={setFocus} options={["Aerobic Development", "Speed / Power", "Threshold / Stamina", "Recovery"]} /><Select label="Fatigue" icon={<Battery className="w-3 h-3" />} value={fatigue} onChange={setFatigue} options={["Fresh", "Normal", "High Fatigue"]} /></div><textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Describe the workout..." className="w-full p-4 rounded-xl border border-slate-300 min-h-[120px] text-sm" /><button onClick={handleAnalyze} disabled={loading || !aiInput || selectedGroups.length === 0} className="w-full bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl mt-4 flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-4 h-4" />} Generate Workout</button></div>)}
      {mode === 'manual' && !parsedResult && (<div className="space-y-4"><input className="w-full p-3 border rounded-xl text-sm" placeholder="Title" value={manualTitle} onChange={e => setManualTitle(e.target.value)} /><div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><div className="flex flex-col sm:flex-row gap-2 items-end"><div className="w-20"><input type="number" value={tempReps} onChange={e => setTempReps(Number(e.target.value))} className="w-full p-2 border rounded-lg text-sm" /></div><div className="w-24"><input type="number" value={tempDist} onChange={e => setTempDist(Number(e.target.value))} className="w-full p-2 border rounded-lg text-sm" /></div><div className="w-28"><Select value={tempUnit} onChange={(v) => setTempUnit(v as any)} options={["m", "km", "mi"]} /></div><div className="flex-1"><Select value={tempZone} onChange={setTempZone} options={Object.values(Zone)} /></div><div className="w-32"><input value={tempRec} onChange={e => setTempRec(e.target.value)} placeholder="Rec" className="w-full p-2 border rounded-lg text-sm" /></div><button onClick={addManualItem} className="bg-brand-600 text-white p-2 rounded-lg"><Plus className="w-5 h-5" /></button></div></div>{manualItems.length > 0 && <div className="border rounded-xl divide-y">{manualItems.map((item, idx) => <div key={idx} className="p-3 text-sm flex justify-between">{item.reps} x {item.distance}{item.unit} @ {item.zone} <button onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></button></div>)}</div>}<button onClick={generateManualWorkout} className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl">Preview</button></div>)}
      {parsedResult && renderParsedResult()}
    </div>
  );
};
export default CoachBuilder;