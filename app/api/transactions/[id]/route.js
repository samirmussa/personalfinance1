// app/api/transactions/[id]/route.js
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params: paramsPromise }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const params = await paramsPromise; // AWAIT
  const { id } = params;

  const body = await req.json();
  const { description, amount, type, date, categoryId } = body;

  if (!description || !amount || !type || !date || !categoryId) {
    return new Response('Dados incompletos', { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('transactions').updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
    {
      $set: {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        categoryId: new ObjectId(categoryId),
        updatedAt: new Date(),
      },
    }
  );

  return result.matchedCount > 0
    ? new Response('Atualizado', { status: 200 })
    : new Response('Transação não encontrada', { status: 404 });
}

export async function DELETE(req, { params: paramsPromise }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const params = await paramsPromise;
  const { id } = params;

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('transactions').deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(session.user.id),
  });

  return result.deletedCount > 0
    ? new Response('Excluído', { status: 200 })
    : new Response('Não encontrado', { status: 404 });
}