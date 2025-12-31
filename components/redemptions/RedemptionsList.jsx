'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function RedemptionsList() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/redemptions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch redemptions');

      const data = await response.json();
      setRedemptions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'member_number', 
      label: 'Member',
      render: (row) => row.member_number || 'N/A'
    },
    { 
      key: 'cost_name', 
      label: 'Reward',
      render: (row) => row.cost_name || 'N/A'
    },
    { key: 'points_redeemed', label: 'Points' },
    { 
      key: 'monetary_value', 
      label: 'Value',
      render: (row) => `$${parseFloat(row.monetary_value).toFixed(2)}`
    },
    { 
      key: 'channel', 
      label: 'Channel',
      render: (row) => <span className="capitalize">{row.channel}</span>
    },
    { 
      key: 'fulfillment_status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.fulfillment_status} />
    },
    { 
      key: 'redemption_date', 
      label: 'Date',
      render: (row) => formatDate(row.redemption_date)
    }
  ];

  return (
    <DataTable 
      data={redemptions}
      columns={columns}
      loading={loading}
      error={error}
      searchKey="member_number"
      searchPlaceholder="Search by member number..."
    />
  );
}