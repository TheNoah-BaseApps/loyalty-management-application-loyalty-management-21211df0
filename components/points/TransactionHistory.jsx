'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';

export default function TransactionHistory({ memberId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memberId) {
      fetchTransactions();
    }
  }, [memberId]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/point-transactions?member_id=${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.transaction_date)}</p>
                  <p className="text-xs text-gray-400">Ref: {transaction.reference_number}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.transaction_type === 'accrual' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'accrual' ? '+' : '-'}{Math.abs(transaction.points)}
                  </p>
                  <p className="text-sm text-gray-500">Balance: {transaction.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}