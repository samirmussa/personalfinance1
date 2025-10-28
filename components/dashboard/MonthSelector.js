// components/dashboard/MonthSelector.js
'use client';

import { useRouter } from 'next/navigation';

export default function MonthSelector({ monthOptions, selectedMonth }) {
  const router = useRouter();

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    router.push(`/analysis?year=${year}&month=${month}`);
  };

  return (
    <select
      className="px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      defaultValue={selectedMonth.value}
      onChange={handleMonthChange}
    >
      {monthOptions.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}