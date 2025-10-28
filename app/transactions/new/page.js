// app/transactions/new/page.js
import TransactionForm from '@/components/forms/TransactionForm';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Sparkles, Wallet } from 'lucide-react';

export default async function NewTransactionPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const client = await clientPromise;
  const db = client.db();
  const categories = await db
    .collection('categories')
    .find({ userId: new ObjectId(session.user.id) })
    .toArray();

  // Converter TODOS os ObjectId para string para serialização
  const serializedCategories = categories.map(category => ({
    ...category,
    _id: category._id.toString(),
    userId: category.userId.toString(),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho Moderno */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              asChild 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <a href="/transactions">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Nova Transação
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Adicione uma nova entrada no seu controle financeiro
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total de Categorias</p>
                  <p className="text-2xl font-bold text-gray-900">{serializedCategories.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Dicas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">Selecione o Tipo</h3>
                <p className="text-blue-700 text-xs mt-1">
                  Escolha entre Receita, Despesa, Poupança ou Investimento
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 text-sm">Categorize</h3>
                <p className="text-green-700 text-xs mt-1">
                  Organize por categorias para melhor análise
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 text-sm">Detalhes</h3>
                <p className="text-purple-700 text-xs mt-1">
                  Adicione descrição e data para melhor controle
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário em Card Moderno */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes da Transação
                </h2>
                <p className="text-gray-600 text-sm">
                  Preencha os dados da nova transação
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo do Formulário */}
          <div className="p-6 lg:p-8">
            <TransactionForm categories={serializedCategories} />
          </div>
        </div>

        {/* Ações Rápidas no Mobile */}
        <div className="lg:hidden mt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Categorias Disponíveis</p>
                  <p className="text-lg font-bold text-gray-900">{serializedCategories.length}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <a href="/categories">
                  Gerenciar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}