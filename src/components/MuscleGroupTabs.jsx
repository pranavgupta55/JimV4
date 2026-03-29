import { MUSCLE_GROUP_SHORT_LABELS } from '../lib/workoutConfig.js';

export default function MuscleGroupTabs({ groups, activeGroupId, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {groups.map((group) => {
        const isActive = group.id === activeGroupId;

        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            className={`rounded-2xl border px-2 py-3 text-[11px] font-black uppercase tracking-wide transition-all ${
              isActive
                ? 'border-accent bg-accent text-black shadow-[0_0_18px_rgba(56,189,248,0.18)]'
                : 'border-gray-800 bg-surface text-gray-400 active:scale-[0.98]'
            }`}
          >
            {MUSCLE_GROUP_SHORT_LABELS[group.name] ?? group.name}
          </button>
        );
      })}
    </div>
  );
}
