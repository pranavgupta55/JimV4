import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient.js';

import Home from './pages/Home';
import ActiveWorkout from './pages/ActiveWorkout.jsx';
import Logs from './pages/Logs.jsx';
import Auth from './pages/Auth.jsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-[100dvh] items-center justify-center bg-background text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="mx-auto h-[100dvh] max-h-[100dvh] max-w-md overflow-hidden bg-background shadow-2xl">
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
