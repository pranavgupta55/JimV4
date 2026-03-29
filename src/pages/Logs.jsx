import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import VolumeChart from '../components/VolumeChart';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Logs() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muscleGroups, setMuscleGroups] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: logs, error } = await supabase
          .from('workout_logs')
          .select(`
            sets, 
            reps, 
            created_at,
            exercises (
              muscle_groups ( name )
            )
          `)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Data Transformation
        const groupedByDate = {};
        const allMuscles = new Set();

        logs.forEach(log => {
          if (!log.exercises?.muscle_groups?.name) return;
          
          const dateStr = format(parseISO(log.created_at), 'MMM dd');
          const muscle = log.exercises.muscle_groups.name;
          const volume = log.sets * log.reps;

          allMuscles.add(muscle);

          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = { date: dateStr };
          }
          
          // Add to existing volume for that day if multiple exercises hit same muscle
          groupedByDate[dateStr][muscle] = (groupedByDate[dateStr][muscle] || 0) + volume;
        });

        setMuscleGroups(Array.from(allMuscles));
        setChartData(Object.values(groupedByDate));
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  },[]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 flex items-center gap-4 border-b border-gray-900">
        <button onClick={() => navigate('/')} className="p-3 bg-surface rounded-full active:scale-95">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-white tracking-widest">VOLUME LOGS</h1>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 mt-20 animate-pulse">Crunching numbers...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">No workouts logged yet.</div>
        ) : (
          <VolumeChart data={chartData} muscleGroups={muscleGroups} />
        )}
      </div>
    </div>
  );
}