import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabaseClient.js';
import VolumeChart from '../components/VolumeChart.jsx';
import MuscleGroupTabs from '../components/MuscleGroupTabs.jsx';
import { sortMuscleGroups } from '../lib/workoutConfig.js';

export default function Logs() {
  const navigate = useNavigate();
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [seriesByGroup, setSeriesByGroup] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

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
            sets,
            reps,
            created_at,
            exercises (
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

        const dailyBuckets = {};

        (logs ?? []).forEach((log) => {
          const muscleGroup = log.exercises?.muscle_groups;
          if (!muscleGroup?.id) return;

          const parsedDate = parseISO(log.created_at);
          const isoDate = format(parsedDate, 'yyyy-MM-dd');
          const labelDate = format(parsedDate, 'MMM dd');
          const bucketKey = `${muscleGroup.id}::${isoDate}`;
          const volume = (log.sets ?? 0) * (log.reps ?? 0);

          if (!dailyBuckets[bucketKey]) {
            dailyBuckets[bucketKey] = {
              groupId: muscleGroup.id,
              date: labelDate,
              sortDate: isoDate,
              volume: 0,
            };
          }

          dailyBuckets[bucketKey].volume += volume;
          grouped[muscleGroup.id] ??= {
            id: muscleGroup.id,
            name: muscleGroup.name,
            points: [],
            totalVolume: 0,
            totalSessions: 0,
          };
          grouped[muscleGroup.id].totalVolume += volume;
          grouped[muscleGroup.id].totalSessions += 1;
        });

        Object.values(dailyBuckets).forEach((entry) => {
          grouped[entry.groupId]?.points.push({
            date: entry.date,
            sortDate: entry.sortDate,
            volume: entry.volume,
          });
        });

        Object.values(grouped).forEach((group) => {
          group.points.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
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

      <div className="min-h-0 overflow-hidden p-4">
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
          <div className="grid h-full grid-rows-[auto_1fr] gap-3">
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
            <div className="min-h-0">
              <VolumeChart
                data={activeSeries.points.map(({ date, volume }) => ({ date, volume }))}
                muscleName={activeSeries.name}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-900 bg-background px-4 pb-4 pt-3">
        <MuscleGroupTabs
          groups={muscleGroups}
          activeGroupId={activeGroupId}
          onSelect={setActiveGroupId}
        />
      </div>
    </div>
  );
}
