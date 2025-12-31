'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PointTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ totalAccruals: 0, totalRedemptions: 0, netPoints: 0 });

  const [formData, setFormData] = useState({
    member_id: '',
    transaction_type: 'accrual',
    points: '',
    description: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchMembers();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/point-transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.data || []);
      calculateStats(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const calculateStats = (data) => {
    const accruals = data.filter(t => t.transaction_type === 'accrual').reduce((sum, t) => sum + t.points, 0);
    const redemptions = data.filter(t => t.transaction_type === 'redemption').reduce((sum, t) => sum + Math.abs(t.points), 0);
    setStats({
      totalAccruals: accruals,
      totalRedemptions: redemptions,
      netPoints: accruals - redemptions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/point-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          points: parseInt(formData.points)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create transaction');
      }

      toast.success('Transaction created successfully');
      setShowModal(false);
      setFormData({ member_id: '', transaction_type: 'accrual', points: '', description: '' });
      fetchTransactions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { 
      key: 'member_number', 
      label: 'Member',
      render: (row) => row.member_number || 'N/A'
    },
    { 
      key: 'transaction_type', 
      label: 'Type',
      render: (row) => (
        <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
          row.transaction_type === 'accrual' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.transaction_type}
        </span>
      )
    },
    { 
      key: 'points', 
      label: 'Points',
      render: (row) => (
        <span className={row.transaction_type === 'accrual' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {row.transaction_type === 'accrual' ? '+' : '-'}{Math.abs(row.points)}
        </span>
      )
    },
    { key: 'balance_after', label: 'Balance After' },
    { key: 'description', label: 'Description' },
    { 
      key: 'transaction_date', 
      label: 'Date',
      render: (row) => formatDate(row.transaction_date)
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point Transactions</h1>
          <p className="text-gray-600">Track all point accruals and redemptions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Accruals</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.totalAccruals.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Redemptions</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.totalRedemptions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Points</CardTitle>
            <Activity className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.netPoints.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable 
        data={transactions}
        columns={columns}
        loading={loading}
        searchKey="reference_number"
        searchPlaceholder="Search by reference number..."
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Point Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Select
                value={formData.member_id}
                onValueChange={(value) => setFormData({ ...formData, member_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.member_number} - {member.user_name || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accrual">Accrual</SelectItem>
                  <SelectItem value="redemption">Redemption</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="reversal">Reversal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Manual adjustment for customer service"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Create Transaction</Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}