
import { Zone, PaceData } from '../types';

const METERS_PER_MILE = 1609.34;
const METERS_PER_KM = 1000;

// --- Helper: Time Parsing/Formatting ---

export const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};

export const secondsToTime = (totalSeconds: number, showCents: boolean = false): string => {
  if (!isFinite(totalSeconds) || isNaN(totalSeconds)) return "N/A";
  
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const cents = Math.round((totalSeconds - Math.floor(totalSeconds)) * 10);

  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  
  if (showCents) {
    return `${mins}:${secsStr}.${cents}`;
  }
  return `${mins}:${secsStr}`;
};

// --- VDOT Logic (Daniels Approximation) ---

export const calculateVDOT = (distanceMeters: number, timeSeconds: number): number => {
  if (timeSeconds <= 0) return 0;
  const timeMinutes = timeSeconds / 60;
  const velocity = distanceMeters / timeMinutes; // meters/min
  const percentVO2Max = 0.8 + 0.189439 * Math.exp(-0.012778 * timeMinutes) + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);
  return vo2 / percentVO2Max;
};

export const calculateTimeFromVDOT = (vdot: number, distanceMeters: number): number => {
  let min_v = 100, max_v = 500, velocity;
  // Binary search for velocity
  for (let i = 0; i < 30; i++) {
    velocity = (min_v + max_v) / 2;
    const timeMinutes = distanceMeters / velocity;
    const percentVO2Max = 0.8 + 0.189439 * Math.exp(-0.012778 * timeMinutes) + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);
    const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);
    if (vo2 / percentVO2Max < vdot) min_v = velocity; else max_v = velocity;
  }
  velocity = (min_v + max_v) / 2;
  return (distanceMeters / velocity) * 60; // returns seconds
};

// --- Zone Logic ---

export const ZONES_CONFIG = {
  // Fractions of vVO2max (5k velocity)
  // Since we deal in pace (sec/meter), dividing by these fractions (which are < 1) increases the time (slower)
  [Zone.RECOVERY]: { slow: 0.63, fast: 0.69 },
  [Zone.FOUNDATION]: { slow: 0.70, fast: 0.80 },
  [Zone.STEADY]: { slow: 0.80, fast: 0.85 },
  [Zone.TEMPO]: { slow: 0.86, fast: 0.90 },
  [Zone.THRESHOLD]: { slow: 0.91, fast: 0.94 },
  [Zone.CV]: { slow: 0.95, fast: 0.97 },
  // Races don't use the multiplier logic, they use VDOT projection directly
  [Zone.RACE_5K]: { dist: 5000 },
  [Zone.RACE_3200]: { dist: 3200 },
  [Zone.RACE_1600]: { dist: 1600 },
  [Zone.RACE_800]: { dist: 800 },
  [Zone.RACE_400]: { dist: 400 },
};

export const getPaces = (fiveKStr: string): PaceData => {
  const fiveKSeconds = timeToSeconds(fiveKStr);
  const vdot = calculateVDOT(5000, fiveKSeconds);
  
  // Base Reference: 5k Pace in sec/meter (vVO2max approximation for this model)
  const vVO2maxPacePerMeter = calculateTimeFromVDOT(vdot, 5000) / 5000;

  const getPaceString = (zone: Zone, returnRange: boolean = false): string => {
      const config = ZONES_CONFIG[zone];
      if ('slow' in config && 'fast' in config) {
        const slowPacePerMeter = vVO2maxPacePerMeter / config.slow;
        const fastPacePerMeter = vVO2maxPacePerMeter / config.fast;
        
        if (returnRange) {
            return `${secondsToTime(fastPacePerMeter * METERS_PER_MILE)} - ${secondsToTime(slowPacePerMeter * METERS_PER_MILE)}`;
        }
        // Average for single values
        const avgFactor = (config.slow + config.fast) / 2;
        return secondsToTime((vVO2maxPacePerMeter / avgFactor) * METERS_PER_MILE);

      } else if ('dist' in config) {
        // Race pace projection
        const timeSec = calculateTimeFromVDOT(vdot, config.dist);
        const pacePerMile = (timeSec / config.dist) * METERS_PER_MILE;
        return secondsToTime(pacePerMile);
      }
      return "0:00";
  };

  return {
    vdot,
    recovery: getPaceString(Zone.RECOVERY, true),
    foundation: getPaceString(Zone.FOUNDATION, true),
    steady: getPaceString(Zone.STEADY),
    tempo: getPaceString(Zone.TEMPO),
    threshold: getPaceString(Zone.THRESHOLD),
    cv: getPaceString(Zone.CV),
    race5k: getPaceString(Zone.RACE_5K),
    race3200: getPaceString(Zone.RACE_3200),
    race1600: getPaceString(Zone.RACE_1600),
    race800: getPaceString(Zone.RACE_800),
    race400: getPaceString(Zone.RACE_400),
  };
};

export const calculateSplit = (distance: number, unit: 'm' | 'km' | 'mi', zone: Zone, vdot: number): string => {
  // Normalize distance to meters
  let distMeters = distance;
  if (unit === 'mi') distMeters = distance * METERS_PER_MILE;
  if (unit === 'km') distMeters = distance * METERS_PER_KM;

  // Base Reference
  const vVO2maxPacePerMeter = calculateTimeFromVDOT(vdot, 5000) / 5000;
  const config = ZONES_CONFIG[zone];

  let targetSeconds = 0;

  if (config && 'slow' in config && 'fast' in config) {
    // It's a training zone
    const avgFactor = (config.slow + config.fast) / 2;
    const pacePerMeter = vVO2maxPacePerMeter / avgFactor;
    targetSeconds = pacePerMeter * distMeters;
  } else if (config && 'dist' in config) {
    // It's a race pace (e.g. 1600m pace for reps)
    const raceTotalSeconds = calculateTimeFromVDOT(vdot, config.dist);
    const racePacePerMeter = raceTotalSeconds / config.dist;
    targetSeconds = racePacePerMeter * distMeters;
  } else {
     // Fallback
     const fallbackConfig = ZONES_CONFIG[Zone.FOUNDATION];
     const avgFactor = (fallbackConfig.slow + fallbackConfig.fast) / 2;
     const pacePerMeter = vVO2maxPacePerMeter / avgFactor;
     targetSeconds = pacePerMeter * distMeters;
  }

  return secondsToTime(targetSeconds, targetSeconds < 180);
};

export const metersToMiles = (meters: number) => meters * 0.000621371;
export const milesToMeters = (miles: number) => miles / 0.000621371;
