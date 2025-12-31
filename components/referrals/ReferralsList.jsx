'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function ReferralsList() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch referrals');

      const data = await response.json();
      setReferrals(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'referral_code', label: 'Referral Code' },
    { 
      key: 'referrer_name', 
      label: 'Referrer',
      render: (row) => row.referrer_name || 'N/A'
    },
    { 
      key: 'referee_name', 
      label: 'Referee',
      render: (row) => row.referee_name || 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    { key: 'points_awarded', label: 'Points Awarded' },
    { 
      key: 'referral_date', 
      label: 'Referral Date',
      render: (row) => formatDate(row.referral_date)
    },
    { 
      key: 'conversion_date', 
      label: 'Conversion Date',
      render: (row) => row.conversion_date ? formatDate(row.conversion_date) : '-'
    }
  ];

  return (
    <DataTable 
      data={referrals}
      columns={columns}
      loading={loading}
      error={error}
      searchKey="referral_code"
      searchPlaceholder="Search by referral code..."
    />
  );
}