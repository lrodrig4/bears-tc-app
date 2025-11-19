/**
 * Storage Wrapper - Seamlessly uses Firebase for cross-device sync
 * while maintaining the same synchronous interface as localStorage
 *
 * This wrapper caches data locally for instant access and syncs to Firebase
 * in the background for cross-device functionality.
 */

import { User, ScheduledWorkout, JournalEntry, TrainingGroup, LibraryItem, AttendanceRecord } from '../types';
import { FirebaseStorageService } from './firebaseStorage';

const KEYS = {
  USER: 'bears_tc_user',
  SCHEDULE: 'bears_tc_schedule',
  JOURNAL: 'bears_tc_journal',
  LIBRARY: 'bears_tc_library',
  ALL_USERS: 'bears_tc_all_users',
  GROUPS: 'bears_tc_groups',
  TEAM_SETTINGS: 'bears_tc_settings',
  ATTENDANCE: 'bears_tc_attendance',
  FIREBASE_SYNCED: 'bears_tc_firebase_synced',
};

const DEFAULT_GROUPS = ['Varsity Boys', 'Varsity Girls', 'JV Boys', 'JV Girls', 'Mid Distance', 'Long Distance'];

// Initialize Firebase sync on app load
let syncInitialized = false;

const initializeSync = () => {
  if (syncInitialized) return;
  syncInitialized = true;

  // Subscribe to real-time users updates
  FirebaseStorageService.subscribeToUsers((users) => {
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('users-updated'));
  });

  // Subscribe to real-time schedule updates
  FirebaseStorageService.subscribeToSchedule((workouts) => {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(workouts));
    window.dispatchEvent(new CustomEvent('schedule-updated'));
  });

  // Initial sync from Firebase to localStorage
  syncFromFirebase();
};

const syncFromFirebase = async () => {
  try {
    const [users, schedule, groups, settings, library, journal, attendance] = await Promise.all([
      FirebaseStorageService.getAllUsers(),
      FirebaseStorageService.getSchedule(),
      FirebaseStorageService.getGroups(),
      FirebaseStorageService.getTeamSettings(),
      FirebaseStorageService.getLibrary(),
      FirebaseStorageService.getJournal(),
      FirebaseStorageService.getAttendance(),
    ]);

    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    localStorage.setItem(KEYS.TEAM_SETTINGS, JSON.stringify(settings));
    localStorage.setItem(KEYS.LIBRARY, JSON.stringify(library));
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(journal));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(KEYS.FIREBASE_SYNCED, 'true');

    window.dispatchEvent(new CustomEvent('firebase-synced'));
  } catch (error) {
    console.warn('Firebase sync failed, using local data:', error);
  }
};

