import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const[isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
      
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full bg-surface p-8 rounded-3xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-center text-accent">CALI-TRACK</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black border border-gray-800 p-4 rounded-xl outline-none focus:border-accent"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black border border-gray-800 p-4 rounded-xl outline-none focus:border-accent"
          />
          <button disabled={loading} className="w-full bg-accent text-black font-black p-4 rounded-xl active:scale-95 transition-transform">
            {loading ? '...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-6 text-gray-500 text-sm">
          {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
        </button>
      </div>
    </div>
  );
}