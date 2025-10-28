// components/forms/TransactionForm.js
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  BarChart3,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.string().min(1, 'Valor obrigatório'),
  type: z.enum(['income', 'expense', 'saving', 'investment']),
  date: z.string(),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
});

export default function TransactionForm({ categories, initialData, onSuccess, onCancel }) {
  const isEdit = !!initialData?._id;
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      description: initialData?.description || '',
      amount: initialData?.amount?.toString() || '',
      type: initialData?.type || 'expense',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      categoryId: initialData?.categoryId || '',
    },
  });

  const type = watch('type');

  // Função para filtrar categorias baseada no tipo
  const getFilteredCategories = () => {
    if (type === 'saving' || type === 'investment') {
      return categories.filter(c => c.type === 'income' || c.type === type);
    }
    return categories.filter(c => c.type === type);
  };

  const onSubmit = async (data) => {
    try {
      const url = isEdit ? `/api/transactions/${initialData._id}` : '/api/transactions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Erro completo:', err);
      alert(`Erro ao salvar transação: ${err.message}`);
    }
  };

  const filteredCategories = getFilteredCategories();

  const transactionTypes = [
    { 
      value: 'income', 
      label: 'Receita', 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      activeBg: 'bg-green-500'
    },
    { 
      value: 'expense', 
      label: 'Despesa', 
      icon: TrendingDown, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      activeBg: 'bg-red-500'
    },
    { 
      value: 'saving', 
      label: 'Poupança', 
      icon: PiggyBank, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      activeBg: 'bg-blue-500'
    },
    { 
      value: 'investment', 
      label: 'Investimento', 
      icon: BarChart3, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500',
      activeBg: 'bg-purple-500'
    },
  ];

  const getTypeConfig = (typeValue) => {
    return transactionTypes.find(t => t.value === typeValue) || transactionTypes[0];
  };

  const currentType = getTypeConfig(type);

  // Componente para renderizar ícones de tipo
  const TypeIcon = ({ typeConfig, isActive }) => {
    const IconComponent = typeConfig.icon;
    return (
      <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : typeConfig.color}`} />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo de Transação - Botões Estilizados */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className={`w-5 h-5 rounded-lg ${currentType.bgColor} flex items-center justify-center`}>
            <TypeIcon typeConfig={currentType} isActive={false} />
          </div>
          <span className="hidden sm:inline">Tipo de Transação *</span>
          <span className="sm:hidden">Tipo *</span>
        </Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {transactionTypes.map((typeConfig) => {
            const isActive = type === typeConfig.value;
            
            return (
              <button
                key={typeConfig.value}
                type="button"
                onClick={() => setValue('type', typeConfig.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200
                  hover:shadow-md hover:scale-105
                  ${isActive 
                    ? `${typeConfig.borderColor} ${typeConfig.bgColor} font-semibold shadow-lg` 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isActive ? typeConfig.activeBg : typeConfig.bgColor}
                  `}>
                    <TypeIcon typeConfig={typeConfig} isActive={isActive} />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {typeConfig.label}
                  </span>
                  {/* Tooltip para mobile */}
                  <div className="sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {typeConfig.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Campos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Descrição */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Descrição *</span>
            <span className="sm:hidden">Descrição *</span>
          </Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="Salário, Aluguel, Supermercado..."
            className={`
              rounded-xl border-2 transition-all duration-200
              ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
              focus:ring-2 focus:ring-blue-200
            `}
          />
          {errors.description && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              ⚠️ {errors.description.message}
            </p>
          )}
        </div>

        {/* Valor */}
        <div className="space-y-3">
          <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Valor (R$) *</span>
            <span className="sm:hidden">Valor *</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount')}
            placeholder="0,00"
            className={`
              rounded-xl border-2 transition-all duration-200
              ${errors.amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
              focus:ring-2 focus:ring-blue-200
            `}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              ⚠️ {errors.amount.message}
            </p>
          )}
        </div>
      </div>

      {/* Grid de Campos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Categoria */}
        <div className="space-y-3">
          <Label htmlFor="category" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <span className="hidden sm:inline">Categoria *</span>
            <span className="sm:hidden">Categoria *</span>
          </Label>
          <Select
            onValueChange={(v) => setValue('categoryId', v)}
            defaultValue={initialData?.categoryId || ''}
          >
            <SelectTrigger className={`
              rounded-xl border-2 transition-all duration-200
              ${errors.categoryId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
              focus:ring-2 focus:ring-blue-200
            `}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {filteredCategories.length === 0 ? (
                <SelectItem value="" disabled>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    Nenhuma categoria disponível
                  </div>
                </SelectItem>
              ) : (
                filteredCategories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              ⚠️ {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Data */}
        <div className="space-y-3">
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Data *</span>
            <span className="sm:hidden">Data *</span>
          </Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            className={`
              rounded-xl border-2 transition-all duration-200
              ${errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
              focus:ring-2 focus:ring-blue-200
            `}
          />
          {errors.date && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              ⚠️ {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || success}
            className="flex-1 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200"
          >
            <span className="hidden sm:inline">Cancelar</span>
            <span className="sm:hidden">✕</span>
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || success}
          className={`
            flex-1 rounded-xl transition-all duration-300 shadow-lg
            ${success 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
            }
            transform hover:scale-105
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline ml-2">
                {isEdit ? 'Atualizando...' : 'Criando...'}
              </span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">
                {isEdit ? 'Atualizado!' : 'Criado!'}
              </span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">
                {isEdit ? 'Atualizar Transação' : 'Criar Transação'}
              </span>
              <span className="sm:hidden">
                {isEdit ? 'Atualizar' : 'Criar'}
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Dica Contextual */}
      {filteredCategories.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <p className="text-amber-800 font-medium text-sm">
                Nenhuma categoria disponível
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {type === 'saving' || type === 'investment' 
                  ? 'Crie categorias de "Receita" para usar com poupança e investimentos'
                  : `Crie categorias de "${type === 'income' ? 'Receita' : 'Despesa'}" para organizar suas transações`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}