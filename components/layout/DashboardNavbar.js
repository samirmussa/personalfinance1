// components/layout/DashboardNavbar.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Target, 
  Settings, 
  LogOut,
  Menu,
  X,
  Wallet,
  TrendingUp,
  PiggyBank
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/dashboard/LogoutButton';

export default function DashboardNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: TrendingUp, label: 'Transações' },
    { href: '/analysis', icon: BarChart3, label: 'Análises' },
    { href: '/goals', icon: Target, label: 'Metas' },
    { href: '/investments', icon: PiggyBank, label: 'Investimentos' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Navbar Desktop */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Nome */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  FinançasApp
                </h1>
                <p className="text-xs text-gray-500">
                  Olá, {session?.user?.name?.split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`
                      rounded-xl transition-all duration-200
                      ${isActive(item.href) 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <a href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  </Button>
                );
              })}
            </div>

            {/* Lado Direito - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </a>
              </Button>
              <LogoutButton />
            </div>

            {/* Menu Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-xl"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`
                      w-full justify-start rounded-xl transition-all duration-200
                      ${isActive(item.href) 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <a href={item.href} className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  </Button>
                );
              })}
              
              <div className="pt-2 border-t border-gray-200/50 space-y-2">
                <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                  <a href="/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </a>
                </Button>
                <div className="px-3">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Espaço para compensar a navbar fixa */}
      <div className="h-16" />
    </>
  );
}