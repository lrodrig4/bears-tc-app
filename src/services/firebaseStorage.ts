import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  User,
  ScheduledWorkout,
  JournalEntry,
  TrainingGroup,
  LibraryItem,
  AttendanceRecord
} from '../types';

// Team ID - In production, this would come from authentication
// For now, we'll use a fixed team ID that all users share
const TEAM_ID = 'bears-tc-default';

const DEFAULT_GROUPS = ['Varsity Boys', 'Varsity Girls', 'JV Boys', 'JV Girls', 'Mid Distance', 'Long Distance'];

export const FirebaseStorageService = {
  // Team Settings
  getTeamSettings: async () => {
    const docRef = doc(db, 'teams', TEAM_ID, 'settings', 'config');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : { teamCode: '' };
  },

  saveTeamSettings: async (settings: { teamCode: string }) => {
    const docRef = doc(db, 'teams', TEAM_ID, 'settings', 'config');
    await setDoc(docRef, settings, { merge: true });
  },

  // Current User (stored in localStorage for session, but synced to Firestore)
  getUser: (): User | null => {
    const data = localStorage.getItem('bears_tc_current_user');
    return data ? JSON.parse(data) : null;
  },

  saveUser: async (user: User) => {
    // Save to localStorage for quick access
    localStorage.setItem('bears_tc_current_user', JSON.stringify(user));

    // Save to Firestore for cross-device sync
    const userRef = doc(db, 'teams', TEAM_ID, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  },

  updateUser: async (updatedUser: User) => {
    const userRef = doc(db, 'teams', TEAM_ID, 'users', updatedUser.id);
    await updateDoc(userRef, { ...updatedUser });

    // Update localStorage if it's the current user
    const currentUser = FirebaseStorageService.getUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      localStorage.setItem('bears_tc_current_user', JSON.stringify(updatedUser));
    }
  },

  deleteUser: async (userId: string) => {
    const userRef = doc(db, 'teams', TEAM_ID, 'users', userId);
    await deleteDoc(userRef);
  },

  assignMentor: async (menteeId: string, mentorId: string) => {
    const userRef = doc(db, 'teams', TEAM_ID, 'users', menteeId);
    await updateDoc(userRef, { mentorId });
  },

  getAllUsers: async (): Promise<User[]> => {
    const usersCol = collection(db, 'teams', TEAM_ID, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(doc => doc.data() as User);
  },

  // Subscribe to real-time user updates
  subscribeToUsers: (callback: (users: User[]) => void): Unsubscribe => {
    const usersCol = collection(db, 'teams', TEAM_ID, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as User);
      callback(users);
    });
  },

  logout: () => {
    localStorage.removeItem('bears_tc_current_user');
  },

  // Groups
  getGroups: async (): Promise<TrainingGroup[]> => {
    const docRef = doc(db, 'teams', TEAM_ID, 'settings', 'groups');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().list : DEFAULT_GROUPS;
  },

  saveGroups: async (groups: TrainingGroup[]) => {
    const docRef = doc(db, 'teams', TEAM_ID, 'settings', 'groups');
    await setDoc(docRef, { list: groups });
  },

  addGroup: async (group: string) => {
    const groups = await FirebaseStorageService.getGroups();
    if (!groups.includes(group)) {
      groups.push(group);
      await FirebaseStorageService.saveGroups(groups);
    }
  },

  deleteGroup: async (group: string) => {
    const groups = await FirebaseStorageService.getGroups();
    const filtered = groups.filter(g => g !== group);
    await FirebaseStorageService.saveGroups(filtered);
  },

  // Schedule
  getSchedule: async (): Promise<ScheduledWorkout[]> => {
    const scheduleCol = collection(db, 'teams', TEAM_ID, 'schedule');
    const snapshot = await getDocs(scheduleCol);
    return snapshot.docs.map(doc => doc.data() as ScheduledWorkout);
  },

  saveWorkoutToSchedule: async (workout: ScheduledWorkout) => {
    const workoutRef = doc(db, 'teams', TEAM_ID, 'schedule', workout.id);
    await setDoc(workoutRef, workout);
  },

  getWorkoutForDateAndGroup: async (date: string, group: TrainingGroup): Promise<ScheduledWorkout | undefined> => {
    const schedule = await FirebaseStorageService.getSchedule();
    return schedule.find(w => w.date === date && w.groups.includes(group));
  },

  deleteWorkout: async (id: string) => {
    const workoutRef = doc(db, 'teams', TEAM_ID, 'schedule', id);
    await deleteDoc(workoutRef);
  },

  // Subscribe to real-time schedule updates
  subscribeToSchedule: (callback: (workouts: ScheduledWorkout[]) => void): Unsubscribe => {
    const scheduleCol = collection(db, 'teams', TEAM_ID, 'schedule');
    return onSnapshot(scheduleCol, (snapshot) => {
      const workouts = snapshot.docs.map(doc => doc.data() as ScheduledWorkout);
      callback(workouts);
    });
  },

  // Library
  getLibrary: async (): Promise<LibraryItem[]> => {
    const libraryCol = collection(db, 'teams', TEAM_ID, 'library');
    const snapshot = await getDocs(libraryCol);
    return snapshot.docs.map(doc => doc.data() as LibraryItem);
  },

  saveToLibrary: async (item: LibraryItem) => {
    const itemRef = doc(db, 'teams', TEAM_ID, 'library', item.id);
    await setDoc(itemRef, item);
  },

  deleteFromLibrary: async (id: string) => {
    const itemRef = doc(db, 'teams', TEAM_ID, 'library', id);
    await deleteDoc(itemRef);
  },

  // Journal
  getJournal: async (): Promise<JournalEntry[]> => {
    const journalCol = collection(db, 'teams', TEAM_ID, 'journal');
    const snapshot = await getDocs(journalCol);
    return snapshot.docs.map(doc => doc.data() as JournalEntry);
  },

  addJournalEntry: async (entry: JournalEntry) => {
    const entryRef = doc(db, 'teams', TEAM_ID, 'journal', entry.id);
    await setDoc(entryRef, entry);
  },

  getJournalEntryForWorkout: async (workoutId: string): Promise<JournalEntry | undefined> => {
    const journal = await FirebaseStorageService.getJournal();
    return journal.find(j => j.workoutId === workoutId);
  },

  // Attendance
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const attendanceCol = collection(db, 'teams', TEAM_ID, 'attendance');
    const snapshot = await getDocs(attendanceCol);
    return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
  },

  saveAttendance: async (record: AttendanceRecord) => {
    const recordRef = doc(db, 'teams', TEAM_ID, 'attendance', record.id);
    await setDoc(recordRef, record);
  },

  getAttendanceForDate: async (date: string): Promise<AttendanceRecord[]> => {
    const list = await FirebaseStorageService.getAttendance();
    return list.filter(r => r.date === date);
  },

  getUserStreak: async (userId: string): Promise<number> => {
    const list = (await FirebaseStorageService.getAttendance()).filter(r => r.userId === userId);
    if (list.length === 0) return 0;

    const sortedDates = [...new Set(list.map(r => r.date))].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

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
  },
};
