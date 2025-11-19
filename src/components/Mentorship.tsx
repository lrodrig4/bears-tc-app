import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface MentorshipProps { user: User; }

const Mentorship: React.FC<MentorshipProps> = ({ user }) => {
  const [mentees, setMentees] = useState<User[]>([]);
  const [mentor, setMentor] = useState<User | null>(null);

  useEffect(() => {
      const allUsers = StorageService.getAllUsers();
      if (user.mentorId) { const m = allUsers.find(u => u.id === user.mentorId); if (m) setMentor(m); }
      setMentees(allUsers.filter(u => u.mentorId === user.id));
  }, [user]);

  return (
    <div className="space-y-4">
        {mentor && (<div className="bg-white p-4 rounded-xl border-l-4 border-brand-500 shadow-sm"><h3 className="text-xs font-bold text-slate-400 uppercase mb-2">My Mentor</h3><div className="flex items-center gap-3"><div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-lg">👟</div><div><div className="font-bold text-slate-800">{mentor.name}</div><div className="text-xs text-slate-500">{mentor.group}</div></div></div></div>)}
        {mentees.length > 0 && (<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><h3 className="text-xs font-bold text-slate-400 uppercase mb-3">My Mentees</h3><div className="space-y-3">{mentees.map(m => { const checkedIn = StorageService.getAttendanceForDate(new Date().toISOString().split('T')[0]).some(r => r.userId === m.id); return (<div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><div><div className="font-bold text-slate-800">{m.name}</div><div className="text-[10px] text-slate-400">{m.group}</div></div><div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${checkedIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{checkedIn ? 'Checked In' : 'Absent'}</div></div>); })}</div></div>)}
    </div>
  );
};
export default Mentorship;