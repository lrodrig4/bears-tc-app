import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ChevronRight, Lock, Users, LogIn, UserPlus } from 'lucide-react';
import { getPaces } from '../utils/timeMath';
import Select from './ui/Select';

interface LoginProps { onLogin: (user: User) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [name, setName] = useState('');
  const [fivekmTime, setFivekmTime] = useState('');
  const [group, setGroup] = useState<string>('');
  const [coachPass, setCoachPass] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [requiredCode, setRequiredCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  useEffect(() => {
      setAvailableGroups(StorageService.getGroups());
      const settings = StorageService.getTeamSettings();
      if (settings.teamCode) setRequiredCode(settings.teamCode);
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode) { setEnteredCode(urlCode); setAuthMode('register'); }
      else if (StorageService.getAllUsers().length > 0) setAuthMode('login');
      if (StorageService.getGroups().length > 0) setGroup(StorageService.getGroups()[0]);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (role === 'coach') {
          if (coachPass === 'bears') {
              const existingCoach = StorageService.getAllUsers().find(u => u.role === 'coach');
              onLogin(existingCoach || { id: 'coach_master', name: 'Coach', role: 'coach', group: 'Coach', fivekmTime: '', unlockedAchievements: [] });
          } else alert('Incorrect Password');
      } else {
          const foundUser = StorageService.getAllUsers().find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.role === 'athlete');
          if (foundUser) { StorageService.saveUser(foundUser); onLogin(foundUser); } else alert('Account not found.');
      }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'coach' && coachPass !== 'bears') { alert('Invalid Coach Password'); return; }
    if (role === 'athlete' && requiredCode && enteredCode.toUpperCase() !== requiredCode.toUpperCase()) { alert('Invalid Team Code'); return; }
    const vdot = fivekmTime ? getPaces(fivekmTime).vdot : 0;
    const newUser: User = { id: Date.now().toString(), name: name.trim(), role, group: role === 'coach' ? 'Coach' : group, fivekmTime, vdot, unlockedAchievements: [] };
    StorageService.saveUser(newUser);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border-t-4 border-brand-500">
        <div className="text-center mb-8"><div className="bg-brand-900 text-brand-400 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">🐻</div><h1 className="text-3xl font-extrabold text-brand-900 tracking-tight uppercase">Bears Track Club</h1><p className="text-brand-600 font-bold uppercase text-[10px] bg-brand-50 inline-block px-2 py-0.5 rounded">Find A Way</p></div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8"><button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-xs font-bold rounded-xl ${authMode === 'register' ? 'bg-white shadow text-brand-900' : 'text-slate-400'}`}>Join Team</button><button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-xs font-bold rounded-xl ${authMode === 'login' ? 'bg-white shadow text-brand-900' : 'text-slate-400'}`}>Sign In</button></div>
        <div className="flex justify-center gap-6 mb-6"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" className="hidden" checked={role === 'athlete'} onChange={() => setRole('athlete')} /><span className={`text-sm font-bold ${role === 'athlete' ? 'text-brand-900' : 'text-slate-400'}`}>Athlete</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" className="hidden" checked={role === 'coach'} onChange={() => setRole('coach')} /><span className={`text-sm font-bold ${role === 'coach' ? 'text-brand-900' : 'text-slate-400'}`}>Coach</span></label></div>
        <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-5">
            {role === 'athlete' && <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Name</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3.5 border rounded-xl" placeholder="First Last" /></div>}
            {authMode === 'register' && role === 'athlete' && (<><div><Select label="Group" icon={<Users className="w-3 h-3" />} value={group} onChange={setGroup} options={availableGroups} /></div><div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">5K PR</label><input required pattern="[0-9]+:[0-9]{2}" value={fivekmTime} onChange={e => setFivekmTime(e.target.value)} className="w-full p-3.5 border rounded-xl font-mono" placeholder="19:30" /></div>{requiredCode && <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Code</label><input required value={enteredCode} onChange={e => setEnteredCode(e.target.value)} className="w-full p-3.5 border rounded-xl uppercase" placeholder="CODE" /></div>}</>)}
            {role === 'coach' && <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Password</label><input type="password" required value={coachPass} onChange={e => setCoachPass(e.target.value)} className="w-full p-3.5 border rounded-xl" /></div>}
            <button type="submit" className="w-full bg-brand-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">{authMode === 'login' ? 'Welcome Back' : 'Enter'} <ChevronRight className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
};
export default Login;