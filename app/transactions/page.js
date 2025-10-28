// app/transactions/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/forms/TransactionForm';
import TransactionFilters from '@/components/filters/TransactionFilters';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Edit, 
  Plus, 
  Loader2, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  BarChart3,
  Filter,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterParams, setFilterParams] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetchCategories();
      fetchTransactions();
    }
  }, [status, router, filterParams]);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const cats = await res.json();
    setCategories(cats);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = filterParams ? `/api/transactions?${filterParams}` : '/api/transactions';
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditTransaction({
      _id: t._id,
      description: t.description,
      amount: t.amount.toString(),
      type: t.type,
      date: t.date,
      categoryId: t.categoryId,
    });
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/transactions/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteId(null);
      fetchTransactions();
    }
  };

  const handleSuccess = () => {
    setEditTransaction(null);
    fetchTransactions();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'saving': return <PiggyBank className="h-4 w-4 text-blue-600" />;
      case 'investment': return <BarChart3 className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'income': return 'from-green-500 to-emerald-600';
      case 'expense': return 'from-red-500 to-rose-600';
      case 'saving': return 'from-blue-500 to-cyan-600';
      case 'investment': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'income': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Receita</Badge>;
      case 'expense': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Despesa</Badge>;
      case 'saving': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Poupança</Badge>;
      case 'investment': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Investimento</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Outro</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    income: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    saving: filteredTransactions.filter(t => t.type === 'saving').reduce((sum, t) => sum + t.amount, 0),
    investment: filteredTransactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0),
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho Moderno */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="hover:bg-white/50 rounded-xl">
              <a href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Transações
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Gerencie suas receitas e despesas
              </p>
            </div>
          </div>

          <Button asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <a href="/transactions/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Transação
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Receitas</p>
                <p className="text-2xl font-bold">R$ {stats.income.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Despesas</p>
                <p className="text-2xl font-bold">R$ {stats.expense.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Poupança</p>
                <p className="text-2xl font-bold">R$ {stats.saving.toFixed(2)}</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Investimentos</p>
                <p className="text-2xl font-bold">R$ {stats.investment.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-200 rounded-xl bg-white/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-xl border-gray-200"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {filterParams && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2 rounded-xl border-gray-200">
                <Calendar className="h-4 w-4" />
                Período
              </Button>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <TransactionFilters onFilter={setFilterParams} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Formulário */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${editTransaction ? 'from-orange-500 to-amber-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center`}>
                  {editTransaction ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {editTransaction ? 'Editar Transação' : 'Nova Transação'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {editTransaction ? 'Atualize os dados' : 'Adicione uma nova transação'}
                  </p>
                </div>
              </div>
              <TransactionForm
                categories={categories}
                initialData={editTransaction}
                onSuccess={handleSuccess}
                onCancel={() => setEditTransaction(null)}
              />
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-xl">
                      {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 's' : ''}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {searchTerm ? `Filtrado por: "${searchTerm}"` : 'Todas as transações'}
                    </p>
                  </div>
                  {filteredTransactions.length > 0 && (
                    <Badge variant="outline" className="text-gray-600">
                      Total: R$ {filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg mb-2">
                      {searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Comece adicionando sua primeira transação'}
                    </p>
                    <Button asChild className="rounded-xl">
                      <a href="/transactions/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Transação
                      </a>
                    </Button>
                  </div>
                ) : (
                  filteredTransactions.map((t) => (
                    <div 
                      key={t._id} 
                      className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTransactionColor(t.type)} flex items-center justify-center shadow-lg`}>
                          {getTransactionIcon(t.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900 text-lg truncate">
                              {t.description}
                            </p>
                            {getTransactionBadge(t.type)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full shadow-sm" 
                                style={{ backgroundColor: t.category.color }} 
                              />
                              <span>{t.category.name}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className={`font-bold text-xl ${
                          t.type === 'income' || t.type === 'saving' || t.type === 'investment' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {t.type === 'income' || t.type === 'saving' || t.type === 'investment' ? '+' : '-'} 
                          R$ {t.amount.toFixed(2)}
                        </span>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEdit(t)}
                            className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setDeleteId(t._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-xl">Excluir transação?</DialogTitle>
              <DialogDescription className="text-center text-base text-gray-600">
                Esta ação não pode ser desfeita. A transação será permanentemente removida do seu histórico.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setDeleteId(null)} 
                className="flex-1 rounded-xl border-gray-300"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}