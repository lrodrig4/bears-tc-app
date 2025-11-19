import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ACHIEVEMENTS } from '../utils/achievements';
import { User } from '../types';
import * as Icons from 'lucide-react';

const BadgeCase: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(StorageService.getUser()); }, []);
  if (!user) return null;
  const unlockedSet = new Set(user.unlockedAchievements || []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Icons.Award className="w-5 h-5 text-brand-600" /> Trophy Case</h3>
          <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-1 rounded-full">{unlockedSet.size} / {ACHIEVEMENTS.length}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedSet.has(achievement.id);
            const IconComponent = (Icons as any)[achievement.icon] || Icons.Star;
            return (
                <div key={achievement.id} className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all ${isUnlocked ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-50 grayscale'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-slate-50' : 'bg-slate-200'}`}>
                        <IconComponent className={`w-5 h-5 ${isUnlocked ? achievement.color : 'text-slate-400'}`} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-800 leading-tight mb-0.5">{achievement.title}</div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
export default BadgeCase;