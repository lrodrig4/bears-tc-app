
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface MentorshipProps {
  user: User;
}

const Mentorship: React.FC<MentorshipProps> = ({ user }) => {
  const [mentees, setMentees] = useState<User[]>([]);
  const [mentor, setMentor] = useState<User | null>(null);

  useEffect(() => {
      const allUsers = StorageService.getAllUsers();
      
      // Find my mentor
      if (user.mentorId) {
          const m = allUsers.find(u => u.id === user.mentorId);
          if (m) setMentor(m);
      }

      // Find my mentees
      const myMentees = allUsers.filter(u => u.mentorId === user.id);
      setMentees(myMentees);

  }, [user]);

  const getTodayCheckin = (userId: string) => {
      const today = new Date().toISOString().split('T')[0];
      const records = StorageService.getAttendanceForDate(today);
      return records.some(r => r.userId === userId);
  };

  if (!mentor && mentees.length === 0) {
      return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700">No Mentorship Assigned</h3>
              <p className="text-xs text-slate-400 mt-1">Ask your coach to assign you a mentor or mentees!</p>
          </div>
      );
  }

  return (
    <div className="space-y-4">
        {/* My Mentor */}
        {mentor && (
            <div className="bg-white p-4 rounded-xl border-l-4 border-brand-500 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">My Mentor</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-lg">👟</div>
                        <div>
                            <div className="font-bold text-slate-800">{mentor.name}</div>
                            <div className="text-xs text-slate-500">{mentor.group}</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* My Mentees */}
        {mentees.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">My Mentees</h3>
                <div className="space-y-3">
                    {mentees.map(m => {
                        const checkedIn = getTodayCheckin(m.id);
                        return (
                            <div key={m.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{m.name}</div>
                                    <div className="text-[10px] text-slate-400">{m.group}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${checkedIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {checkedIn ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {checkedIn ? 'Checked In' : 'Absent'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};

export default Mentorship;
