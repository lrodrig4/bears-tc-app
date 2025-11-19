
export enum Zone {
  RECOVERY = 'Recovery',
  FOUNDATION = 'Foundation',
  STEADY = 'Steady',
  TEMPO = 'Tempo',
  THRESHOLD = 'Lactate Threshold',
  CV = 'CV',
  RACE_5K = '5K Race',
  RACE_3200 = '3200m Race',
  RACE_1600 = '1600m Race',
  RACE_800 = '800m Race',
  RACE_400 = '400m Race',
}

export type UserRole = 'coach' | 'athlete';

export type TrainingGroup = string;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  condition: (user: User, history: any[], streak: number) => boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  group: TrainingGroup;
  fivekmTime: string; // MM:SS
  vdot?: number;
  unlockedAchievements: string[]; // Array of Achievement IDs
  mentorId?: string; // ID of the user mentoring this athlete
}

export interface WorkoutItem {
  distance: number; // in meters
  unit: 'm' | 'km' | 'mi';
  zone: Zone;
  reps: number;
  recovery?: string;
}

export interface ParsedWorkout {
  title: string;
  description: string;
  items: WorkoutItem[];
}

export interface ScheduledWorkout {
  id: string;
  date: string; // ISO YYYY-MM-DD
  groups: TrainingGroup[];
  workout: ParsedWorkout;
  dailyMessage?: string; // Coach announcement
}

export interface LibraryItem {
  id: string;
  workout: ParsedWorkout;
  tags: string[];
}

export interface JournalEntry {
  id: string;
  workoutId: string;
  workoutTitle?: string;
  date: string;
  rating: number; // 1-10 RPE scale
  notes: string;
  athleteId: string;
  athleteName: string;
  athleteGroup: TrainingGroup;
  // Injury Tracking
  isInjured?: boolean;
  painLocation?: string;
  painLevel?: number; // 1-10
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface PaceData {
  vdot: number;
  recovery: string;
  foundation: string;
  steady: string;
  tempo: string;
  threshold: string;
  cv: string;
  race5k: string;
  race3200: string;
  race1600: string;
  race800: string;
  race400: string;
}