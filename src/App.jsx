import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

import Home from './pages/Home';
import ActiveWorkout from './pages/ActiveWorkout';
import Logs from './pages/Logs';
import Auth from './pages/Auth';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  },[]);

  if (loading) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background max-w-md mx-auto relative shadow-2xl overflow-hidden">
        <Routes>
          {!session ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/workout" element={<ActiveWorkout />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}