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
import { LogOut, Calendar as CalendarIcon, LayoutDashboard, Dumbbell, UserCircle, MessageSquare, Activity, Settings, Users, Plus, Trash2, Flame, MapPin, Megaphone, CheckCircle2, Wand2, AlertCircle, UserPlus, Sun, Moon, Sunrise, Coffee, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ScheduledWorkout[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  
  // Attendance State
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [weeklyCheckins, setWeeklyCheckins] = useState(0);

  // Public Share State
  const [publicWorkout, setPublicWorkout] = useState<ParsedWorkout | null>(null);
  
  // Coach State
  const [view, setView] = useState<'dashboard' | 'calendar' | 'library' | 'roster' | 'settings'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [prefilledWorkout, setPrefilledWorkout] = useState<ParsedWorkout | null>(null);
  const [managedGroups, setManagedGroups] = useState<string[]>([]);
  const [newGroupInput, setNewGroupInput] = useState('');

  // Athlete State
  const [athleteTab, setAthleteTab] = useState<'training' | 'paces' | 'leaderboard' | 'mentorship'>('training');

  // Smart Grouper State
  const [groupingWorkout, setGroupingWorkout] = useState<ParsedWorkout | null>(null);

  // Edit Profile State (Athlete)
  const [editingProfile, setEditingProfile] = useState(false);
  const [newPr, setNewPr] = useState('');

  // Computed
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
             // Check streak logic
             const streak = StorageService.getUserStreak(storedUser.id);
             setUserStreak(streak);
             // Check if checked in today
             const records = StorageService.getAttendanceForDate(today);
             const myRecord = records.find(r => r.userId === storedUser.id);
             setHasCheckedIn(!!myRecord);
             
             // Calculate Weekly Momentum
             const attendance = StorageService.getAttendance().filter(a => a.userId === storedUser.id);
             const now = new Date();
             const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
             const thisWeek = attendance.filter(a => new Date(a.date) >= oneWeekAgo);
             setWeeklyCheckins(thisWeek.length);

             // Achievements Check
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

  // Group Management
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
      
      // Optimistic streak update
      setUserStreak(prev => prev + 1);
      setWeeklyCheckins(prev => prev + 1);
  };
  
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return { text: 'Good Morning', icon: <Sunrise className="w-4 h-4 text-orange-300" /> };
      if (hour < 18) return { text: 'Good Afternoon', icon: <Sun className="w-4 h-4 text-yellow-300" /> };
      return { text: 'Good Evening', icon: <Moon className="w-4 h-4 text-blue-200" /> };
  };

  // --- PUBLIC VIEW (Embed) ---
  if (publicWorkout) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
               <div className="mb-6 text-center">
                   <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight uppercase">Bears Track Club</h1>
                   <p className="text-brand-600 font-bold uppercase tracking-widest text-xs">Daily Workout</p>
               </div>
               <WorkoutViewer 
                  workout={publicWorkout} 
                  paces={{
                      vdot: 0,
                      recovery: "N/A", foundation: "N/A", steady: "N/A", tempo: "N/A", 
                      threshold: "N/A", cv: "N/A", race5k: "N/A", race3200: "N/A", race1600: "N/A", race800: "N/A", race400: "N/A"
                  }}
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

  // --- COACH VIEW ---
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
                        <button onClick={() => setView('dashboard')} className={`p-2 rounded hover:bg-brand-800 ${view === 'dashboard' ? 'bg-brand-800' : ''}`} title="Dashboard"><LayoutDashboard className="w-5 h-5" /></button>
                        <button onClick={() => setView('calendar')} className={`p-2 rounded hover:bg-brand-800 ${view === 'calendar' ? 'bg-brand-800' : ''}`} title="Calendar"><CalendarIcon className="w-5 h-5" /></button>
                        <button onClick={() => setView('library')} className={`p-2 rounded hover:bg-brand-800 ${view === 'library' ? 'bg-brand-800' : ''}`} title="Library"><BookOpen className="w-5 h-5" /></button>
                        <button onClick={() => setView('roster')} className={`p-2 rounded hover:bg-brand-800 ${view === 'roster' ? 'bg-brand-800' : ''}`} title="Roster"><Users className="w-5 h-5" /></button>
                        <button onClick={() => setView('settings')} className={`p-2 rounded hover:bg-brand-800 ${view === 'settings' ? 'bg-brand-800' : ''}`} title="Settings"><Settings className="w-5 h-5" /></button>
                        <div className="h-6 w-px bg-brand-800"></div>
                        <button onClick={handleLogout} className="text-xs font-bold text-brand-200 hover:text-white flex items-center gap-1 whitespace-nowrap"><LogOut className="w-4 h-4" /> Exit</button>
                    </div>
                </div>
             </nav>

             <main className="max-w-6xl mx-auto px-4 py-6">
                 {/* SMART GROUPER MODAL */}
                 {groupingWorkout && (
                     <SmartGrouper 
                        workout={groupingWorkout}
                        onClose={() => setGroupingWorkout(null)}
                     />
                 )}

                 {view === 'dashboard' ? (
                     <>
                        <CoachBuilder 
                            selectedDate={selectedDate} 
                            onWorkoutScheduled={() => { refreshData(); setPrefilledWorkout(null); }} 
                            prefilledWorkout={prefilledWorkout}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Schedule Column */}
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-brand-600" /> Recent & Upcoming
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm max-h-[400px] overflow-y-auto">
                                    {schedule.slice(-5).reverse().map(s => (
                                        <div key={s.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-xs font-bold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-100 inline-block mb-1">{s.date}</div>
                                                <button 
                                                    onClick={() => setGroupingWorkout(s.workout)}
                                                    className="text-[10px] bg-fuchsia-100 text-fuchsia-800 px-2 py-0.5 rounded font-bold flex items-center gap-1 hover:bg-fuchsia-200 transition-colors"
                                                >
                                                    <Wand2 className="w-3 h-3" /> Smart Packs
                                                </button>
                                            </div>
                                            <div className="font-bold text-slate-800 text-sm">{s.workout.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                                                {s.groups.map(g => (
                                                    <span key={g} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{g}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {schedule.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No workouts scheduled yet.</div>}
                                </div>
                            </div>

                            {/* Attendance Column */}
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-brand-600" /> Who's Here? ({attendanceToday.length})
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm h-[400px] overflow-y-auto">
                                    {attendanceToday.length > 0 ? attendanceToday.map(record => (
                                        <div key={record.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                            <div>
                                                <div className="font-bold text-sm text-slate-800">{record.userName}</div>
                                                <div className="text-[10px] text-slate-400">Checked in {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </div>
                                            <div className="text-orange-500 font-bold text-xs flex items-center gap-1">
                                                <Flame className="w-3 h-3 fill-orange-500" /> {StorageService.getUserStreak(record.userId)}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 text-slate-300" />
                                            No check-ins yet today.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Feedback Column */}
                            <div className="lg:col-span-1">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-brand-600" /> Recent Feedback
                                </h3>
                                <div className="bg-white rounded-xl border border-slate-200 divide-y shadow-sm h-[400px] overflow-y-auto mb-8">
                                    {journals.length > 0 ? journals.map(j => {
                                        const rpeColor = j.rating > 8 ? 'text-red-600' : j.rating > 5 ? 'text-orange-600' : 'text-green-600';
                                        return (
                                        <div key={j.id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <span className="font-bold text-slate-800 text-sm">{j.athleteName}</span>
                                                    <span className="text-xs text-slate-400 ml-2">({j.athleteGroup})</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-400 uppercase">RPE</span>
                                                    <span className={`font-black ${rpeColor}`}>{j.rating}</span>
                                                </div>
                                            </div>
                                            {j.isInjured && (
                                                <div className="bg-red-50 text-red-700 text-xs p-1 rounded border border-red-100 mb-1 flex items-center gap-1 font-bold">
                                                    <AlertCircle className="w-3 h-3" /> {j.painLocation} Pain ({j.painLevel}/10)
                                                </div>
                                            )}
                                            {j.workoutTitle && <div className="text-xs font-semibold text-brand-600 mb-1">{j.workoutTitle}</div>}
                                            <p className="text-sm text-slate-600 italic">"{j.notes}"</p>
                                            <div className="text-[10px] text-slate-300 mt-2 text-right">
                                                {new Date(j.date).toLocaleDateString()} {new Date(j.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    )}) : (
                                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                            <Activity className="w-8 h-8 text-slate-300" />
                                            No journals logged yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                     </>
                 ) : view === 'calendar' ? (
                     <Calendar 
                        workouts={schedule} 
                        onSelectDate={(d) => { setSelectedDate(d); setView('dashboard'); }} 
                        onDeleteWorkout={handleCoachDeleteWorkout}
                        onRepeatWorkout={handleRepeatWorkout}
                     />
                 ) : view === 'roster' ? (
                    <CoachRoster />
                 ) : view === 'settings' ? (
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-brand-600" /> Settings & Groups
                        </h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Add New Training Group</label>
                            <div className="flex gap-2">
                                <input 
                                    value={newGroupInput}
                                    onChange={e => setNewGroupInput(e.target.value)}
                                    placeholder="e.g. 'Varsity Boys' or 'Sprinters'"
                                    className="flex-1 p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <button onClick={handleAddGroup} className="bg-brand-600 text-white font-bold px-4 rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-sm">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Active Groups</label>
                            {managedGroups.map(g => (
                                <div key={g} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm group hover:border-brand-200 transition-all">
                                    <span className="font-bold text-slate-700">{g}</span>
                                    <button onClick={() => handleDeleteGroup(g)} className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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

  // --- ATHLETE VIEW ---
  const greeting = getGreeting();
  const todaysWorkout = StorageService.getWorkoutForDateAndGroup(today, user.group);
  const existingJournal = todaysWorkout ? StorageService.getJournalEntryForWorkout(todaysWorkout.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        <InstallPrompt />
        {/* Mobile Header */}
        <header className="bg-brand-900 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl mb-[-1.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-20"></div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-700 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-10 -left-10 w-20 h-20 bg-brand-600 rounded-full blur-2xl opacity-30"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 text-lg shadow-inner">🐻</div>
                         <div>
                             <div className="flex items-center gap-1 text-brand-200 text-xs font-medium">
                                {greeting.icon} {greeting.text},
                             </div>
                             <h1 className="text-xl font-bold tracking-tight leading-none">{user.name.split(' ')[0]}</h1>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                             <Flame className={`w-4 h-4 ${userStreak > 0 ? 'fill-orange-500 text-orange-500 animate-pulse' : 'text-slate-400'}`} />
                             <span className="font-bold text-sm">{userStreak}</span>
                         </div>
                         <button onClick={handleLogout} className="bg-brand-800 p-2 rounded-full hover:bg-brand-700 text-brand-200 border border-brand-700 transition-colors"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>

                {!editingProfile ? (
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/10">{user.group}</span>
                                {user.vdot && <span className="font-mono text-brand-200 text-xs">VDOT: <span className="text-white font-bold">{user.vdot.toFixed(1)}</span></span>}
                                <button onClick={() => { setNewPr(user.fivekmTime); setEditingProfile(true); }} className="text-brand-400 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                            </div>
                            
                            {/* Weekly Momentum Bar */}
                            <div>
                                <div className="flex justify-between text-[10px] text-brand-300 mb-1 font-bold uppercase tracking-wider">
                                    <span>Weekly Momentum</span>
                                    <span>{weeklyCheckins} / 7 Days</span>
                                </div>
                                <div className="w-40 h-1.5 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div className="h-full bg-gradient-to-r from-brand-400 to-brand-200 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (weeklyCheckins / 7) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-brand-800 p-4 rounded-xl border border-brand-600 animate-in fade-in shadow-lg">
                        <label className="text-[10px] font-bold text-brand-300 block mb-2 uppercase tracking-wider">Update 5K PR (MM:SS)</label>
                        <div className="flex gap-2">
                            <input 
                                value={newPr} 
                                onChange={e => setNewPr(e.target.value)} 
                                className="text-slate-900 text-lg p-2 rounded-lg w-24 text-center font-mono font-bold outline-none focus:ring-2 focus:ring-brand-400" 
                            />
                            <button onClick={handleUpdateProfile} className="bg-brand-500 text-white text-xs px-4 rounded-lg font-bold hover:bg-brand-400 flex-1">Save</button>
                            <button onClick={() => setEditingProfile(false)} className="text-brand-300 text-xs px-2 hover:text-white">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </header>

        <main className="max-w-md mx-auto px-4 relative z-20">

            {/* DAILY ANNOUNCEMENT BANNER */}
            {todaysWorkout?.dailyMessage && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-xl shadow-sm animate-in slide-in-from-top-4 flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 mt-1">
                        <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">Coach's Note</h3>
                        <p className="text-sm text-yellow-900 font-medium leading-relaxed">"{todaysWorkout.dailyMessage}"</p>
                    </div>
                </div>
            )}

            {/* CHECK IN BUTTON */}
            <div className="mb-6">
                <button 
                    onClick={handleCheckIn}
                    disabled={hasCheckedIn}
                    className={`w-full py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95
                        ${hasCheckedIn 
                            ? 'bg-white text-green-700 border-2 border-green-500 cursor-default shadow-none' 
                            : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400 shadow-brand-500/40 hover:shadow-brand-500/60'
                        }`}
                >
                    {hasCheckedIn ? (
                        <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-6 h-6" /> 
                            <span>Checked In For Today</span>
                        </div>
                    ) : (
                        <><MapPin className="w-6 h-6" /> Tap to Check In</>
                    )}
                </button>
            </div>
            
            {/* NAVIGATION TABS */}
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mb-6">
                <button onClick={() => setAthleteTab('training')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${athleteTab === 'training' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    Training
                </button>
                <button onClick={() => setAthleteTab('paces')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${athleteTab === 'paces' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    Paces
                </button>
                <button onClick={() => setAthleteTab('leaderboard')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${athleteTab === 'leaderboard' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    Rankings
                </button>
                <button onClick={() => setAthleteTab('mentorship')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${athleteTab === 'mentorship' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                    Team
                </button>
            </div>

            {/* VIEW CONTENT */}
            {athleteTab === 'training' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Dumbbell className="w-5 h-5 text-brand-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Today's Training</h2>
                    </div>
                    
                    {todaysWorkout ? (
                        <div>
                            <WorkoutViewer 
                                workout={todaysWorkout.workout} 
                                paces={paces!} 
                                athletePr={user.fivekmTime} 
                                vdot={user.vdot || 0} 
                            />
                            <Journal 
                                workoutId={todaysWorkout.id}
                                workoutTitle={todaysWorkout.workout.title}
                                user={user} 
                                onSaved={refreshData} 
                                existingEntry={existingJournal} 
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-xl shadow-slate-200/50">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                                <Coffee className="w-10 h-10" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl mb-2">Active Recovery Day</h3>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                                No official workout scheduled for <strong>{user.group}</strong>. 
                                Take time to stretch, hydrate, and visualize your goals.
                            </p>
                        </div>
                    )}
                </section>
            )}

            {athleteTab === 'paces' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCircle className="w-5 h-5 text-slate-600" />
                        <h2 className="font-bold text-slate-800 text-lg">My Stats</h2>
                    </div>
                    <BadgeCase />
                    <div className="mt-6">
                        {paces && <PaceCard paces={paces} />}
                    </div>
                </section>
            )}

            {athleteTab === 'leaderboard' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Leaderboard />
                </section>
            )}

            {athleteTab === 'mentorship' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5 text-slate-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Mentorship</h2>
                    </div>
                    <Mentorship user={user} />
                </section>
            )}

        </main>
    </div>
  );
};

export default App;