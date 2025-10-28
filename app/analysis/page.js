// app/analysis/page.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import CustomPieChart from '@/components/charts/PieChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';

export default async function AnalysisPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) : new Date().getMonth() + 1;

  const client = await clientPromise;
  const db = client.db();

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [transactions, categories] = await Promise.all([
    db.collection('transactions').find({
      userId: new ObjectId(session.user.id),
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 }).toArray(),
    db.collection('categories').find({ userId: new ObjectId(session.user.id) }).toArray(),
  ]);

  const categoriesMap = Object.fromEntries(
    categories.map(c => [c._id.toString(), { name: c.name, color: c.color }])
  );

  // Cálculos corretos
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = transactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const investments = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);

  // SALDO CORRETO: receitas - (despesas + poupança + investimentos)
  const balance = income - (expenses + savings + investments);

  // Gráfico de despesas
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

  const monthLabel = startOfMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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
          <h1 className="text-3xl font-bold">Análise de {monthLabel}</h1>
          <p className="text-gray-600">Detalhes financeiros do período</p>
        </div>
      </div>

      {/* Cards de Resumo - 5 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {/* Saldo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo do Mês
              <p className="text-xs text-gray-500 font-normal">Receitas - (Despesas + Poupança + Invest.)</p>
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        {/* Receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {income.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {expenses.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        {/* Poupança */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alocado em Poupança</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {savings.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        {/* Investimentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alocado em Investimentos</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {investments.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma despesa neste período.</p>
            ) : (
              <CustomPieChart data={pieData} />
            )}
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma transação.</p>
              ) : (
                transactions.map(t => {
                  const cat = categoriesMap[t.categoryId.toString()] || {};
                  const isIncome = t.type === 'income';
                  const isExpense = t.type === 'expense';
                  const isSaving = t.type === 'saving';
                  const isInvestment = t.type === 'investment';

                  return (
                    <div key={t._id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{t.description}</p>
                        <p className="text-gray-500">
                          {cat.name || 'Sem categoria'} • {new Date(t.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={
                        isIncome ? 'text-green-600' :
                        isExpense ? 'text-red-600' :
                        isSaving ? 'text-blue-600' :
                        'text-purple-600'
                      }>
                        {isIncome || isSaving || isInvestment ? '+' : '-'} 
                        R$ {t.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}