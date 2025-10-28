// components/goals/GoalCard.js
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, DollarSign } from 'lucide-react';

export default function GoalCard({ goal }) {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const isOverdue = new Date(goal.deadline) < new Date();

  const icons = {
    saving: <PiggyBank className="h-5 w-5 text-blue-600" />,
    investment: <TrendingUp className="h-5 w-5 text-purple-600" />,
    expense: <DollarSign className="h-5 w-5 text-red-600" />,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icons[goal.type]}
        <h3 className="font-semibold text-lg">{goal.title}</h3>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>R$ {goal.current.toFixed(2)} de R$ {goal.target.toFixed(2)}</span>
        <span className={isOverdue ? 'text-red-600' : ''}>
          até {new Date(goal.deadline).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />
      <p className="text-sm font-medium text-right">{percentage.toFixed(0)}% concluído</p>
    </div>
  );
}