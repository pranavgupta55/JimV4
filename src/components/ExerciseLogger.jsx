import { CheckCircle2, ChevronDown } from 'lucide-react';

function StepperBtn({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-surfaceHighlight text-xl font-bold text-white transition-all active:scale-90"
    >
      {children}
    </button>
  );
}

function MetricStepper({ label, value, onDecrease, onIncrease }) {
  return (
    <div className="rounded-[1.35rem] border border-gray-900 bg-black px-2 py-2.5">
      <div className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <StepperBtn onClick={onDecrease}>-</StepperBtn>
        <p className="min-w-[2ch] text-center text-3xl font-black leading-none text-white">{value}</p>
        <StepperBtn onClick={onIncrease}>+</StepperBtn>
      </div>
    </div>
  );
}

export default function ExerciseLogger({
  selectedExerciseId,
  exerciseOptions,
  sets,
  reps,
  isCompleted,
  onExerciseChange,
  onSetsChange,
  onRepsChange,
  onComplete,
  onUndo,
}) {
  const selectedExercise = exerciseOptions.find((exercise) => exercise.id === selectedExerciseId);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-3 rounded-[2rem] border border-gray-900 bg-surface p-3 shadow-2xl">
      <div className="relative">
        <select
          value={selectedExerciseId ?? ''}
          onChange={(event) => onExerciseChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-gray-800 bg-black px-4 py-3 pr-11 text-sm font-bold text-white outline-none transition-all"
        >
          {exerciseOptions.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricStepper
          label="Sets"
          value={sets}
          onDecrease={() => onSetsChange(Math.max(1, sets - 1))}
          onIncrease={() => onSetsChange(sets + 1)}
        />
        <MetricStepper
          label="Reps"
          value={reps}
          onDecrease={() => onRepsChange(Math.max(1, reps - 1))}
          onIncrease={() => onRepsChange(reps + 1)}
        />
      </div>

      <div className="grid min-h-0 content-end gap-2">
        <button
          type="button"
          onClick={isCompleted ? onUndo : onComplete}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]',
            isCompleted
              ? 'border border-green-900/60 bg-[#051f15] text-green-400'
              : 'bg-accent text-black shadow-[0_0_20px_rgba(56,189,248,0.18)]'
          ].join(' ')}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={16} />
              Logged {sets} × {reps}
            </>
          ) : (
            <>Complete</>
          )}
        </button>

        {isCompleted && selectedExercise && (
          <button
            type="button"
            onClick={onUndo}
            className="w-full rounded-2xl border border-gray-800 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 transition-all active:scale-[0.98]"
          >
            Undo {selectedExercise.name}
          </button>
        )}
      </div>
    </div>
  );
}
