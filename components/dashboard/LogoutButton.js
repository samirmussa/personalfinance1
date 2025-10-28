// components/dashboard/LogoutButton.js
'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="rounded-xl text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  );
}