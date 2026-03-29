import { Link } from 'react-router-dom';
import { Activity, BarChart2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-3 p-4 pb-4 overflow-hidden">
      <Link
        to="/workout"
        className="flex min-h-0 flex-col items-center justify-center gap-3 rounded-[2rem] bg-accent px-6 py-8 text-black shadow-[0_0_40px_rgba(56,189,248,0.15)] transition-transform active:scale-[0.98]"
      >
        <Activity size={56} strokeWidth={1.5} />
        <span className="text-4xl font-black tracking-tight">START</span>
      </Link>

      <Link
        to="/logs"
        className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[2rem] border border-gray-800 bg-surface px-6 py-5 text-white transition-transform active:scale-[0.98]"
      >
        <BarChart2 size={28} className="text-gray-400" />
        <span className="text-lg font-bold tracking-wide text-gray-400">SEE LOGS</span>
      </Link>
    </div>
  );
}
