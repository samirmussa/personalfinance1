// app/api/goals/route.js
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const client = await clientPromise;
  const db = client.db();

  const goals = await db
    .collection('goals')
    .find({ userId: new ObjectId(session.user.id) })
    .sort({ deadline: 1 })
    .toArray();

  const serialized = goals.map(g => ({
    _id: g._id.toString(),
    title: g.title,
    target: g.target,
    current: g.current,
    type: g.type,
    deadline: g.deadline,
  }));

  return Response.json(serialized);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const body = await req.json();
  const { title, target, type, deadline } = body;

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('goals').insertOne({
    userId: new ObjectId(session.user.id),
    title,
    target: parseFloat(target),
    current: 0,
    type,
    deadline,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return Response.json({ _id: result.insertedId }, { status: 201 });
}