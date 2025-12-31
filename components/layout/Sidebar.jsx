'use client';

import Link from 'next/link';
import { Home, Users, UserPlus, DollarSign, Settings, Gift, TrendingUp, Megaphone, Share2, Award, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'analyst', 'viewer'] },
  { name: 'Members', href: '/members', icon: Users, roles: ['admin', 'manager', 'analyst', 'viewer'] },
  { name: 'Member Enrollment', href: '/member-enrollment', icon: UserPlus, roles: ['admin', 'manager'] },
  { name: 'Loyalty Costs', href: '/loyalty-costs', icon: DollarSign, roles: ['admin', 'manager'] },
  { name: 'Loyalty Rules', href: '/loyalty-rules', icon: Settings, roles: ['admin', 'manager'] },
  { name: 'Point Transactions', href: '/point-transactions', icon: TrendingUp, roles: ['admin', 'manager', 'analyst', 'viewer'] },
  { name: 'Redemptions', href: '/redemptions', icon: Gift, roles: ['admin', 'manager', 'analyst', 'viewer'] },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone, roles: ['admin', 'manager'] },
  { name: 'Referrals', href: '/referrals', icon: Share2, roles: ['admin', 'manager', 'analyst', 'viewer'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'manager', 'analyst'] },
  { name: 'Tiers', href: '/tiers', icon: Award, roles: ['admin', 'manager'] },
];

export default function Sidebar({ isOpen, currentPath, userRole = 'viewer' }) {
  const filteredNav = navigation.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}