
import { User, JournalEntry, Achievement } from '../types';
import { StorageService } from '../services/storage';
import { Flame, Trophy, Calendar, Activity, Zap, BookOpen, Star, TrendingUp, Crown, Mountain, Clock, Target } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Log your first workout journal entry.',
    icon: 'Activity',
    color: 'text-blue-500',
    condition: (user, history) => history.length >= 1
  },
  {
    id: 'consistency_3',
    title: 'Warming Up',
    description: 'Reach a 3-day check-in streak.',
    icon: 'Flame',
    color: 'text-orange-400',
    condition: (user, history, streak) => streak >= 3
  },
  {
    id: 'consistency_7',
    title: 'On Fire',
    description: 'Reach a 7-day check-in streak.',
    icon: 'Flame',
    color: 'text-orange-600',
    condition: (user, history, streak) => streak >= 7
  },
  {
    id: 'consistency_30',
    title: 'Unstoppable',
    description: 'Reach a 30-day check-in streak.',
    icon: 'Zap',
    color: 'text-yellow-500',
    condition: (user, history, streak) => streak >= 30
  },
  {
    id: 'journalist_5',
    title: 'Reflective',
    description: 'Log 5 workout journal entries.',
    icon: 'BookOpen',
    color: 'text-indigo-500',
    condition: (user, history) => history.length >= 5
  },
  {
    id: 'journalist_20',
    title: 'Historian',
    description: 'Log 20 workout journal entries.',
    icon: 'BookOpen',
    color: 'text-indigo-700',
    condition: (user, history) => history.length >= 20
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Log a workout on a Saturday or Sunday.',
    icon: 'Calendar',
    color: 'text-green-500',
    condition: (user, history) => {
        return history.some(entry => {
            const day = new Date(entry.date).getDay();
            return day === 0 || day === 6; // 0 is Sun, 6 is Sat
        });
    }
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Check in before 8 AM.',
    icon: 'Clock',
    color: 'text-sky-400',
    condition: (user, history) => {
        const attendance = StorageService.getAttendance().filter(a => a.userId === user.id);
        return attendance.some(a => {
            const hour = new Date(a.timestamp).getHours();
            return hour < 8;
        });
    }
  },
  {
    id: 'vdot_40',
    title: 'Level Up',
    description: 'Reach a VDOT of 40 or higher.',
    icon: 'TrendingUp',
    color: 'text-emerald-500',
    condition: (user) => (user.vdot || 0) >= 40
  },
  {
    id: 'vdot_50',
    title: 'Elite Status',
    description: 'Reach a VDOT of 50 or higher.',
    icon: 'Crown',
    color: 'text-purple-500',
    condition: (user) => (user.vdot || 0) >= 50
  },
  {
    id: 'vdot_60',
    title: 'National Class',
    description: 'Reach a VDOT of 60 or higher.',
    icon: 'Star',
    color: 'text-amber-500',
    condition: (user) => (user.vdot || 0) >= 60
  },
  {
    id: 'bear_club',
    title: 'Bear Club',
    description: 'Member of the Varsity group.',
    icon: 'Mountain',
    color: 'text-brand-600',
    condition: (user) => user.group.includes('Varsity')
  }
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
