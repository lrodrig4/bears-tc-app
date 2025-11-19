
import React, { useState, useEffect } from 'react';
import { ParsedWorkout, TrainingGroup, ScheduledWorkout, LibraryItem, WorkoutItem, Zone } from '../types';
import { parseWorkoutWithAI } from '../services/geminiService';
import { StorageService } from '../services/storage';
import { Loader2, Send, Calendar, Users, CheckCircle, Save, Share2, Plus, X, Megaphone, BarChart, Activity, Gauge, Battery } from 'lucide-react';
import Select from './ui/Select';

interface CoachBuilderProps {
  selectedDate: string; // YYYY-MM-DD
  onWorkoutScheduled: () => void;
  prefilledWorkout?: ParsedWorkout | null;
}

const ZONES = Object.values(Zone);

const CoachBuilder: React.FC<CoachBuilderProps> = ({ selectedDate, onWorkoutScheduled, prefilledWorkout }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [groups, setGroups] = useState<string[]>([]);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [phase, setPhase] = useState('Base Phase');
  const [focus, setFocus] = useState('Aerobic Development');
  const [fatigue, setFatigue] = useState('Normal');
  
  // Manual State
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualItems, setManualItems] = useState<WorkoutItem[]>([]);
  // Temporary Manual Item State
  const [tempDist, setTempDist] = useState(400);
  const [tempUnit, setTempUnit] = useState<'m'|'km'|'mi'>('m');
  const [tempReps, setTempReps] = useState(1);
  const [tempZone, setTempZone] = useState<string>(Zone.STEADY); // Changed to string for Select compatibility
  const [tempRec, setTempRec] = useState('');

  // Common State
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<TrainingGroup[]>([]);
  const [dailyMessage, setDailyMessage] = useState(''); // New: Announcement
  const [parsedResult, setParsedResult] = useState<ParsedWorkout | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  
  // Library Saving
  const [tagsInput, setTagsInput] = useState(''); 
  const [savingToLib, setSavingToLib] = useState(false);

  useEffect(() => {
      const loadedGroups = StorageService.getGroups();
      setGroups(loadedGroups);
      if (loadedGroups.length > 0) {
          setSelectedGroups([loadedGroups[0]]);
      }
  }, []);

  // Effect for Prefill (Repeat Workout)
  useEffect(() => {
      if (prefilledWorkout) {
          setParsedResult(prefilledWorkout);
          setMode('ai'); // Just default to AI view to show the result card
      }
  }, [prefilledWorkout]);

  const toggleGroup = (g: TrainingGroup) => {
      if (selectedGroups.includes(g)) {
          setSelectedGroups(prev => prev.filter(item => item !== g));
      } else {
          setSelectedGroups(prev => [...prev, g]);
      }
  };

  // --- AI Logic ---
  const handleAnalyze = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    try {
      const context = { phase, focus, fatigue };
      const workout = await parseWorkoutWithAI(aiInput, context);
      setParsedResult(workout);
    } catch (error) {
      alert("Failed to parse workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Logic ---
  const addManualItem = () => {
      const newItem: WorkoutItem = {
          distance: Number(tempDist),
          unit: tempUnit,
          reps: Number(tempReps),
          zone: tempZone as Zone,
          recovery: tempRec || undefined
      };
      setManualItems([...manualItems, newItem]);
  };

  const removeManualItem = (idx: number) => {
      setManualItems(manualItems.filter((_, i) => i !== idx));
  };

  const generateManualWorkout = () => {
      if (!manualTitle || manualItems.length === 0) {
          alert("Please add a title and at least one interval.");
          return;
      }
      const workout: ParsedWorkout = {
          title: manualTitle,
          description: manualDesc,
          items: manualItems
      };
      setParsedResult(workout);
      // Reset form
      setManualTitle('');
      setManualDesc('');
      setManualItems([]);
  };

  // --- Scheduling / Saving ---
  const handleSchedule = () => {
      if (!parsedResult) return;
      
      const newScheduleItem: ScheduledWorkout = {
          id: Date.now().toString(),
          date: selectedDate,
          groups: selectedGroups,
          workout: parsedResult,
          dailyMessage: dailyMessage.trim() // Save the note
      };

      StorageService.saveWorkoutToSchedule(newScheduleItem);
      
      // Reset
      setAiInput('');
      setParsedResult(null);
      setShareUrl('');
      setDailyMessage('');
      onWorkoutScheduled();
  };

  const handleSaveToLibrary = () => {
      if (!parsedResult) return;
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const newItem: LibraryItem = {
          id: Date.now().toString(),
          workout: parsedResult,
          tags: tags
      };
      StorageService.saveToLibrary(newItem);
      setSavingToLib(false);
      setTagsInput('');
      alert("Saved to Workout Library!");
  };

  const handleGenerateShareLink = () => {
      if (!parsedResult) return;
      const data = btoa(JSON.stringify(parsedResult));
      const url = `${window.location.origin}${window.location.pathname}?share=${data}`;
      setShareUrl(url);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied!");
  };

  // --- Render Helpers ---
  const renderParsedResult = () => (
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in mt-4">
        <div className="flex justify-between items-start mb-2">
                <div>
                <h3 className="font-bold text-slate-800 mb-1">{parsedResult?.title}</h3>
                <p className="text-slate-600 text-xs">{parsedResult?.description}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setSavingToLib(!savingToLib)} className={`p-2 rounded border ${savingToLib ? 'bg-brand-100 text-brand-800 border-brand-200' : 'text-slate-400 hover:text-brand-600 hover:bg-white hover:border-slate-200'}`} title="Save to Library">
                        <Save className="w-4 h-4" />
                    </button>
                    <button onClick={handleGenerateShareLink} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white rounded border border-transparent hover:border-slate-200" title="Share / Embed">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
        </div>

        {/* Library Save Input */}
        {savingToLib && (
            <div className="mb-4 p-2 bg-white rounded border border-brand-200 flex gap-2 animate-in slide-in-from-top-2">
                <input 
                    className="flex-1 text-xs p-2 bg-slate-50 rounded border border-slate-200" 
                    placeholder="Tags (comma separated): e.g. hills, vo2, threshold" 
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                />
                <button onClick={handleSaveToLibrary} className="bg-brand-600 text-white text-xs font-bold px-3 rounded">Confirm Save</button>
            </div>
        )}

        {/* Daily Message Input */}
        <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Megaphone className="w-3 h-3" /> Coach's Note (Optional)
            </label>
            <input 
                value={dailyMessage}
                onChange={e => setDailyMessage(e.target.value)}
                placeholder="e.g. 'Bus leaves at 3:00pm' or 'Wear spikes today'"
                className="w-full text-sm p-2 border border-slate-200 rounded bg-white focus:border-brand-500 outline-none"
            />
        </div>

        {/* Items Preview */}
        <ul className="text-xs text-slate-600 mb-4 space-y-1 border-t border-slate-200 pt-2">
            {parsedResult?.items.map((item, i) => (
                <li key={i}>• {item.reps} x {item.distance}{item.unit} @ {item.zone} {item.recovery ? `(${item.recovery})` : ''}</li>
            ))}
        </ul>

        {shareUrl && (
            <div className="mb-4 p-3 bg-white border border-brand-200 rounded-lg">
                <div className="text-xs font-bold text-brand-600 mb-1 uppercase">Public Share Link / Embed</div>
                <div className="flex gap-2">
                    <input readOnly value={shareUrl} className="flex-1 text-[10px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-500" />
                    <button onClick={() => copyToClipboard(shareUrl)} className="bg-brand-100 text-brand-700 p-2 rounded hover:bg-brand-200"><Share2 className="w-3 h-3" /></button>
                </div>
            </div>
        )}

        <div className="flex gap-2 mt-4">
            <button
                onClick={() => { setParsedResult(null); setShareUrl(''); }}
                className="flex-1 bg-white border border-slate-300 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-50"
            >
                Back / Edit
            </button>
            <button
                onClick={handleSchedule}
                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center justify-center gap-2"
            >
                <CheckCircle className="w-4 h-4" /> Schedule
            </button>
        </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
            Workout Builder
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
              <button onClick={() => { setMode('ai'); setParsedResult(null); }} className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded transition-all ${mode === 'ai' ? 'bg-white shadow text-brand-800' : 'text-slate-500 hover:text-slate-700'}`}>AI Gen</button>
              <button onClick={() => { setMode('manual'); setParsedResult(null); }} className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded transition-all ${mode === 'manual' ? 'bg-white shadow text-brand-800' : 'text-slate-500 hover:text-slate-700'}`}>Manual</button>
          </div>
      </div>
      
      <div className="mb-4 p-3 bg-brand-50 rounded-lg border border-brand-100 flex items-center gap-3 text-brand-900 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Scheduling for: <span className="font-bold">{new Date(selectedDate).toDateString()}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Assign Groups
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
            {groups.length === 0 && <div className="text-xs text-slate-400 italic">No groups found. Go to Settings to add groups.</div>}
            {groups.map(g => (
                <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedGroups.includes(g) ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600'}`}
                >
                    {g}
                </button>
            ))}
        </div>
      </div>

      {/* MODE: AI GENERATOR */}
      {mode === 'ai' && !parsedResult && (
          <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <Select 
                        label="Training Phase"
                        icon={<Activity className="w-3 h-3" />}
                        value={phase} 
                        onChange={setPhase}
                        options={["Base Phase", "Build Phase", "Peak / Competition", "Taper"]}
                    />
                    <Select 
                        label="Workout Focus"
                        icon={<Gauge className="w-3 h-3" />}
                        value={focus}
                        onChange={setFocus}
                        options={["Aerobic Development", "Speed / Power", "Threshold / Stamina", "Recovery", "Long Run"]}
                    />
                    <Select 
                        label="Team Fatigue"
                        icon={<Battery className="w-3 h-3" />}
                        value={fatigue}
                        onChange={setFatigue}
                        options={["Fresh", "Normal", "High Fatigue"]}
                    />
                </div>

                <label className="block text-sm font-medium text-slate-600 mb-1">
                    AI Instructions
                </label>
                <div className="relative">
                    <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Describe the workout: e.g. '8x400m repeats' OR 'Create a fun speed workout'"
                        className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[120px] text-slate-800 placeholder:text-slate-400 resize-y font-mono text-sm shadow-sm"
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 mb-4">AI will generate a plan based on the description and context provided.</p>
                
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !aiInput || selectedGroups.length === 0}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Processing...' : 'Generate Workout'}
                </button>
          </div>
      )}

      {/* MODE: MANUAL BUILDER */}
      {mode === 'manual' && !parsedResult && (
          <div className="space-y-4">
              <input 
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200" 
                placeholder="Workout Title (e.g. Mile Repeats)" 
                value={manualTitle}
                onChange={e => setManualTitle(e.target.value)}
              />
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 resize-none" 
                placeholder="Description / Notes" 
                rows={2}
                value={manualDesc}
                onChange={e => setManualDesc(e.target.value)}
              />

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3">Add Interval</div>
                  <div className="flex flex-col sm:flex-row gap-2 items-end">
                      <div className="w-full sm:w-20">
                        <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Reps</label>
                        <input type="number" value={tempReps} onChange={e => setTempReps(Number(e.target.value))} className="w-full p-2.5 border rounded-lg text-sm" />
                      </div>
                      <div className="w-full sm:w-24">
                         <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Dist</label>
                        <input type="number" value={tempDist} onChange={e => setTempDist(Number(e.target.value))} className="w-full p-2.5 border rounded-lg text-sm" />
                      </div>
                      <div className="w-full sm:w-28">
                          <Select 
                            label="Unit"
                            value={tempUnit}
                            onChange={(v) => setTempUnit(v as any)}
                            options={["m", "km", "mi"]}
                          />
                      </div>
                      <div className="w-full sm:flex-1">
                          <Select 
                            label="Zone"
                            value={tempZone}
                            onChange={setTempZone}
                            options={ZONES}
                          />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Rec</label>
                        <input value={tempRec} onChange={e => setTempRec(e.target.value)} placeholder="2m" className="w-full p-2.5 border rounded-lg text-sm" />
                      </div>
                      <button onClick={addManualItem} className="bg-brand-600 text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-brand-700 transition-colors mb-[1px]">
                          <Plus className="w-5 h-5" />
                      </button>
                  </div>
              </div>

              {/* Manual Items List */}
              {manualItems.length > 0 && (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {manualItems.map((item, idx) => (
                          <div key={idx} className="p-3 text-sm flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                              <span className="font-medium text-slate-700">{item.reps} x {item.distance}{item.unit} @ {item.zone} {item.recovery && `(${item.recovery})`}</span>
                              <button onClick={() => removeManualItem(idx)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><X className="w-4 h-4" /></button>
                          </div>
                      ))}
                  </div>
              )}

              <button 
                onClick={generateManualWorkout}
                className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-900/10 transition-all"
              >
                  Preview & Schedule
              </button>
          </div>
      )}

      {/* RESULT PREVIEW (Common for AI & Manual) */}
      {parsedResult && renderParsedResult()}
    </div>
  );
};

export default CoachBuilder;
