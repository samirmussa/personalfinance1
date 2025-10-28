// components/dashboard/GoalsSection.js
'use client';

import GoalCard from '@/components/goals/GoalCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function GoalsSection({ goals }) {
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Metas Ativas</h2>
        <Button asChild variant="outline">
          <a href="/goals">
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </a>
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma meta definida.</p>
          <Button asChild>
            <a href="/goals">Criar minha primeira meta</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal._id}
              goal={goal}
              // Não passe funções aqui! GoalCard só exibe
            />
          ))}
        </div>
      )}
    </div>
  );
}