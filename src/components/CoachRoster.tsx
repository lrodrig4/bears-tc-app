import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { getPaces } from '../utils/timeMath';
import { Search, UserMinus, Edit2, Check, X, Download, Share2, Lock, Shield, Flame } from 'lucide-react';

const CoachRoster: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editPr, setEditPr] = useState('');
  const [assigningMentorFor, setAssigningMentorFor] = useState<string | null>(null);
  const [teamCode, setTeamCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const groups = StorageService.getGroups();

  useEffect(() => {
      refreshRoster();
      const settings = StorageService.getTeamSettings();
      if (settings.teamCode) setTeamCode(settings.teamCode);
  }, []);

  const refreshRoster = () => {
      const all = StorageService.getAllUsers().filter(u => u.role === 'athlete');
      all.sort((a, b) => a.group === b.group ? a.name.localeCompare(b.name) : a.group.localeCompare(b.group));
      setUsers(all);
  };

  const handleSaveEdit = () => {
      if (!editingId) return;
      const paces = getPaces(editPr);
      const existingUser = users.find(u => u.id === editingId);
      const updatedUser: User = { id: editingId, role: 'athlete', name: editName, group: editGroup, fivekmTime: editPr, vdot: paces.vdot, mentorId: existingUser?.mentorId, unlockedAchievements: existingUser?.unlockedAchievements || [] };
      StorageService.updateUser(updatedUser);
      setEditingId(null);
      refreshRoster();
  };

  const handleExportCSV = () => {
      const rows = users.map(u => [u.name, u.group, u.fivekmTime, u.vdot?.toFixed(1) || '0', StorageService.getUserStreak(u.id).toString()]);
      const csvContent = "data:text/csv;charset=utf-8," + [['Name','Group','PR','VDOT','Streak'].join(','), ...rows.map(e => e.join(','))].join('\n');
      const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "roster.csv"); document.body.appendChild(link); link.click();
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.group.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="w-6 h-6 text-brand-600" /> Team Roster</h2><p className="text-sm text-slate-500 mt-1">{users.length} Active Athletes</p></div>
        <div className="flex gap-2"><button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold"><Download className="w-4 h-4" /> Export CSV</button><button onClick={() => setIsGeneratingCode(!isGeneratingCode)} className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm font-bold text-brand-700"><Lock className="w-4 h-4" /> {teamCode ? 'Manage Invite' : 'Create Invite'}</button></div>
      </div>
      {isGeneratingCode && (<div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6"><h3 className="font-bold text-brand-900 mb-2 flex items-center gap-2"><Share2 className="w-4 h-4"/> Invite Athletes</h3><div className="flex gap-2 max-w-md"><input value={teamCode} onChange={e => setTeamCode(e.target.value.toUpperCase())} placeholder="SET CODE" className="flex-1 p-2 border rounded uppercase" /><button onClick={() => { StorageService.saveTeamSettings({ teamCode: teamCode.trim().toUpperCase() }); setIsGeneratingCode(false); }} className="bg-brand-600 text-white px-4 rounded text-xs font-bold">Save</button></div></div>)}
      <div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 p-2.5 border rounded-lg text-sm" /></div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left text-slate-600"><thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Group</th><th className="px-4 py-3">Streak</th><th className="px-4 py-3">PR</th><th className="px-4 py-3">Mentor</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map(user => (<tr key={user.id} className="hover:bg-slate-50">{editingId === user.id ? (<><td className="px-4 py-2"><input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-1 border rounded text-xs" /></td><td className="px-4 py-2"><select value={editGroup} onChange={e => setEditGroup(e.target.value)} className="w-full p-1 border rounded text-xs">{groups.map(g => <option key={g} value={g}>{g}</option>)}</select></td><td>-</td><td className="px-4 py-2"><input value={editPr} onChange={e => setEditPr(e.target.value)} className="w-20 p-1 border rounded text-xs" /></td><td>-</td><td className="px-4 py-2 text-right flex justify-end gap-2"><button onClick={handleSaveEdit} className="text-green-600"><Check className="w-4 h-4" /></button><button onClick={() => setEditingId(null)} className="text-slate-400"><X className="w-4 h-4" /></button></td></>) : (<><td className="px-4 py-3 font-medium text-slate-900">{user.name}</td><td className="px-4 py-3"><span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs font-bold border border-brand-100">{user.group}</span></td><td className="px-4 py-3">{StorageService.getUserStreak(user.id) > 0 ? <span className="flex items-center gap-1 text-orange-600 font-bold"><Flame className="w-3 h-3 fill-orange-600" /> {StorageService.getUserStreak(user.id)}</span> : '-'}</td><td className="px-4 py-3 font-mono">{user.fivekmTime}</td><td className="px-4 py-3 text-xs">{assigningMentorFor === user.id ? <select onChange={(e) => { StorageService.assignMentor(user.id, e.target.value); setAssigningMentorFor(null); refreshRoster(); }} className="w-full p-1 border rounded text-xs" defaultValue=""><option value="" disabled>Select</option>{users.filter(u => u.id !== user.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select> : <button onClick={() => setAssigningMentorFor(user.id)} className="hover:underline text-brand-600">{user.mentorId ? users.find(u => u.id === user.mentorId)?.name : 'None'}</button>}</td><td className="px-4 py-3 text-right flex justify-end gap-2"><button onClick={() => { setEditingId(user.id); setEditName(user.name); setEditGroup(user.group); setEditPr(user.fivekmTime); }} className="text-slate-400 hover:text-brand-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => { if (confirm("Remove?")) { StorageService.deleteUser(user.id); refreshRoster(); } }} className="text-slate-400 hover:text-red-600"><UserMinus className="w-4 h-4" /></button></td></>)}</tr>))}</tbody></table>
      </div>
    </div>
  );
};
export default CoachRoster;