"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699', '#33CC99', '#FF6666', '#FFB347', '#B6D7A8'
];

type AssigneeEstimate = {
  name: string;
  value: number;
};

export default function DiagramPage() {
  const { data, isLoading, error } = useQuery<AssigneeEstimate[]>({
    queryKey: ['assignee-estimates'],
    queryFn: async () => (await axios.get('/api/jira/assignee-estimates')).data,
  });

  console.log(data);
  let content;
  if (isLoading) {
    content = <div className="animate-pulse h-8 w-1/2 bg-[var(--border)] rounded" />;
  } else if (error) {
    content = <div className="text-red-500">Failed to load data</div>;
  } else if (!data || data.length === 0) {
    content = <div className="text-[var(--subtext)]">No estimate data found</div>;
  } else {
    content = (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry: AssigneeEstimate, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}h`} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-[var(--accent)]">Time Spent by Personnel</h1>
      {content}
    </div>
  );
}
