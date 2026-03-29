import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeChart({ data, muscleName }) {
  return (
    <div className="h-full w-full rounded-[2rem] border border-gray-900 bg-surface p-4 shadow-2xl">
      <div className="mb-3">
        <h3 className="text-lg font-black text-white">{muscleName}</h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
          Volume per day (sets × reps)
        </p>
      </div>

      <div className="h-[calc(100%-56px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 2 }}>
            <XAxis
              dataKey="date"
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#121213',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '10px',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
              cursor={{ stroke: '#27272a', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="volume"
              name={muscleName}
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 3, fill: '#121213', stroke: '#38bdf8', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#38bdf8' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
