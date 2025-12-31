'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, Gift, TrendingUp, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardWidgets() {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [membersRes, transactionsRes, redemptionsRes] = await Promise.all([
        fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/point-transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/redemptions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [membersData, transactionsData, redemptionsData] = await Promise.all([
        membersRes.ok ? membersRes.json() : { data: [] },
        transactionsRes.ok ? transactionsRes.json() : { data: [] },
        redemptionsRes.ok ? redemptionsRes.json() : { data: [] }
      ]);

      const members = membersData.data || [];
      const transactions = transactionsData.data || [];
      const redemptions = redemptionsData.data || [];

      const activeMembers = members.filter(m => m.status === 'active').length;
      const totalPoints = members.reduce((sum, m) => sum + (m.available_points || 0), 0);
      const redemptionRate = members.length > 0 
        ? (redemptions.length / members.length * 100).toFixed(1)
        : 0;
      const programCost = redemptions.reduce((sum, r) => sum + parseFloat(r.monetary_value || 0), 0);

      setStats({
        activeMembers,
        totalPoints,
        redemptionRate,
        programCost,
        totalRedemptions: redemptions.length
      });

      setRecentTransactions(transactions.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeMembers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total enrolled members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Points</CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPoints?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Points in circulation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Redemption Rate</CardTitle>
            <Gift className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.redemptionRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">{stats?.totalRedemptions || 0} total redemptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Program Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.programCost?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total redemption value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No recent transactions</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                    <p className="text-sm text-gray-500">Ref: {transaction.reference_number}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.transaction_type === 'accrual' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'accrual' ? '+' : '-'}{Math.abs(transaction.points)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}