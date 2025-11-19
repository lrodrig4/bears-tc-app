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
  icon: string;
  color: string;
  condition: (user: User, history: any[], streak: number) => boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  group: TrainingGroup;
  fivekmTime: string;
  vdot?: number;
  unlockedAchievements: string[];
  mentorId?: string;
}

export interface WorkoutItem {
  distance: number;
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
  date: string;
  groups: TrainingGroup[];
  workout: ParsedWorkout;
  dailyMessage?: string;
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
  rating: number;
  notes: string;
  athleteId: string;
  athleteName: string;
  athleteGroup: TrainingGroup;
  isInjured?: boolean;
  painLocation?: string;
  painLevel?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
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