import React, { useState, useEffect } from 'react';
import { User, ScheduledWorkout, PaceData, JournalEntry, ParsedWorkout, AttendanceRecord } from './types';
import { getPaces } from './utils/timeMath';
import { StorageService } from './services/storage';
import Login from './components/Login';
import Calendar from './components/Calendar';
import CoachBuilder from './components/CoachBuilder';
import CoachRoster from './components/CoachRoster';
import WorkoutViewer from './components/WorkoutViewer';
import PaceCard from './components/PaceCard';
import Journal from './components/Journal';
import LibraryManager from './components/LibraryManager';
import SmartGrouper from './components/SmartGrouper';
import Leaderboard from './components/Leaderboard';
import Mentorship from './components/Mentorship';
import BadgeCase from './components/BadgeCase';
import InstallPrompt from './components/InstallPrompt';
import { checkAchievements } from './utils/achievements';
import { LogOut, Calendar as CalendarIcon, LayoutDashboard, Dumbbell, UserCircle, MessageSquare, BookOpen, Settings, Users, Flame, MapPin, Megaphone, CheckCircle2, Wand2, AlertCircle, UserPlus, Sun, Moon, Sunrise, Coffee } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [weeklyCheckins, setWeeklyCheckins] = useState(0);

  const [publicWorkout, setPublicWorkout] = useState<ParsedWorkout | null>(null);
  
  const [view, setView] = useState<'dashboard' | 'calendar' | 'library' | 'roster' | 'settings'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [prefilledWorkout, setPrefilledWorkout] = useState<ParsedWorkout | null>(null);
  const [managedGroups, setManagedGroups] = useState<string[]>([]);
  const [newGroupInput, setNewGroupInput] = useState('');

  const [athleteTab, setAthleteTab] = useState<'training' | 'paces' | 'leaderboard' | 'mentorship'>('training');
  const [groupingWorkout, setGroupingWorkout] = useState<ParsedWorkout | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newPr, setNewPr] = useState('');

  const paces: PaceData | null = user && user.fivekmTime ? getPaces(user.fivekmTime) : null;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('share');
      if (shareData) {
          try {
              const parsed = JSON.parse(atob(shareData));
              setPublicWorkout(parsed);
              return; 
          } catch (e) {
              console.error("Invalid share data");
          }
      }

      const storedUser = StorageService.getUser();
      if (storedUser) {
          setUser(storedUser);
          if (storedUser.role === 'athlete') {
             const streak = StorageService.getUserStreak(storedUser.id);
             setUserStreak(streak);
             const records = StorageService.getAttendanceForDate(today);
             const myRecord = records.find(r => r.userId === storedUser.id);
             setHasCheckedIn(!!myRecord);
             
             const attendance = StorageService.getAttendance().filter(a => a.userId === storedUser.id);
             const now = new Date();
             const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
             const thisWeek = attendance.filter(a => new Date(a.date) >= oneWeekAgo);
             setWeeklyCheckins(thisWeek.length);

             const history = StorageService.getJournal().filter(j => j.athleteId === storedUser.id);
             checkAchievements(storedUser, history, streak);
          }
      }
      refreshData();
  }, []);

  const refreshData = () => {
      setSchedule(StorageService.getSchedule());
      setJournals(StorageService.getJournal().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setAllUsers(StorageService.getAllUsers());
      setManagedGroups(StorageService.getGroups());
      setAttendanceToday(StorageService.getAttendanceForDate(today));
  };

  const handleLogout = () => {
      StorageService.logout();
      setUser(null);
  };

  const handleCoachDeleteWorkout = (id: string) => {
      if (confirm("Are you sure you want to delete this workout?")) {
          StorageService.deleteWorkout(id);
          refreshData();
      }
  };

  const handleRepeatWorkout = (workout: ParsedWorkout) => {
      setPrefilledWorkout(workout);
      setView('dashboard'); 
  };

  const handleLoadLibraryWorkout = (workout: ParsedWorkout) => {
      setPrefilledWorkout(workout);
      setView('dashboard');
  };

  const handleAddGroup = () => {
      if (newGroupInput.trim()) {
          StorageService.addGroup(newGroupInput.trim());
          setNewGroupInput('');
          refreshData();
      }
  };

  const handleDeleteGroup = (g: string) => {
      if (confirm(`Delete group "${g}"?`)) {
          StorageService.deleteGroup(g);
          refreshData();
      }
  };

  const handleUpdateProfile = () => {
      if (!user || !newPr.match(/[0-9]+:[0-9]{2}/)) {
          alert("Please enter valid time MM:SS");
          return;
      }
      const p = getPaces(newPr);
      const updatedUser = { ...user, fivekmTime: newPr, vdot: p.vdot };
      StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      setEditingProfile(false);
  };

  const handleCheckIn = () => {
      if (!user || hasCheckedIn) return;
      const record: AttendanceRecord = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          date: today,
          timestamp: new Date().toISOString()
      };
      StorageService.saveAttendance(record);
      setHasCheckedIn(true);
      setUserStreak(prev => prev + 1);
      setWeeklyCheckins(prev => prev + 1);
  };
  
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return { text: 'Good Morning', icon: <Sunrise className="w-4 h-4 text-orange-300" /> };
      if (hour < 18) return { text: 'Good Afternoon', icon: <Sun className="w-4 h-4 text-yellow-300" /> };
      return { text: 'Good Evening', icon: <Moon className="w-4 h-4 text-blue-200" /> };
  };

  if (publicWorkout) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
               <div className="mb-6 text-center">
                   <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight uppercase">Bears Track Club</h1>
                   <p className="text-brand-600 font-bold uppercase tracking-widest text-xs">Daily Workout</p>
               </div>
               <WorkoutViewer 
                  workout={publicWorkout} 
                  paces={{vdot:0} as any}
                  athletePr="18:00" 
                  vdot={0} 
               />
               <div className="mt-4 text-xs text-slate-400 max-w-md text-center">
                   *Note: Personalized splits are only available when logged into the Bears TC App.
               </div>
          </div>
      );
  }

  if (!user) {
      return (
        <>
            <Login onLogin={setUser} />
            <InstallPrompt />
        </>
      );
  }

  if (user.role === 'coach') {
      return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
             <InstallPrompt />
             <nav className="bg-brand-900 text-white sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="font-extrabold text-lg tracking-tight text-brand-400 uppercase leading-none">Bears TC</div>
                        <div className="text-[10px] font-bold tracking-widest text-white opacity-60 uppercase">Find A Way</div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                        <button onClick={() => setView('dashboard')} className={`p-2 rounded ${view === 'dashboard' ? 'bg-brand-800' : ''}`}><LayoutDashboard className="w-5 h-5" /></button>
                        <button onClick={() => setView('calendar')} className={`p-2 rounded ${view === 'calendar' ? 'bg-brand-800' : ''}`}><CalendarIcon className="w-5 h-5" /></button>
                        <button onClick={() => setView('library')} className={`p-2 rounded ${view === 'library' ? 'bg-brand-800' : ''}`}><BookOpen className="w-5 h-5" /></button>
                        <button onClick={() => setView('roster')} className={`p-2 rounded ${view === 'roster' ? 'bg-brand-800' : ''}`}><Users className="w-5 h-5" /></button>
                        <button onClick={() => setView('settings')} className={`p-2 rounded ${view === 'settings' ? 'bg-brand-800' : ''}`}><Settings className="w-5 h-5" /></button>
                        <button onClick={handleLogout} className="text-xs font-bold text-brand-200"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>
             </nav>

             <main className="max-w-6xl mx-auto px-4 py-6">
                 {groupingWorkout && (
                     <SmartGrouper workout={groupingWorkout} onClose={() => setGroupingWorkout(null)} />
                 )}

                 {view === 'dashboard' ? (
                     <>
                        <CoachBuilder selectedDate={selectedDate} onWorkoutScheduled={() => { refreshData(); setPrefilledWorkout(null); }} prefilledWorkout={prefilledWorkout} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-brand-600" /> Recent & Upcoming</h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm max-h-[400px] overflow-y-auto">
                                    {schedule.slice(-5).reverse().map(s => (
                                        <div key={s.id} className="p-4 hover:bg-slate-50">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 mb-1">{s.date}</div>
                                                <button onClick={() => setGroupingWorkout(s.workout)} className="text-[10px] bg-fuchsia-100 text-fuchsia-800 px-2 py-0.5 rounded font-bold flex items-center gap-1"><Wand2 className="w-3 h-3" /> Smart Packs</button>
                                            </div>
                                            <div className="font-bold text-slate-800 text-sm">{s.workout.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                                                {s.groups.map(g => <span key={g} className="bg-slate-100 px-1.5 py-0.5 rounded">{g}</span>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-600" /> Who's Here? ({attendanceToday.length})</h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm h-[400px] overflow-y-auto">
                                    {attendanceToday.map(record => (
                                        <div key={record.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                            <div><div className="font-bold text-sm">{record.userName}</div><div className="text-[10px] text-slate-400">{new Date(record.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div></div>
                                            <div className="text-orange-500 font-bold text-xs flex items-center gap-1"><Flame className="w-3 h-3 fill-orange-500" /> {StorageService.getUserStreak(record.userId)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-brand-600" /> Feedback</h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm h-[400px] overflow-y-auto">
                                    {journals.map(j => (
                                        <div key={j.id} className="p-4 hover:bg-slate-50">
                                            <div className="flex justify-between items-start mb-1">
                                                <div><span className="font-bold text-sm">{j.athleteName}</span><span className="text-xs text-slate-400 ml-2">({j.athleteGroup})</span></div>
                                                <span className="font-black text-brand-600">{j.rating}</span>
                                            </div>
                                            {j.isInjured && <div className="bg-red-50 text-red-700 text-xs p-1 rounded mb-1 flex gap-1 font-bold"><AlertCircle className="w-3 h-3" /> {j.painLocation} ({j.painLevel}/10)</div>}
                                            <p className="text-sm text-slate-600 italic">"{j.notes}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                     </>
                 ) : view === 'calendar' ? (
                     <Calendar workouts={schedule} onSelectDate={(d) => { setSelectedDate(d); setView('dashboard'); }} onDeleteWorkout={handleCoachDeleteWorkout} onRepeatWorkout={handleRepeatWorkout} />
                 ) : view === 'roster' ? (
                    <CoachRoster />
                 ) : view === 'settings' ? (
                     <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold mb-6">Settings & Groups</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-500 mb-2">Add New Group</label>
                            <div className="flex gap-2">
                                <input value={newGroupInput} onChange={e => setNewGroupInput(e.target.value)} className="flex-1 p-3 border rounded-lg" placeholder="e.g. 'Varsity Boys'" />
                                <button onClick={handleAddGroup} className="bg-brand-600 text-white font-bold px-4 rounded-lg">Add</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {managedGroups.map(g => (
                                <div key={g} className="flex justify-between items-center p-3 border rounded-lg">
                                    <span className="font-bold">{g}</span>
                                    <button onClick={() => handleDeleteGroup(g)} className="text-red-500 hover:bg-red-50 p-1 rounded">Delete</button>
                                </div>
                            ))}
                        </div>
                     </div>
                 ) : (
                     <LibraryManager onLoadWorkout={handleLoadLibraryWorkout} />
                 )}
             </main>
        </div>
      );
  }

  const greeting = getGreeting();
  const todaysWorkout = StorageService.getWorkoutForDateAndGroup(today, user.group);
  const existingJournal = todaysWorkout ? StorageService.getJournalEntryForWorkout(todaysWorkout.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        <InstallPrompt />
        <header className="bg-brand-900 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl mb-[-1.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-20"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20">🐻</div>
                         <div><div className="flex items-center gap-1 text-brand-200 text-xs font-medium">{greeting.icon} {greeting.text},</div><h1 className="text-xl font-bold leading-none">{user.name.split(' ')[0]}</h1></div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10"><Flame className={`w-4 h-4 ${userStreak > 0 ? 'fill-orange-500 text-orange-500' : 'text-slate-400'}`} /><span className="font-bold text-sm">{userStreak}</span></div>
                         <button onClick={handleLogout} className="bg-brand-800 p-2 rounded-full text-brand-200 border border-brand-700"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>
                {!editingProfile ? (
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/10">{user.group}</span>
                                {user.vdot && <span className="font-mono text-brand-200 text-xs">VDOT: <span className="text-white font-bold">{user.vdot.toFixed(1)}</span></span>}
                                <button onClick={() => { setNewPr(user.fivekmTime); setEditingProfile(true); }} className="text-brand-400 hover:text-white"><Settings className="w-4 h-4" /></button>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-brand-300 mb-1 font-bold uppercase tracking-wider"><span>Weekly Momentum</span><span>{weeklyCheckins} / 7 Days</span></div>
                                <div className="w-40 h-1.5 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-brand-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (weeklyCheckins / 7) * 100)}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-brand-800 p-4 rounded-xl border border-brand-600 animate-in fade-in">
                        <label className="text-[10px] font-bold text-brand-300 block mb-2 uppercase">Update 5K PR</label>
                        <div className="flex gap-2">
                            <input value={newPr} onChange={e => setNewPr(e.target.value)} className="text-slate-900 text-lg p-2 rounded-lg w-24 text-center font-mono font-bold" />
                            <button onClick={handleUpdateProfile} className="bg-brand-500 text-white text-xs px-4 rounded-lg font-bold flex-1">Save</button>
                            <button onClick={() => setEditingProfile(false)} className="text-brand-300 text-xs px-2">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </header>

        <main className="max-w-md mx-auto px-4 relative z-20">
            {todaysWorkout?.dailyMessage && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-xl shadow-sm flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 mt-1"><Megaphone className="w-4 h-4" /></div>
                    <div><h3 className="text-xs font-bold text-yellow-800 uppercase mb-1">Coach's Note</h3><p className="text-sm text-yellow-900 font-medium">"{todaysWorkout.dailyMessage}"</p></div>
                </div>
            )}

            <div className="mb-6">
                <button onClick={handleCheckIn} disabled={hasCheckedIn} className={`w-full py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all ${hasCheckedIn ? 'bg-white text-green-700 border-2 border-green-500 cursor-default shadow-none' : 'bg-brand-600 text-white hover:bg-brand-500'}`}>
                    {hasCheckedIn ? <><CheckCircle2 className="w-6 h-6" /> Checked In</> : <><MapPin className="w-6 h-6" /> Tap to Check In</>}
                </button>
            </div>
            
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mb-6">
                <button onClick={() => setAthleteTab('training')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${athleteTab === 'training' ? 'bg-brand-50 text-brand-700' : 'text-slate-400'}`}>Training</button>
                <button onClick={() => setAthleteTab('paces')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${athleteTab === 'paces' ? 'bg-brand-50 text-brand-700' : 'text-slate-400'}`}>Paces</button>
                <button onClick={() => setAthleteTab('leaderboard')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${athleteTab === 'leaderboard' ? 'bg-brand-50 text-brand-700' : 'text-slate-400'}`}>Rankings</button>
                <button onClick={() => setAthleteTab('mentorship')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${athleteTab === 'mentorship' ? 'bg-brand-50 text-brand-700' : 'text-slate-400'}`}>Team</button>
            </div>

            {athleteTab === 'training' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4"><Dumbbell className="w-5 h-5 text-brand-600" /><h2 className="font-bold text-slate-800 text-lg">Today's Training</h2></div>
                    {todaysWorkout ? (
                        <div>
                            <WorkoutViewer workout={todaysWorkout.workout} paces={paces!} athletePr={user.fivekmTime} vdot={user.vdot || 0} />
                            <Journal workoutId={todaysWorkout.id} workoutTitle={todaysWorkout.workout.title} user={user} onSaved={refreshData} existingEntry={existingJournal} />
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-xl">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400"><Coffee className="w-10 h-10" /></div>
                            <h3 className="font-bold text-slate-800 text-xl mb-2">Active Recovery Day</h3>
                            <p className="text-sm text-slate-500">No official workout scheduled for <strong>{user.group}</strong>.</p>
                        </div>
                    )}
                </section>
            )}
            {athleteTab === 'paces' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4"><UserCircle className="w-5 h-5 text-slate-600" /><h2 className="font-bold text-slate-800 text-lg">My Stats</h2></div>
                    <BadgeCase />
                    <div className="mt-6">{paces && <PaceCard paces={paces} />}</div>
                </section>
            )}
            {athleteTab === 'leaderboard' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Leaderboard /></section>
            )}
            {athleteTab === 'mentorship' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-slate-600" /><h2 className="font-bold text-slate-800 text-lg">Mentorship</h2></div>
                    <Mentorship user={user} />
                </section>
            )}
        </main>
    </div>
  );
};

export default App;