export const StorageService = {
  // Initialize Firebase real-time sync
  initialize: () => {
    initializeSync();
  },

  getTeamSettings: () => {
    const data = localStorage.getItem(KEYS.TEAM_SETTINGS);
    return data ? JSON.parse(data) : { teamCode: '' };
  },

  saveTeamSettings: (settings: { teamCode: string }) => {
    localStorage.setItem(KEYS.TEAM_SETTINGS, JSON.stringify(settings));
    FirebaseStorageService.saveTeamSettings(settings).catch(console.error);
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    const allUsers = StorageService.getAllUsers();
    const index = allUsers.findIndex(u => u.id === user.id);
    if (index >= 0) {
      allUsers[index] = user;
    } else {
      allUsers.push(user);
    }
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));

    // Sync to Firebase
    FirebaseStorageService.saveUser(user).catch(console.error);
  },

  updateUser: (updatedUser: User) => {
    const allUsers = StorageService.getAllUsers();
    const index = allUsers.findIndex(u => u.id === updatedUser.id);
    if (index >= 0) {
      allUsers[index] = updatedUser;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
      const currentUser = StorageService.getUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
      }

      // Sync to Firebase
      FirebaseStorageService.updateUser(updatedUser).catch(console.error);
    }
  },

  deleteUser: (userId: string) => {
    const allUsers = StorageService.getAllUsers().filter(u => u.id !== userId);
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));

    // Sync to Firebase
    FirebaseStorageService.deleteUser(userId).catch(console.error);
  },

  assignMentor: (menteeId: string, mentorId: string) => {
    const allUsers = StorageService.getAllUsers();
    const menteeIndex = allUsers.findIndex(u => u.id === menteeId);
    if (menteeIndex >= 0) {
      allUsers[menteeIndex].mentorId = mentorId;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));

      // Sync to Firebase
      FirebaseStorageService.assignMentor(menteeId, mentorId).catch(console.error);
    }
  },

  getAllUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.ALL_USERS);
    return data ? JSON.parse(data) : [];
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
    FirebaseStorageService.logout();
  },

  getGroups: (): TrainingGroup[] => {
    const data = localStorage.getItem(KEYS.GROUPS);
    return data ? JSON.parse(data) : DEFAULT_GROUPS;
  },

  saveGroups: (groups: TrainingGroup[]) => {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    FirebaseStorageService.saveGroups(groups).catch(console.error);
  },

  addGroup: (group: string) => {
    const groups = StorageService.getGroups();
    if (!groups.includes(group)) {
      groups.push(group);
      StorageService.saveGroups(groups);
    }
  },

  deleteGroup: (group: string) => {
    const groups = StorageService.getGroups().filter(g => g !== group);
    StorageService.saveGroups(groups);
  },

  getSchedule: (): ScheduledWorkout[] => {
    const data = localStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : [];
  },

  saveWorkoutToSchedule: (workout: ScheduledWorkout) => {
    const schedule = StorageService.getSchedule();
    schedule.push(workout);
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));

    // Sync to Firebase
    FirebaseStorageService.saveWorkoutToSchedule(workout).catch(console.error);
  },

  getWorkoutForDateAndGroup: (date: string, group: TrainingGroup): ScheduledWorkout | undefined => {
    const schedule = StorageService.getSchedule();
    return schedule.find(w => w.date === date && w.groups.includes(group));
  },

  deleteWorkout: (id: string) => {
    const schedule = StorageService.getSchedule().filter(w => w.id !== id);
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));

    // Sync to Firebase
    FirebaseStorageService.deleteWorkout(id).catch(console.error);
  },

  getLibrary: (): LibraryItem[] => {
    const data = localStorage.getItem(KEYS.LIBRARY);
    return data ? JSON.parse(data) : [];
  },

  saveToLibrary: (item: LibraryItem) => {
    const lib = StorageService.getLibrary();
    lib.push(item);
    localStorage.setItem(KEYS.LIBRARY, JSON.stringify(lib));

    // Sync to Firebase
    FirebaseStorageService.saveToLibrary(item).catch(console.error);
  },

  deleteFromLibrary: (id: string) => {
    const lib = StorageService.getLibrary().filter(i => i.id !== id);
    localStorage.setItem(KEYS.LIBRARY, JSON.stringify(lib));

    // Sync to Firebase
    FirebaseStorageService.deleteFromLibrary(id).catch(console.error);
  },

  getJournal: (): JournalEntry[] => {
    const data = localStorage.getItem(KEYS.JOURNAL);
    return data ? JSON.parse(data) : [];
  },

  addJournalEntry: (entry: JournalEntry) => {
    const journal = StorageService.getJournal();
    journal.push(entry);
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(journal));

    // Sync to Firebase
    FirebaseStorageService.addJournalEntry(entry).catch(console.error);
  },

  getJournalEntryForWorkout: (workoutId: string): JournalEntry | undefined => {
    const journal = StorageService.getJournal();
    return journal.find(j => j.workoutId === workoutId);
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  saveAttendance: (record: AttendanceRecord) => {
    const list = StorageService.getAttendance();
    const exists = list.find(r => r.userId === record.userId && r.date === record.date);
    if (!exists) {
      list.push(record);
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));

      // Sync to Firebase
      FirebaseStorageService.saveAttendance(record).catch(console.error);
    }
  },

  getAttendanceForDate: (date: string): AttendanceRecord[] => {
    const list = StorageService.getAttendance();
    return list.filter(r => r.date === date);
  },

  getUserStreak: (userId: string): number => {
    const list = StorageService.getAttendance().filter(r => r.userId === userId);
    if (list.length === 0) return 0;
    const sortedDates = [...new Set(list.map(r => r.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }
    let currentDate = new Date(sortedDates[0]);
    for (let i = 0; i < sortedDates.length; i++) {
      const dateToCheck = new Date(sortedDates[i]);
      if (i === 0) {
        streak++;
      } else {
        const prevDateInLoop = new Date(sortedDates[i - 1]);
        const gap = (prevDateInLoop.getTime() - dateToCheck.getTime()) / (1000 * 3600 * 24);
        if (Math.round(gap) === 1) {
          streak++;
        } else {
          break;
        }
      }
      currentDate = dateToCheck;
    }
    return streak;
  }
};
