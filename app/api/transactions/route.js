// app/api/transactions/route.js
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response('Não autorizado', { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    let filter = { userId: new ObjectId(userId) };

    if (type) filter.type = type;
    if (category) filter.categoryId = new ObjectId(category);
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await db
      .collection('transactions')
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    // Buscar categorias para exibir nome
    const categoryIds = [...new Set(transactions.map(t => t.categoryId.toString()))];
    const categories = categoryIds.length > 0
      ? await db.collection('categories').find({ _id: { $in: categoryIds.map(id => new ObjectId(id)) } }).toArray()
      : [];

    const categoriesMap = Object.fromEntries(
      categories.map(c => [c._id.toString(), { 
        name: c.name, 
        color: c.color || '#94a3b8' 
      }])
    );

    // SERIALIZAÇÃO CORRETA
    const serialized = transactions.map(t => ({
      _id: t._id.toString(),
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date.toISOString().split('T')[0], // yyyy-mm-dd
      categoryId: t.categoryId.toString(),
      category: categoriesMap[t.categoryId.toString()] || { name: 'Sem categoria', color: '#94a3b8' },
      userId: t.userId.toString(),
      createdAt: t.createdAt?.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
    }));

    return new Response(JSON.stringify(serialized), { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return new Response('Erro ao buscar transações', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response('Não autorizado', { status: 401 });

    const body = await req.json();
    const { description, amount, type, date, categoryId } = body;

    if (!description || !amount || !type || !date || !categoryId) {
      return new Response('Todos os campos são obrigatórios', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = session.user.id;

    const result = await db.collection('transactions').insertOne({
      description,
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      categoryId: new ObjectId(categoryId),
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ _id: result.insertedId.toString() }), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return new Response('Erro ao criar transação', { status: 500 });
  }
}