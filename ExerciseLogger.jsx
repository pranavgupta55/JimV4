import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ExerciseLogger({ exercise, prevSets = 3, prevReps = 10, image }) {
  const[sets, setSets] = useState(prevSets);
  const [reps, setReps] = useState(prevReps);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = async () => {
    // Optimistic UI update
    setIsCompleted(true);
    
    // Save to Supabase
    await supabase.from('workout_logs').insert({
      exercise_id: exercise.id,
      sets: sets,
      reps: reps
    });
  };

  if (isCompleted) {
    return (
      <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-4 flex justify-between items-center transition-all">
        <div>
          <h3 className="text-green-400 font-bold">{exercise.name}</h3>
          <p className="text-green-500/80 text-sm">{sets} sets × {reps} reps</p>
        </div>
        <button 
          onClick={() => setIsCompleted(false)}
          className="text-xs text-gray-400 underline p-2"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1c] border border-gray-800 rounded-2xl overflow-hidden mb-6 shadow-xl">
      {/* Header with Muscle Image */}
      <div className="h-20 bg-[#121213] relative flex items-center px-4 border-b border-gray-800">
        {/* Assumes you cut the images into nice wide banners */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-50 bg-right bg-contain bg-no-repeat" style={{ backgroundImage: `url(${image})` }} />
        <div className="z-10">
          <p className="text-xs text-sky-400 font-bold uppercase tracking-widest">{exercise.muscle_group}</p>
          <h2 className="text-xl text-white font-bold">{exercise.name}</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sets Stepper */}
        <div className="flex items-center justify-between bg-black rounded-xl p-2">
          <button onClick={() => setSets(s => Math.max(1, s - 1))} className="w-16 h-16 bg-gray-800 text-white rounded-lg text-3xl active:scale-95 flex items-center justify-center transition-transform">-</button>
          <div className="text-center">
            <span className="text-3xl font-black text-white">{sets}</span>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Sets</p>
          </div>
          <button onClick={() => setSets(s => s + 1)} className="w-16 h-16 bg-gray-800 text-white rounded-lg text-3xl active:scale-95 flex items-center justify-center transition-transform">+</button>
        </div>

        {/* Reps Stepper */}
        <div className="flex items-center justify-between bg-black rounded-xl p-2">
          <button onClick={() => setReps(r => Math.max(1, r - 1))} className="w-16 h-16 bg-gray-800 text-white rounded-lg text-3xl active:scale-95 flex items-center justify-center transition-transform">-</button>
          <div className="text-center">
            <span className="text-3xl font-black text-white">{reps}</span>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Reps</p>
          </div>
          <button onClick={() => setReps(r => r + 1)} className="w-16 h-16 bg-gray-800 text-white rounded-lg text-3xl active:scale-95 flex items-center justify-center transition-transform">+</button>
        </div>

        {/* Complete Button */}
        <button 
          onClick={handleComplete}
          className="w-full mt-2 py-5 bg-sky-500 hover:bg-sky-400 text-black font-black text-lg rounded-xl active:scale-95 transition-transform"
        >
          LOG EXERCISE
        </button>
      </div>
    </div>
  );
}