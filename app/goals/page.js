// app/goals/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoalForm from '@/components/goals/GoalForm';
import GoalCard from '@/components/goals/GoalCard';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchGoals();
  }, [status, router]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/goals/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteId(null);
      fetchGoals();
    }
  };

  const handleSuccess = () => {
    setEditGoal(null);
    fetchGoals();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <a href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-gray-600">Defina e acompanhe seus objetivos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editGoal ? 'Editar Meta' : 'Nova Meta'}
            </h2>
            <GoalForm initialData={editGoal} onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
                <span className="text-lg">Nenhuma meta definida</span>
                <p className="text-sm mt-2">Crie sua primeira meta ao lado!</p>
              </div>
            ) : (
              goals.map(goal => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onEdit={setEditGoal}
                  onDelete={setDeleteId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Excluir */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir meta?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}