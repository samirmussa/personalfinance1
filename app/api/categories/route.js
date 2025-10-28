// app/api/categories/route.js
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Não autorizado', { status: 401 });

  const client = await clientPromise;
  const db = client.db();

  const categories = await db
    .collection('categories')
    .find({ userId: new ObjectId(session.user.id) })
    .toArray();

  const serialized = categories.map(c => ({
    _id: c._id.toString(),
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
  }));

  return Response.json(serialized);
}