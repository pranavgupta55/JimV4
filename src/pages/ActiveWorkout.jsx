import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import ExerciseLogger from '../components/ExerciseLogger.jsx';
import { X } from 'lucide-react';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [workoutId, setWorkoutId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initWorkout() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Create Workout Session
        const { data: workout, error: wError } = await supabase
          .from('workouts')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (wError) throw wError;
        setWorkoutId(workout.id);

        // 2. Fetch Active Exercises with their Muscle Group info
        const { data: activeExercises, error: eError } = await supabase
          .from('exercises')
          .select('id, name, muscle_groups(id, name, sort_order)')
          .eq('is_active', true)
          .order('sort_order', { referencedTable: 'muscle_groups' });
        if (eError) throw eError;

        // 3. Fetch latest logs to pre-fill sets/reps
        const { data: lastLogs } = await supabase
          .from('workout_logs')
          .select('exercise_id, sets, reps')
          .order('created_at', { ascending: false })
          .limit(50); // Generous limit to catch recent history

        // 4. Merge data
        const merged = activeExercises.map(ex => {
        const pastLog = lastLogs?.find(l => l.exercise_id === ex.id);
        return {
          id: ex.id,
          name: ex.name,
          muscle_group: ex.muscle_groups.name,
          image_url: ex.muscle_groups.image_url, // Add this line
          defaultSets: pastLog?.sets || 3,
          defaultReps: pastLog?.reps || 10
        };
      });

        setExercises(merged);
      } catch (err) {
        console.error("Failed to init workout:", err);
      } finally {
        setLoading(false);
      }
    }
    initWorkout();
  },[]);

  if (loading) return <div className="p-8 mt-20 text-center text-gray-500 animate-pulse">Warming up...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-gray-900 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-accent">WORKOUT</h1>
          <p className="text-xs text-gray-500">Log your volume</p>
        </div>
        <button onClick={() => navigate('/')} className="p-2 bg-surface rounded-full active:scale-95">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-6">
        {exercises.map(ex => (
          <ExerciseLogger 
            key={ex.id} 
            exercise={ex} 
            workoutId={workoutId} 
          />
        ))}
      </div>
      
      {/* Finish Button */}
      <div className="px-4">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-6 rounded-2xl border-2 border-gray-800 text-gray-400 font-bold tracking-widest active:scale-95 transition-all mt-4 hover:border-accent hover:text-accent"
        >
          END WORKOUT
        </button>
      </div>
    </div>
  );
}