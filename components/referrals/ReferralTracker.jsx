'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Award } from 'lucide-react';

export default function ReferralTracker() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    converted: 0,
    totalPoints: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const referrals = data.data || [];
        setStats({
          total: referrals.length,
          pending: referrals.filter(r => r.status === 'pending').length,
          converted: referrals.filter(r => r.status === 'converted').length,
          totalPoints: referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0)
        });
      }
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
          <Users className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Converted</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.converted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Points Awarded</CardTitle>
          <Award className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPoints}</div>
        </CardContent>
      </Card>
    </div>
  );
}