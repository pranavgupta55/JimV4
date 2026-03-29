import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { supabase } from '../lib/supabaseClient.js';
import VolumeChart from '../components/VolumeChart.jsx';
import MuscleGroupTabs from '../components/MuscleGroupTabs.jsx';
import { sortMuscleGroups } from '../lib/workoutConfig.js';

function buildSessionPoints(groupLogs) {
  const dayCounts = groupLogs.reduce((accumulator, log) => {
    accumulator[log.isoDate] = (accumulator[log.isoDate] ?? 0) + 1;
    return accumulator;
  }, {});

  const dayIndexes = {};

  return groupLogs.map((log) => {
    dayIndexes[log.isoDate] = (dayIndexes[log.isoDate] ?? 0) + 1;
    const totalForDay = dayCounts[log.isoDate];
    const indexForDay = dayIndexes[log.isoDate];
    const baseTimestamp = startOfDay(parseISO(log.created_at)).getTime();
    const spreadWindowMs = 12 * 60 * 60 * 1000;
    const offsetMs = totalForDay > 1 ? (spreadWindowMs / (totalForDay + 1)) * indexForDay : spreadWindowMs / 2;

    return {
      id: log.id,
      x: baseTimestamp + offsetMs,
      dayTick: baseTimestamp,
      dayLabel: format(parseISO(log.created_at), 'MMM dd'),
      timeLabel: format(parseISO(log.created_at), 'p'),
      isoDate: log.isoDate,
      exerciseName: log.exerciseName,
      sets: log.sets,
      reps: log.reps,
      volume: log.volume,
      created_at: log.created_at,
    };
  });
}

