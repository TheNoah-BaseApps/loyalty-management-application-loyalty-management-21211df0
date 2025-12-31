'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MembersList() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();
      setMembers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'member_number', label: 'Member Number' },
    { 
      key: 'user_name', 
      label: 'Name',
      render: (row) => row.user_name || 'N/A'
    },
    { 
      key: 'current_tier', 
      label: 'Tier',
      render: (row) => (
        <span className="capitalize font-medium">{row.current_tier || 'Bronze'}</span>
      )
    },
    { key: 'available_points', label: 'Available Points' },
    { key: 'lifetime_points', label: 'Lifetime Points' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { 
      key: 'enrollment_date', 
      label: 'Enrolled',
      render: (row) => formatDate(row.enrollment_date)
    }
  ];

  const actions = (row) => (
    <Button 
      size="sm" 
      variant="ghost"
      onClick={() => router.push(`/members/${row.id}`)}
    >
      <Eye className="w-4 h-4" />
    </Button>
  );

  return (
    <DataTable 
      data={members}
      columns={columns}
      loading={loading}
      error={error}
      searchKey="member_number"
      searchPlaceholder="Search by member number..."
      actions={actions}
    />
  );
}