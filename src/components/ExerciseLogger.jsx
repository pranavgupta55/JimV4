import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { CheckCircle2 } from 'lucide-react';

export default function ExerciseLogger({ exercise, workoutId }) {
  const [sets, setSets] = useState(exercise.defaultSets);
  const[reps, setReps] = useState(exercise.defaultReps);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logId, setLogId] = useState(null);

  const handleComplete = async () => {
    setIsCompleted(true);
    const { data, error } = await supabase.from('workout_logs').insert({
      workout_id: workoutId,
      exercise_id: exercise.id,
      sets: sets,
      reps: reps
    }).select('id').single();
    
    if (!error && data) setLogId(data.id);
  };

  const handleUndo = async () => {
    setIsCompleted(false);
    if (logId) {
      await supabase.from('workout_logs').delete().eq('id', logId);
      setLogId(null);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-[#051f15] border border-green-900/50 rounded-3xl p-5 flex justify-between items-center transition-all shadow-[0_0_20px_rgba(22,163,74,0.05)]">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="text-green-500" size={28} />
          <div>
            <h3 className="text-green-400 font-bold text-lg">{exercise.name}</h3>
            <p className="text-green-600 text-sm font-medium">{sets} sets × {reps} reps</p>
          </div>
        </div>
        <button onClick={handleUndo} className="px-4 py-2 bg-black/40 rounded-xl text-xs text-green-500 font-bold active:scale-95">
          UNDO
        </button>
      </div>
    );
  }

  // Stepper Button Component
  const StepperBtn = ({ onClick, children }) => (
    <button 
      onClick={onClick} 
      className="w-16 h-16 bg-surfaceHighlight border border-gray-800 text-white rounded-2xl text-3xl active:scale-90 active:bg-gray-800 transition-all flex items-center justify-center"
    >
      {children}
    </button>
  );

  return (
    <div className="bg-surface rounded-3xl overflow-hidden shadow-2xl border border-gray-900">
        {/* Header */}
        <div className="p-5 border-b border-gray-900 relative overflow-hidden bg-surface">
        {/* The Image */}
        <div 
            className="absolute right-0 top-0 h-full w-40 opacity-40 bg-right bg-contain bg-no-repeat" 
            style={{ 
            backgroundImage: `url(${exercise.muscle_groups?.image_url})`,
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
            }} 
        />
        <div className="relative z-10">
            <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-1">
            {exercise.muscle_group}
            </p>
            <h2 className="text-2xl text-white font-bold leading-tight">
            {exercise.name}
            </h2>
        </div>
        </div>

      <div className="p-5 space-y-4">
        {/* Sets */}
        <div className="flex items-center justify-between bg-black p-2 rounded-[2rem] border border-gray-900">
          <StepperBtn onClick={() => setSets(s => Math.max(1, s - 1))}>-</StepperBtn>
          <div className="text-center w-20">
            <span className="text-4xl font-black text-white">{sets}</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Sets</p>
          </div>
          <StepperBtn onClick={() => setSets(s => s + 1)}>+</StepperBtn>
        </div>

        {/* Reps */}
        <div className="flex items-center justify-between bg-black p-2 rounded-[2rem] border border-gray-900">
          <StepperBtn onClick={() => setReps(r => Math.max(1, r - 1))}>-</StepperBtn>
          <div className="text-center w-20">
            <span className="text-4xl font-black text-white">{reps}</span>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Reps</p>
          </div>
          <StepperBtn onClick={() => setReps(r => r + 1)}>+</StepperBtn>
        </div>

        <button 
          onClick={handleComplete}
          className="w-full mt-4 py-5 bg-accent hover:bg-sky-400 text-black font-black text-lg rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)]"
        >
          COMPLETE
        </button>
      </div>
    </div>
  );
}