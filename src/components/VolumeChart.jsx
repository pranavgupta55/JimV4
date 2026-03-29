import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Distinct, vibrant colors that look good on black
const COLORS =[
  '#38bdf8', // Sky blue (Chest)
  '#f43f5e', // Rose (Back)
  '#a3e635', // Lime (Legs)
  '#c084fc', // Light purple
  '#fbbf24', // Amber
  '#fb923c', // Orange
  '#2dd4bf', // Teal
  '#818cf8', // Cyan
  '#f472b6', // Pink
];

export default function VolumeChart({ data, muscleGroups }) {
  return (
    <div className="w-full bg-surface rounded-3xl p-5 border border-gray-900 shadow-2xl">
      <div className="mb-8">
        <h3 className="text-white font-bold text-xl mb-1">Progression</h3>
        <p className="text-gray-500 text-xs tracking-widest uppercase">Total Reps (Sets × Reps)</p>
      </div>
      
      <div className="h-[400px] w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              stroke="#52525b" 
              fontSize={10} 
              tickMargin={15} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => value} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121213', 
                border: '1px solid #27272a', 
                borderRadius: '12px',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
              cursor={{ stroke: '#27272a', strokeWidth: 2 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
              iconType="circle"
            />
            
            {muscleGroups.map((muscle, index) => (
              <Line 
                key={muscle}
                type="monotone" 
                dataKey={muscle} 
                name={muscle}
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#121213', strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
                connectNulls={true} // Crucial! Connects the line even if you skip a muscle group on a specific day
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}