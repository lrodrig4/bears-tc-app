
import React, { useState, useEffect } from 'react';
import { User, TrainingGroup } from '../types';
import { StorageService } from '../services/storage';
import { getPaces } from '../utils/timeMath';
import { Search, UserMinus, Edit2, Check, X, Download, Share2, Lock, Shield, Flame, Link } from 'lucide-react';

const CoachRoster: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit States
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editPr, setEditPr] = useState('');
  
  // Assign Mentor State
  const [assigningMentorFor, setAssigningMentorFor] = useState<string | null>(null);

  // Team Code State
  const [teamCode, setTeamCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Cache Groups
  const groups = StorageService.getGroups();

  useEffect(() => {
      refreshRoster();
      const settings = StorageService.getTeamSettings();
      if (settings.teamCode) setTeamCode(settings.teamCode);
  }, []);

  const refreshRoster = () => {
      const all = StorageService.getAllUsers().filter(u => u.role === 'athlete');
      // Sort by Group then Name
      all.sort((a, b) => {
          if (a.group === b.group) return a.name.localeCompare(b.name);
          return a.group.localeCompare(b.group);
      });
      setUsers(all);
  };

  const handleStartEdit = (user: User) => {
      setEditingId(user.id);
      setEditName(user.name);
      setEditGroup(user.group);
      setEditPr(user.fivekmTime);
  };

  const handleCancelEdit = () => {
      setEditingId(null);
  };

  const handleSaveEdit = () => {
      if (!editingId) return;
      
      // Recalculate VDOT if PR changed
      const paces = getPaces(editPr);
      
      const existingUser = users.find(u => u.id === editingId);

      const updatedUser: User = {
          id: editingId,
          role: 'athlete', // Force keep as athlete
          name: editName,
          group: editGroup,
          fivekmTime: editPr,
          vdot: paces.vdot,
          mentorId: existingUser?.mentorId, // Keep existing mentor
          unlockedAchievements: existingUser?.unlockedAchievements || []
      };

      StorageService.updateUser(updatedUser);
      setEditingId(null);
      refreshRoster();
  };

  const handleDeleteUser = (id: string) => {
      if (confirm("Are you sure you want to remove this athlete from the roster? This cannot be undone.")) {
          StorageService.deleteUser(id);
          refreshRoster();
      }
  };

  const handleAssignMentor = (menteeId: string, mentorId: string) => {
      StorageService.assignMentor(menteeId, mentorId);
      setAssigningMentorFor(null);
      refreshRoster();
  };

  const handleExportCSV = () => {
      const headers = ['Name', 'Group', '5k PR', 'VDOT', 'Current Streak'];
      const rows = users.map(u => [
          u.name, 
          u.group, 
          u.fivekmTime, 
          u.vdot?.toFixed(1) || '0',
          StorageService.getUserStreak(u.id).toString()
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bears_tc_roster_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleSaveTeamCode = () => {
      StorageService.saveTeamSettings({ teamCode: teamCode.trim().toUpperCase() });
      setIsGeneratingCode(false);
  };

  const handleCopyInvite = () => {
      const code = teamCode.trim().toUpperCase();
      if (!code) return;
      const url = `${window.location.origin}${window.location.pathname}?code=${code}`;
      navigator.clipboard.writeText(url);
      alert(`Invite Link Copied!\n\nAnyone with this link will automatically have the team code applied.`);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-brand-600" /> Team Roster
            </h2>
            <p className="text-sm text-slate-500 mt-1">{users.length} Active Athletes</p>
        </div>
        
        <div className="flex gap-2">
             <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
                <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
                onClick={() => setIsGeneratingCode(!isGeneratingCode)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg text-sm font-bold text-brand-700 hover:bg-brand-100"
            >
                <Lock className="w-4 h-4" /> {teamCode ? 'Manage Invite' : 'Create Invite'}
            </button>
        </div>
      </div>

      {/* Invite Section */}
      {isGeneratingCode && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-brand-900 mb-2 flex items-center gap-2"><Share2 className="w-4 h-4"/> Invite Athletes</h3>
              <p className="text-xs text-brand-700 mb-4">Set a secure code for athletes to join your team. Share the code or the link below.</p>
              
              <div className="flex gap-2 max-w-md">
                  <input 
                    value={teamCode}
                    onChange={e => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="SET CODE (e.g. BEARS2024)"
                    className="flex-1 p-2 border border-brand-300 rounded uppercase font-mono tracking-wider text-sm"
                  />
                  <button onClick={handleSaveTeamCode} className="bg-brand-600 text-white px-4 rounded text-xs font-bold hover:bg-brand-700">Save</button>
              </div>

              {teamCode && (
                  <div className="mt-3 pt-3 border-t border-brand-200">
                      <div className="text-[10px] font-bold text-brand-500 uppercase mb-1">Quick Invite Link</div>
                      <button onClick={handleCopyInvite} className="w-full text-left text-xs bg-white p-2 rounded border border-brand-200 text-slate-500 font-mono hover:bg-brand-50 flex justify-between items-center">
                          <span className="truncate">{window.location.origin}{window.location.pathname}?code={teamCode}</span>
                          <span className="text-brand-600 font-bold ml-2">COPY</span>
                      </button>
                  </div>
              )}
          </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search athlete by name or group..."
            className="w-full pl-10 p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                  <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Group</th>
                      <th className="px-4 py-3">Streak</th>
                      <th className="px-4 py-3">5K PR</th>
                      <th className="px-4 py-3">Mentor</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => {
                      const streak = StorageService.getUserStreak(user.id);
                      const mentorName = user.mentorId ? users.find(u => u.id === user.mentorId)?.name : 'None';

                      return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          {editingId === user.id ? (
                              // Edit Mode
                              <>
                                <td className="px-4 py-2">
                                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-1 border rounded text-xs" />
                                </td>
                                <td className="px-4 py-2">
                                    <select value={editGroup} onChange={e => setEditGroup(e.target.value)} className="w-full p-1 border rounded text-xs">
                                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-2 text-slate-400">-</td>
                                <td className="px-4 py-2">
                                    <input value={editPr} onChange={e => setEditPr(e.target.value)} className="w-20 p-1 border rounded text-xs" placeholder="MM:SS" />
                                </td>
                                <td className="px-4 py-2 text-slate-400">-</td>
                                <td className="px-4 py-2 text-right flex justify-end gap-2">
                                    <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={handleCancelEdit} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X className="w-4 h-4" /></button>
                                </td>
                              </>
                          ) : (
                              // View Mode
                              <>
                                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs font-bold border border-brand-100">
                                        {user.group}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {streak > 0 ? (
                                        <span className="flex items-center gap-1 text-orange-600 font-bold">
                                            <Flame className="w-3 h-3 fill-orange-600" /> {streak}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono">{user.fivekmTime}</td>
                                <td className="px-4 py-3 text-xs">
                                    {assigningMentorFor === user.id ? (
                                        <select 
                                            onChange={(e) => handleAssignMentor(user.id, e.target.value)}
                                            className="w-full p-1 border rounded text-xs"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Mentor</option>
                                            {users.filter(u => u.id !== user.id).map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <button onClick={() => setAssigningMentorFor(user.id)} className="hover:underline text-brand-600">
                                            {mentorName}
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button onClick={() => handleStartEdit(user)} className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1 rounded transition-colors" title="Quick Edit">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Remove from Team">
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </td>
                              </>
                          )}
                      </tr>
                  )})}
                  {filteredUsers.length === 0 && (
                      <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">No athletes found matching your search.</td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default CoachRoster;
