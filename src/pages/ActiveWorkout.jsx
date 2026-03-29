import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import ExerciseLogger from '../components/ExerciseLogger.jsx';
import MuscleGroupTabs from '../components/MuscleGroupTabs.jsx';
import { resolveMuscleImage, sortMuscleGroups } from '../lib/workoutConfig.js';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [workoutId, setWorkoutId] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [groupState, setGroupState] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initWorkout() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: workout, error: workoutError } = await supabase
          .from('workouts')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (workoutError) throw workoutError;
        setWorkoutId(workout.id);

        const { data: groupRows, error: groupError } = await supabase
          .from('muscle_groups')
          .select(`
            id,
            name,
            image_url,
            sort_order,
            exercises (
              id,
              name,
              sort_order,
              is_active
            )
          `)
          .order('sort_order', { ascending: true })
          .order('sort_order', { foreignTable: 'exercises', ascending: true });

        if (groupError) throw groupError;

        const { data: lastLogs, error: lastLogsError } = await supabase
          .from('workout_logs')
          .select('id, exercise_id, sets, reps, created_at')
          .order('created_at', { ascending: false })
          .limit(250);

        if (lastLogsError) throw lastLogsError;

        const latestLogByExercise = (lastLogs ?? []).reduce((accumulator, log) => {
          if (!accumulator[log.exercise_id]) {
            accumulator[log.exercise_id] = log;
          }
          return accumulator;
        }, {});

        const preparedGroups = sortMuscleGroups(
          (groupRows ?? [])
            .map((group) => {
              const orderedExercises = [...(group.exercises ?? [])]
                .filter((exercise) => exercise?.id && exercise?.name)
                .sort((a, b) => {
                  if ((a.sort_order ?? null) !== (b.sort_order ?? null)) {
                    return (a.sort_order ?? 999) - (b.sort_order ?? 999);
                  }
                  return a.name.localeCompare(b.name);
                });

              return {
                id: group.id,
                name: group.name,
                image_url: resolveMuscleImage(group),
                sort_order: group.sort_order,
                exercises: orderedExercises,
              };
            })
            .filter((group) => group.exercises.length > 0)
        );

        const initialState = preparedGroups.reduce((accumulator, group) => {
          const firstExercise = group.exercises[0];

          accumulator[group.id] = {
            selectedExerciseId: firstExercise?.id ?? null,
            exerciseValues: group.exercises.reduce((values, exercise) => {
              const latest = latestLogByExercise[exercise.id];
              values[exercise.id] = {
                sets: latest?.sets ?? 3,
                reps: latest?.reps ?? 10,
                isCompleted: false,
                logId: null,
              };
              return values;
            }, {}),
          };

          return accumulator;
        }, {});

        setMuscleGroups(preparedGroups);
        setGroupState(initialState);
        setActiveGroupId(preparedGroups[0]?.id ?? null);
      } catch (error) {
        console.error('Failed to initialize workout', error);
      } finally {
        setLoading(false);
      }
    }

    initWorkout();
  }, []);

  const activeGroup = useMemo(
    () => muscleGroups.find((group) => group.id === activeGroupId) ?? null,
    [activeGroupId, muscleGroups]
  );

  const activeState = activeGroup ? groupState[activeGroup.id] : null;
  const selectedExerciseId = activeState?.selectedExerciseId ?? activeGroup?.exercises?.[0]?.id ?? null;
  const selectedValues = selectedExerciseId ? activeState?.exerciseValues?.[selectedExerciseId] : null;

  const completedGroupIds = useMemo(
    () =>
      muscleGroups
        .filter((group) =>
          Object.values(groupState[group.id]?.exerciseValues ?? {}).some((entry) => entry?.isCompleted)
        )
        .map((group) => group.id),
    [groupState, muscleGroups]
  );

  const updateExerciseValue = (groupId, exerciseId, nextPatch) => {
    setGroupState((current) => ({
      ...current,
      [groupId]: {
        ...current[groupId],
        exerciseValues: {
          ...current[groupId].exerciseValues,
          [exerciseId]: {
            ...current[groupId].exerciseValues[exerciseId],
            ...nextPatch,
          },
        },
      },
    }));
  };

  const handleComplete = async () => {
    if (!workoutId || !activeGroup || !selectedExerciseId || !selectedValues) return;

    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        workout_id: workoutId,
        exercise_id: selectedExerciseId,
        sets: selectedValues.sets,
        reps: selectedValues.reps,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log exercise', error);
      return;
    }

    updateExerciseValue(activeGroup.id, selectedExerciseId, {
      isCompleted: true,
      logId: data.id,
    });
  };

  const handleUndo = async () => {
    if (!activeGroup || !selectedExerciseId || !selectedValues?.logId) return;

    const { error } = await supabase.from('workout_logs').delete().eq('id', selectedValues.logId);

    if (error) {
      console.error('Failed to undo log', error);
      return;
    }

    updateExerciseValue(activeGroup.id, selectedExerciseId, {
      isCompleted: false,
      logId: null,
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-sm font-bold uppercase tracking-[0.24em] text-gray-500">
        Warming up...
      </div>
    );
  }

  if (!activeGroup || !activeState || !selectedValues) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-gray-400">
        <p className="text-lg font-bold">No muscle groups found.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-2xl border border-gray-800 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em]"
        >
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b border-gray-900 bg-background/95 px-4 py-3 backdrop-blur-lg">
        <div>
          <h1 className="text-lg font-black tracking-[0.18em] text-accent">WORKOUT</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">One muscle group at a time</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full bg-surface p-2 transition-transform active:scale-95"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="min-h-0 overflow-hidden p-3">
        <div className="grid h-full min-h-0 grid-rows-[clamp(92px,21vh,136px)_1fr] gap-2.5">
          <div className="overflow-hidden rounded-[1.8rem] border border-gray-900 bg-surface">
            <img src={activeGroup.image_url} alt={activeGroup.name} className="h-full w-full object-contain p-3" />
          </div>

          <div className="min-h-0">
            <ExerciseLogger
              selectedExerciseId={selectedExerciseId}
              exerciseOptions={activeGroup.exercises}
              sets={selectedValues.sets}
              reps={selectedValues.reps}
              isCompleted={selectedValues.isCompleted}
              onExerciseChange={(exerciseId) => {
                setGroupState((current) => ({
                  ...current,
                  [activeGroup.id]: {
                    ...current[activeGroup.id],
                    selectedExerciseId: exerciseId,
                  },
                }));
              }}
              onSetsChange={(nextSets) => updateExerciseValue(activeGroup.id, selectedExerciseId, { sets: nextSets })}
              onRepsChange={(nextReps) => updateExerciseValue(activeGroup.id, selectedExerciseId, { reps: nextReps })}
              onComplete={handleComplete}
              onUndo={handleUndo}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-900 bg-background px-3 pb-3 pt-2.5">
        <MuscleGroupTabs
          groups={muscleGroups}
          activeGroupId={activeGroup.id}
          completedGroupIds={completedGroupIds}
          onSelect={setActiveGroupId}
        />
      </div>
    </div>
  );
}
