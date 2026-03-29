import { Link } from 'react-router-dom';
import { Activity, BarChart2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 pb-8">
      <div className="flex-1 flex flex-col justify-end">
        <Link 
          to="/workout" 
          className="bg-accent text-black rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 active:scale-95 transition-transform shadow-[0_0_40px_rgba(56,189,248,0.15)]"
          style={{ minHeight: '60vh' }}
        >
          <Activity size={64} strokeWidth={1.5} />
          <span className="text-4xl font-black tracking-tight">START</span>
        </Link>
      </div>
      
      <div className="h-1/4">
        <Link 
          to="/logs" 
          className="bg-surface border border-gray-800 text-white rounded-[2rem] h-full p-8 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <BarChart2 size={32} className="text-gray-400" />
          <span className="text-xl font-bold text-gray-400">SEE LOGS</span>
        </Link>
      </div>
    </div>
  );
}