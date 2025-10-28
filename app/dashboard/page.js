// app/dashboard/page.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { ensureCategories } from '@/lib/seedCategories';
import CustomPieChart from '@/components/charts/PieChart';
import MonthSelector from '@/components/dashboard/MonthSelector';
import GoalsSection from '@/components/dashboard/GoalsSection';
import LogoutButton from '@/components/dashboard/LogoutButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ChevronRight, 
  List, 
  PiggyBank, 
  BarChart3,
  Wallet,
  Target,
  Sparkles,
  ArrowUpRight,
  Eye
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  await ensureCategories(session.user.id);

  const client = await clientPromise;
  const db = client.db();
  const userId = session.user.id;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return { value, label };
  });

  const selectedMonth = monthOptions[0];
  const [year, month] = selectedMonth.value.split('-').map(Number);

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [transactions, categories, goals] = await Promise.all([
    db.collection('transactions').find({
      userId: new ObjectId(userId),
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 }).toArray(),
    db.collection('categories').find({ userId: new ObjectId(userId) }).toArray(),
    db.collection('goals').find({ userId: new ObjectId(userId) }).toArray(),
  ]);

  // Cálculos atualizados
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const savings = transactions
    .filter(t => t.type === 'saving')
    .reduce((s, t) => s + t.amount, 0);

  const investments = transactions
    .filter(t => t.type === 'investment')
    .reduce((s, t) => s + t.amount, 0);

  // SALDO CORRETO: receitas - (despesas + poupança + investimentos)
  const balance = income - (expenses + savings + investments);

  // Atualizar progresso das metas com os valores calculados
  for (const goal of goals) {
    if (goal.type === 'saving') {
      goal.current = Math.min(savings, goal.target);
    } else if (goal.type === 'investment') {
      goal.current = Math.min(investments, goal.target);
    }
  }

  const categoriesMap = Object.fromEntries(
    categories.map(c => [c._id.toString(), { name: c.name, color: c.color }])
  );

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const catId = t.categoryId.toString();
      const cat = categoriesMap[catId] || { name: 'Outros', color: '#94a3b8' };
      acc[catId] = acc[catId] || { name: cat.name, value: 0, color: cat.color };
      acc[catId].value += t.amount;
      return acc;
    }, {});

  const pieData = Object.values(expensesByCategory);

  const recentTransactions = transactions.slice(0, 5).map(t => ({
    _id: t._id.toString(),
    description: t.description,
    amount: t.amount,
    type: t.type,
    date: t.date.toISOString().split('T')[0],
    category: categoriesMap[t.categoryId.toString()] || { name: 'Sem categoria' },
  }));

  const serializedGoals = goals.map(goal => ({
    _id: goal._id.toString(),
    title: goal.title,
    target: goal.target,
    current: goal.current || 0,
    type: goal.type,
    deadline: goal.deadline,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho Moderno */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Olá, {session.user.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Resumo de {selectedMonth.label}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-3 items-center">
              <MonthSelector monthOptions={monthOptions} selectedMonth={selectedMonth} />

              <div className="flex gap-2">
                <Button asChild variant="outline" className="rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200">
                  <a href="/transactions" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Transações
                  </a>
                </Button>

                <Button asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <a href={`/analysis?year=${year}&month=${String(month).padStart(2, '0')}`} className="flex items-center gap-2">
                    Análise Detalhada
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Botão de Logout */}
            <LogoutButton />
          </div>
        </div>

        {/* Cards de Resumo - Design Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          {/* Saldo do Mês - Card Destaque */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-semibold">
                  Saldo do Mês
                </CardTitle>
                <DollarSign className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-blue-100 text-xs opacity-90 mt-1">
                Receitas - (Despesas + Poupança + Invest.)
              </p>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
                R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
                {balance < 0 && (
                  <span className="text-red-200 text-sm font-normal ml-2">(negativo)</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-3 h-3 rounded-full ${balance >= 0 ? 'bg-green-300' : 'bg-red-300'}`}></div>
                <span className="text-blue-100 text-sm">
                  {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Receitas */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-700 text-sm font-semibold">Receitas</CardTitle>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {income.toFixed(2).replace('.', ',')}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 text-xs font-medium">Entradas</span>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-700 text-sm font-semibold">Despesas</CardTitle>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {expenses.toFixed(2).replace('.', ',')}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600 text-xs font-medium">Saídas</span>
              </div>
            </CardContent>
          </Card>

          {/* Poupança */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-700 text-sm font-semibold">Poupança</CardTitle>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {savings.toFixed(2).replace('.', ',')}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 text-xs font-medium">Reserva</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda Linha de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Investimentos */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm font-semibold">Investimentos</CardTitle>
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {investments.toFixed(2).replace('.', ',')}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                <span className="text-purple-100 text-xs font-medium">Crescimento</span>
              </div>
            </CardContent>
          </Card>

          {/* Total de Transações */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-700 text-sm font-semibold">Transações</CardTitle>
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <List className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {transactions.length}
              </div>
              <p className="text-gray-600 text-xs mt-2">
                {transactions.filter(t => t.type === 'income').length} entradas •{' '}
                {transactions.filter(t => t.type === 'expense').length} saídas
              </p>
            </CardContent>
          </Card>

          {/* Metas em Andamento */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-700 text-sm font-semibold">Metas Ativas</CardTitle>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {goals.length}
              </div>
              <p className="text-gray-600 text-xs mt-2">
                {goals.filter(g => g.current >= g.target).length} concluídas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Transações */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Gráfico de Despesas */}
          <Card className="xl:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Distribuição de Despesas
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-lg text-gray-600 hover:text-gray-900">
                <a href="/analysis">
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">Nenhuma despesa este mês</p>
                  <p className="text-gray-400 text-sm">
                    Suas despesas aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="h-80">
                  <CustomPieChart data={pieData} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimas Transações */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Últimas Transações
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-lg text-blue-600 hover:text-blue-700">
                <a href="/transactions" className="text-sm font-medium">
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <List className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Nenhuma transação</p>
                    <Button asChild variant="outline" size="sm" className="rounded-lg">
                      <a href="/transactions/new" className="text-sm">
                        Adicionar Transação
                      </a>
                    </Button>
                  </div>
                ) : (
                  recentTransactions.map(t => (
                    <div 
                      key={t._id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-100 hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{t.description}</p>
                          <p className="text-gray-500 text-xs">
                            {t.category.name} • {new Date(t.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas - Client Component */}
        <GoalsSection goals={serializedGoals} />

        {/* Botão Flutuante Moderno */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <Button 
            asChild 
            size="lg" 
            className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <a href="/transactions/new" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Nova Transação</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}