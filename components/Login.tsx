
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ChevronRight, Lock, Users, LogIn, UserPlus } from 'lucide-react';
import { getPaces } from '../utils/timeMath';
import Select from './ui/Select';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Mode: 'register' = New User, 'login' = Existing User
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [name, setName] = useState('');
  const [fivekmTime, setFivekmTime] = useState('');
  const [group, setGroup] = useState<string>('');
  const [coachPass, setCoachPass] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  
  // Team Code State
  const [requiredCode, setRequiredCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  useEffect(() => {
      const groups = StorageService.getGroups();
      setAvailableGroups(groups);
      if (groups.length > 0) setGroup(groups[0]);

      // Check for Team Settings
      const settings = StorageService.getTeamSettings();
      if (settings.teamCode) {
          setRequiredCode(settings.teamCode);
      }

      // Check URL for Invite Code
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode) {
          setEnteredCode(urlCode);
          // If there is a code, assume they are new and want to register
          setAuthMode('register');
      } else {
          // If no code, check if there are users on this device. 
          // If users exist, default to Login screen for better UX.
          const existingUsers = StorageService.getAllUsers();
          if (existingUsers.length > 0) {
              setAuthMode('login');
          }
      }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();

      if (role === 'coach') {
          if (coachPass === 'bears') {
              // Find existing coach profile or create a temporary session
              const users = StorageService.getAllUsers();
              const existingCoach = users.find(u => u.role === 'coach');
              
              if (existingCoach) {
                  onLogin(existingCoach);
              } else {
                  // Fallback if they cleared data but remember password
                  const newCoach: User = {
                      id: 'coach_master',
                      name: 'Coach',
                      role: 'coach',
                      group: 'Coach',
                      fivekmTime: '',
                      unlockedAchievements: []
                  };
                  StorageService.saveUser(newCoach);
                  onLogin(newCoach);
              }
          } else {
              alert('Incorrect Coach Password');
          }
      } else {
          // Athlete Login
          const users = StorageService.getAllUsers();
          // Simple name match for this local-first app
          const foundUser = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.role === 'athlete');
          
          if (foundUser) {
              StorageService.saveUser(foundUser); // Set as current active user
              onLogin(foundUser);
          } else {
              alert('Account not found on this device. Please switch to "Join Team" to create your profile.');
          }
      }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'coach') {
        if (coachPass !== 'bears') {
            alert('Invalid Coach Password (Hint: bears)');
            return;
        }
    } else {
        // Athlete check for team code
        if (requiredCode && enteredCode.toUpperCase() !== requiredCode.toUpperCase()) {
            alert('Invalid Team Code. Please ask your coach for the code.');
            return;
        }
    }

    let vdot = 0;
    if (fivekmTime) {
        const paces = getPaces(fivekmTime);
        vdot = paces.vdot;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      group: role === 'coach' ? 'Coach' : group,
      fivekmTime,
      vdot,
      unlockedAchievements: []
    };

    StorageService.saveUser(newUser);
    
    // Clear URL params
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
    
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border-t-4 border-brand-500 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Logo */}
        <div className="text-center mb-8">
            <div className="bg-brand-900 text-brand-400 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-brand-100 shadow-xl transform -rotate-3">
                <span className="font-bold text-3xl">🐻</span>
            </div>
            <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight uppercase">Bears Track Club</h1>
            <p className="text-brand-600 font-bold uppercase tracking-widest text-[10px] mt-1 bg-brand-50 inline-block px-2 py-0.5 rounded">Find A Way</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
            <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${authMode === 'register' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
            ></div>
            <button 
                onClick={() => setAuthMode('register')}
                className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 ${authMode === 'register' ? 'text-brand-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <UserPlus className="w-4 h-4" /> Join Team
            </button>
            <button 
                onClick={() => setAuthMode('login')}
                className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 ${authMode === 'login' ? 'text-brand-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LogIn className="w-4 h-4" /> Sign In
            </button>
        </div>

        {/* Role Toggle (Always visible for context) */}
        <div className="flex justify-center gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${role === 'athlete' ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'}`}>
                    {role === 'athlete' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input type="radio" className="hidden" checked={role === 'athlete'} onChange={() => setRole('athlete')} />
                <span className={`text-sm font-bold transition-colors ${role === 'athlete' ? 'text-brand-900' : 'text-slate-400 group-hover:text-slate-600'}`}>Athlete</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${role === 'coach' ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'}`}>
                    {role === 'coach' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input type="radio" className="hidden" checked={role === 'coach'} onChange={() => setRole('coach')} />
                <span className={`text-sm font-bold transition-colors ${role === 'coach' ? 'text-brand-900' : 'text-slate-400 group-hover:text-slate-600'}`}>Coach</span>
            </label>
        </div>

        {/* Forms */}
        <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
            
            {/* Name Input (Used for both Login and Register) */}
            {role === 'athlete' && (
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                        {authMode === 'register' ? 'Your Full Name' : 'Enter Your Name'}
                    </label>
                    <input 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" 
                        placeholder="First Last" 
                    />
                </div>
            )}

            {/* REGISTER ONLY FIELDS */}
            {authMode === 'register' && role === 'athlete' && (
                <>
                    <div className="relative z-20">
                        <Select 
                            label="Training Group"
                            icon={<Users className="w-3 h-3" />}
                            value={group}
                            onChange={setGroup}
                            options={availableGroups}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">5K PR (MM:SS)</label>
                        <input 
                            required 
                            pattern="[0-9]+:[0-9]{2}" 
                            value={fivekmTime} 
                            onChange={e => setFivekmTime(e.target.value)} 
                            className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-mono font-bold text-lg tracking-wide text-slate-800" 
                            placeholder="19:30" 
                        />
                    </div>

                    {requiredCode && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Team Access Code
                            </label>
                            <input 
                                required 
                                value={enteredCode} 
                                onChange={e => setEnteredCode(e.target.value)} 
                                className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none uppercase font-mono tracking-wider font-bold transition-all text-brand-600" 
                                placeholder="CODE" 
                            />
                        </div>
                    )}
                </>
            )}

            {/* COACH PASSWORD (Used for both) */}
            {role === 'coach' && (
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Coach Access Code</label>
                    <input 
                        type="password" 
                        required 
                        value={coachPass} 
                        onChange={e => setCoachPass(e.target.value)} 
                        className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800" 
                        placeholder="••••" 
                    />
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-900/20 active:scale-[0.98] mt-4"
            >
                {authMode === 'login' ? 'Welcome Back' : (role === 'coach' ? 'Enter Dashboard' : 'Create Profile')} 
                <ChevronRight className="w-4 h-4" />
            </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Bears TC • Est. 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
