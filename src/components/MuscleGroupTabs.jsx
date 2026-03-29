import { MUSCLE_GROUP_TAB_LABELS } from '../lib/workoutConfig.js';

export default function MuscleGroupTabs({ groups, activeGroupId, completedGroupIds = [], onSelect }) {
  const completedSet = new Set(completedGroupIds);

  return (
    <div className="grid grid-cols-9 gap-1">
      {groups.map((group) => {
        const isActive = group.id === activeGroupId;
        const isCompleted = completedSet.has(group.id);

        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            className={[
              'flex h-16 items-center justify-center rounded-2xl border px-1 text-[9px] font-black uppercase tracking-[0.14em] transition-all active:scale-[0.98]',
              isActive
                ? 'border-accent bg-accent text-black shadow-[0_0_18px_rgba(56,189,248,0.18)]'
                : isCompleted
                  ? 'border-sky-900/70 bg-sky-950/55 text-sky-200'
                  : 'border-gray-800 bg-surface text-gray-500'
            ].join(' ')}
          >
            <span className="[writing-mode:vertical-rl] rotate-180 leading-none">
              {MUSCLE_GROUP_TAB_LABELS[group.name] ?? group.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