export default function Logs() {
  const navigate = useNavigate();
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [seriesByGroup, setSeriesByGroup] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: groups, error: groupsError } = await supabase
          .from('muscle_groups')
          .select('id, name, sort_order')
          .order('sort_order', { ascending: true });

        if (groupsError) throw groupsError;

        const orderedGroups = sortMuscleGroups(groups ?? []);

        const { data: logs, error: logsError } = await supabase
          .from('workout_logs')
          .select(`
            id,
            sets,
            reps,
            created_at,
            exercises (
              id,
              name,
              muscle_groups ( id, name )
            )
          `)
          .order('created_at', { ascending: true });

        if (logsError) throw logsError;

        const grouped = orderedGroups.reduce((accumulator, group) => {
          accumulator[group.id] = {
            id: group.id,
            name: group.name,
            points: [],
            totalVolume: 0,
            totalSessions: 0,
          };
          return accumulator;
        }, {});

        const rawLogsByGroup = {};

        (logs ?? []).forEach((log) => {
          const muscleGroup = log.exercises?.muscle_groups;
          if (!muscleGroup?.id) return;

          const volume = (log.sets ?? 0) * (log.reps ?? 0);
          grouped[muscleGroup.id] ??= {
            id: muscleGroup.id,
            name: muscleGroup.name,
            points: [],
            totalVolume: 0,
            totalSessions: 0,
          };

          grouped[muscleGroup.id].totalVolume += volume;
          grouped[muscleGroup.id].totalSessions += 1;

          rawLogsByGroup[muscleGroup.id] ??= [];
          rawLogsByGroup[muscleGroup.id].push({
            id: log.id,
            sets: log.sets ?? 0,
            reps: log.reps ?? 0,
            created_at: log.created_at,
            isoDate: format(parseISO(log.created_at), 'yyyy-MM-dd'),
            exerciseName: log.exercises?.name ?? 'Exercise',
            volume,
          });
        });

        Object.entries(rawLogsByGroup).forEach(([groupId, groupLogs]) => {
          grouped[groupId].points = buildSessionPoints(groupLogs);
        });

        setMuscleGroups(orderedGroups);
        setSeriesByGroup(grouped);
        setActiveGroupId(orderedGroups[0]?.id ?? null);
      } catch (error) {
        console.error('Error fetching logs', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  const activeSeries = useMemo(() => {
    if (!activeGroupId) return null;
    return seriesByGroup[activeGroupId] ?? null;
  }, [activeGroupId, seriesByGroup]);

  const selectedSession = useMemo(() => {
    if (!activeSeries || !selectedSessionId) return null;
    return activeSeries.points.find((point) => point.id === selectedSessionId) ?? null;
  }, [activeSeries, selectedSessionId]);

  const completedGroupIds = useMemo(
    () => muscleGroups.filter((group) => (seriesByGroup[group.id]?.totalSessions ?? 0) > 0).map((group) => group.id),
    [muscleGroups, seriesByGroup]
  );

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    setIsDeleting(true);

    const { error } = await supabase.from('workout_logs').delete().eq('id', selectedSession.id);

    if (error) {
      console.error('Failed to delete session', error);
      setIsDeleting(false);
      return;
    }

    setSeriesByGroup((current) => {
      const currentSeries = current[activeGroupId];
      if (!currentSeries) return current;

      const nextPoints = currentSeries.points.filter((point) => point.id !== selectedSession.id);
      const deletedPoint = currentSeries.points.find((point) => point.id === selectedSession.id);

      return {
        ...current,
        [activeGroupId]: {
          ...currentSeries,
          points: buildSessionPoints(nextPoints.map((point) => ({
            id: point.id,
            sets: point.sets,
            reps: point.reps,
            created_at: point.created_at,
            isoDate: point.isoDate,
            exerciseName: point.exerciseName,
            volume: point.volume,
          }))),
          totalVolume: Math.max(0, currentSeries.totalVolume - (deletedPoint?.volume ?? 0)),
          totalSessions: Math.max(0, currentSeries.totalSessions - 1),
        },
      };
    });

    setSelectedSessionId(null);
    setIsDeleting(false);
  };

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background">
      <div className="flex items-center gap-3 border-b border-gray-900 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full bg-surface p-2 transition-transform active:scale-95"
        >
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-[0.18em] text-white">VOLUME LOGS</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Separate graph per muscle group</p>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden p-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-[0.22em] text-gray-500">
            Crunching numbers...
          </div>
        ) : !activeSeries ? (
          <div className="flex h-full items-center justify-center rounded-[2rem] border border-gray-900 bg-surface text-center text-gray-500">
            No muscle groups found.
          </div>
        ) : activeSeries.points.length === 0 ? (
          <div className="grid h-full grid-rows-[auto_1fr] gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[2rem] border border-gray-900 bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Muscle</p>
                <p className="mt-2 text-xl font-black text-white">{activeSeries.name}</p>
              </div>
              <div className="rounded-[2rem] border border-gray-900 bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Logged Sessions</p>
                <p className="mt-2 text-xl font-black text-white">0</p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-[2rem] border border-gray-900 bg-surface px-6 text-center text-gray-500">
              No workouts logged yet for {activeSeries.name}.
            </div>
          </div>
        ) : (
          <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[2rem] border border-gray-900 bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Total Volume</p>
                <p className="mt-2 text-xl font-black text-white">{activeSeries.totalVolume}</p>
              </div>
              <div className="rounded-[2rem] border border-gray-900 bg-surface p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Entries</p>
                <p className="mt-2 text-xl font-black text-white">{activeSeries.totalSessions}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 rounded-[1.6rem] border border-gray-900 bg-surface px-3 py-2.5">
              <select
                value={selectedSessionId ?? ''}
                onChange={(event) => setSelectedSessionId(event.target.value || null)}
                className="min-w-0 appearance-none rounded-2xl border border-gray-800 bg-black px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white outline-none"
              >
                <option value="">Select session to delete</option>
                {[...activeSeries.points]
                  .sort((a, b) => b.x - a.x)
                  .map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.dayLabel} - {point.exerciseName} - {point.sets}x{point.reps}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                onClick={handleDeleteSession}
                disabled={!selectedSession || isDeleting}
                className="flex items-center justify-center rounded-2xl border border-red-900/70 bg-red-950/30 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-red-300 transition-all disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="min-h-0">
              <VolumeChart
                data={activeSeries.points}
                muscleName={activeSeries.name}
                selectedSessionId={selectedSessionId}
                onSelectSession={(point) => setSelectedSessionId(point.id)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-900 bg-background px-3 pb-3 pt-2.5">
        <MuscleGroupTabs
          groups={muscleGroups}
          activeGroupId={activeGroupId}
          completedGroupIds={completedGroupIds}
          onSelect={(groupId) => {
            setActiveGroupId(groupId);
            setSelectedSessionId(null);
          }}
        />
      </div>
    </div>
  );
}
