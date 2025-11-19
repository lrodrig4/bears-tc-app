import { User, JournalEntry, Achievement } from '../types';
import { StorageService } from '../services/storage';
import { Flame, Trophy, Calendar, Activity, Zap, BookOpen, Star, TrendingUp, Crown, Mountain, Clock, Target } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'First Step', description: 'Log your first workout journal entry.', icon: 'Activity', color: 'text-blue-500', condition: (user, history) => history.length >= 1 },
  { id: 'consistency_3', title: 'Warming Up', description: 'Reach a 3-day check-in streak.', icon: 'Flame', color: 'text-orange-400', condition: (user, history, streak) => streak >= 3 },
  { id: 'consistency_7', title: 'On Fire', description: 'Reach a 7-day check-in streak.', icon: 'Flame', color: 'text-orange-600', condition: (user, history, streak) => streak >= 7 },
  { id: 'consistency_30', title: 'Unstoppable', description: 'Reach a 30-day check-in streak.', icon: 'Zap', color: 'text-yellow-500', condition: (user, history, streak) => streak >= 30 },
  { id: 'vdot_40', title: 'Level Up', description: 'Reach a VDOT of 40 or higher.', icon: 'TrendingUp', color: 'text-emerald-500', condition: (user) => (user.vdot || 0) >= 40 },
  { id: 'vdot_50', title: 'Elite Status', description: 'Reach a VDOT of 50 or higher.', icon: 'Crown', color: 'text-purple-500', condition: (user) => (user.vdot || 0) >= 50 },
  { id: 'vdot_60', title: 'National Class', description: 'Reach a VDOT of 60 or higher.', icon: 'Star', color: 'text-amber-500', condition: (user) => (user.vdot || 0) >= 60 }
];

export const checkAchievements = (user: User, history: JournalEntry[], currentStreak: number) => {
    let hasNewUnlock = false;
    const currentUnlocks = new Set(user.unlockedAchievements || []);

    ACHIEVEMENTS.forEach(achievement => {
        if (!currentUnlocks.has(achievement.id)) {
            if (achievement.condition(user, history, currentStreak)) {
                currentUnlocks.add(achievement.id);
                hasNewUnlock = true;
                alert(`🏆 Achievement Unlocked: ${achievement.title}!`);
            }
        }
    });

    if (hasNewUnlock) {
        const updatedUser = { ...user, unlockedAchievements: Array.from(currentUnlocks) };
        StorageService.saveUser(updatedUser);
    }
};