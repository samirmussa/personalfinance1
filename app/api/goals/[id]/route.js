// app/api/goals/[id]/route.js
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params: paramsPromise }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const params = await paramsPromise;
  const { id } = params;
  const body = await req.json();
  const { title, target, type, deadline } = body;

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('goals').updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
    {
      $set: {
        title,
        target: parseFloat(target),
        type,
        deadline,
        updatedAt: new Date(),
      },
    }
  );

  return result.matchedCount > 0
    ? new Response('OK', { status: 200 })
    : new Response('Não encontrado', { status: 404 });
}

export async function DELETE(req, { params: paramsPromise }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const params = await paramsPromise;
  const { id } = params;

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('goals').deleteOne({
    _id: new ObjectId(id),
    userId: new ObjectId(session.user.id),
  });

  return result.deletedCount > 0
    ? new Response('OK', { status: 200 })
    : new Response('Não encontrado', { status: 404 });
}