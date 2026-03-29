import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-6">
      <div className="w-full rounded-3xl border border-gray-800 bg-surface p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-accent">CLOCKWORK</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-black p-4 outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-800 bg-black p-4 outline-none focus:border-accent"
          />
          <button
            disabled={loading}
            className="w-full rounded-xl bg-accent p-4 font-black text-black transition-transform active:scale-95"
          >
            {loading ? '...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 w-full text-center text-sm text-gray-500"
        >
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
