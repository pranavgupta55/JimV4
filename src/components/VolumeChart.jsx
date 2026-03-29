import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="max-w-[220px] rounded-2xl border border-gray-800 bg-[#121213] p-3 shadow-2xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{point.dayLabel}</p>
      <p className="mt-1 text-sm font-black text-white">{point.exerciseName}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
        {point.sets} × {point.reps} = {point.volume}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">{point.timeLabel}</p>
    </div>
  );
}

export default function VolumeChart({ data, muscleName, selectedSessionId, onSelectSession }) {
  return (
    <div className="grid h-full w-full grid-rows-[auto_1fr] rounded-[2rem] border border-gray-900 bg-surface p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">{muscleName}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
            Per-session volume with variation labels
          </p>
        </div>
        <div className="rounded-full border border-gray-800 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
          Tap a point to manage it
        </div>
      </div>

      <div className="min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 14, left: -24, bottom: 2 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={['dataMin', 'dataMax']}
              ticks={[...new Set(data.map((point) => point.dayTick))]}
              tickFormatter={(value) => data.find((point) => point.dayTick === value)?.dayLabel ?? ''}
              stroke="#52525b"
              fontSize={10}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey="volume"
              name={muscleName}
              stroke="#38bdf8"
              strokeWidth={3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isSelected = payload.id === selectedSessionId;

                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#38bdf8' : '#121213'}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectSession(payload)}
                  />
                );
              }}
              activeDot={{ r: 6, fill: '#38bdf8' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
