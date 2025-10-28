// lib/seedCategories.js
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

const defaultCategories = [
  { name: 'Salário', type: 'income', color: '#10b981', icon: 'dollar-sign' },
  { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'briefcase' },
  { name: 'Investimentos', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
  { name: 'Outras receitas', type: 'income', color: '#6366f1', icon: 'plus-circle' },
  { name: 'Alimentação', type: 'expense', color: '#f59e0b', icon: 'utensils' },
  { name: 'Transporte', type: 'expense', color: '#ef4444', icon: 'car' },
  { name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
  { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'gamepad-2' },
  { name: 'Saúde', type: 'expense', color: '#14b8a6', icon: 'heart' },
  { name: 'Educação', type: 'expense', color: '#06b6d4', icon: 'book' },
  { name: 'Outras despesas', type: 'expense', color: '#94a3b8', icon: 'tag' },
];

// EXPORT CORRETO: named export
// lib/seedCategories.js
export async function ensureCategories(userId) {
  const client = await clientPromise;
  const db = client.db();
  const userObjectId = new ObjectId(userId);

  const existing = await db.collection('categories').findOne({ userId: userObjectId });
  if (existing) return;

  const defaultCategories = [
    // Receitas
    { name: 'Salário', type: 'income', color: '#10b981', icon: 'dollar-sign' },
    { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'briefcase' },
    { name: 'Investimentos', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
    { name: 'Outras receitas', type: 'income', color: '#6366f1', icon: 'plus-circle' },

    // Despesas
    { name: 'Alimentação', type: 'expense', color: '#f59e0b', icon: 'utensils' },
    { name: 'Transporte', type: 'expense', color: '#ef4444', icon: 'car' },
    { name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: 'home' },
    { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'gamepad-2' },
    { name: 'Saúde', type: 'expense', color: '#14b8a6', icon: 'heart' },
    { name: 'Educação', type: 'expense', color: '#06b6d4', icon: 'book' },
    { name: 'Outras despesas', type: 'expense', color: '#94a3b8', icon: 'tag' },

    // Poupança
    { name: 'Poupança', type: 'saving', color: '#3b82f6', icon: 'piggy-bank' },
    { name: 'Reserva de emergência', type: 'saving', color: '#1d4ed8', icon: 'shield' },

    // Investimentos
    { name: 'Ações', type: 'investment', color: '#8b5cf6', icon: 'trending-up' },
    { name: 'Renda fixa', type: 'investment', color: '#7c3aed', icon: 'bar-chart-3' },
    { name: 'Cripto', type: 'investment', color: '#a855f7', icon: 'bitcoin' },
  ];

  await db.collection('categories').insertMany(
    defaultCategories.map(cat => ({
      ...cat,
      userId: userObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
}