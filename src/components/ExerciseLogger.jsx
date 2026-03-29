import { CheckCircle2, ChevronDown } from 'lucide-react';

function StepperBtn({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-800 bg-surfaceHighlight text-2xl font-bold text-white transition-all active:scale-90"
    >
      {children}
    </button>
  );
}

export default function ExerciseLogger({
  muscleGroupName,
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
    <div className="rounded-[2rem] border border-gray-900 bg-surface p-4 shadow-2xl">
      <div className="mb-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">
          {muscleGroupName}
        </p>

        <div className="relative">
          <select
            value={selectedExerciseId ?? ''}
            onChange={(event) => onExerciseChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-gray-800 bg-black px-4 py-3 pr-11 text-base font-bold text-white outline-none transition-all"
          >
            {exerciseOptions.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-[1.5rem] border border-gray-900 bg-black px-3 py-2">
          <StepperBtn onClick={() => onSetsChange(Math.max(1, sets - 1))}>-</StepperBtn>
          <div className="text-center">
            <p className="text-3xl font-black text-white leading-none">{sets}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Sets</p>
          </div>
          <StepperBtn onClick={() => onSetsChange(sets + 1)}>+</StepperBtn>
        </div>

        <div className="flex items-center justify-between rounded-[1.5rem] border border-gray-900 bg-black px-3 py-2">
          <StepperBtn onClick={() => onRepsChange(Math.max(1, reps - 1))}>-</StepperBtn>
          <div className="text-center">
            <p className="text-3xl font-black text-white leading-none">{reps}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Reps</p>
          </div>
          <StepperBtn onClick={() => onRepsChange(reps + 1)}>+</StepperBtn>
        </div>
      </div>

      <button
        type="button"
        onClick={isCompleted ? onUndo : onComplete}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
          isCompleted
            ? 'border border-green-900/60 bg-[#051f15] text-green-400'
            : 'bg-accent text-black shadow-[0_0_20px_rgba(56,189,248,0.18)]'
        }`}
      >
        {isCompleted ? (
          <>
            <CheckCircle2 size={18} />
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
          className="mt-2 w-full rounded-2xl border border-gray-800 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400 transition-all active:scale-[0.98]"
        >
          Undo {selectedExercise.name}
        </button>
      )}
    </div>
  );
}
