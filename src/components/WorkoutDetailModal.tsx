import React from 'react';
import { ScheduledWorkout } from '../types';
import { X, Edit, Copy, Trash2 } from 'lucide-react';

interface WorkoutDetailModalProps {
  workout: ScheduledWorkout;
  onClose: () => void;
  onEdit: (date: string) => void;
  onCopy: () => void;
  onDelete: () => void;
}

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose,
  onEdit,
  onCopy,
  onDelete
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">
                {new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <h2 className="text-2xl font-bold mb-2">{workout.workout.title}</h2>
              <div className="flex flex-wrap gap-2">
                {workout.groups.map((group) => (
                  <span
                    key={group}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {workout.workout.description && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {workout.workout.description}
              </p>
            </div>
          )}

          {/* Daily Message */}
          {workout.dailyMessage && (
            <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900 mb-1">
                    Coach's Message
                  </h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    {workout.dailyMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Workout Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              Workout Breakdown
            </h3>
            <div className="space-y-2">
              {workout.workout.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-bold text-slate-800">
                      {item.reps}x {item.distance}{item.unit}
                    </h4>
                    {item.zone && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">
                        {item.zone}
                      </span>
                    )}
                  </div>
                  {item.recovery && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Recovery: {item.recovery}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 rounded-b-2xl">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={onCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={() => onEdit(workout.date)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailModal;
