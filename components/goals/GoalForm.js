// components/goals/GoalForm.js
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  title: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(['saving', 'investment', 'expense']),
  deadline: z.string(),
});

export default function GoalForm({ initialData, onSuccess }) {
  const isEdit = !!initialData?._id;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      target: initialData?.target?.toString() || '',
      type: initialData?.type || 'saving',
      deadline: initialData?.deadline || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const url = isEdit ? `/api/goals/${initialData._id}` : '/api/goals';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('Enviando dados da meta:', data);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Status da resposta:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erro da API:', errorText);
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log('Sucesso:', result);

      // Mensagem simples de sucesso
      alert(isEdit ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!');
      
      onSuccess();
    } catch (err) {
      console.error('Erro completo:', err);
      alert(`Erro ao salvar meta: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Título</Label>
        <Input 
          {...register('title')} 
          placeholder="Ex: Fundo de Emergência" 
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">Título é obrigatório</p>}
      </div>

      <div>
        <Label>Meta (R$)</Label>
        <Input 
          {...register('target')} 
          type="number" 
          step="0.01" 
          placeholder="5000" 
        />
        {errors.target && <p className="text-red-500 text-sm mt-1">Valor da meta é obrigatório</p>}
      </div>

      <div>
        <Label>Tipo</Label>
        <Select 
          onValueChange={(v) => setValue('type', v)} 
          defaultValue={initialData?.type || 'saving'}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saving">Poupança</SelectItem>
            <SelectItem value="investment">Investimento</SelectItem>
            <SelectItem value="expense">Reduzir despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Prazo</Label>
        <Input 
          {...register('deadline')} 
          type="date" 
        />
        {errors.deadline && <p className="text-red-500 text-sm mt-1">Prazo é obrigatório</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Meta'}
      </Button>
    </form>
  );
}