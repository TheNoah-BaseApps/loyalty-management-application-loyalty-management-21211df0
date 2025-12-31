'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CostForm from './CostForm';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function CostsList() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editCost, setEditCost] = useState(null);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loyalty-costs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch costs');

      const data = await response.json();
      setCosts(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this cost?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/loyalty-costs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete cost');

      toast.success('Cost deactivated successfully');
      fetchCosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'cost_id', label: 'Cost ID' },
    { key: 'cost_name', label: 'Name' },
    { key: 'product_name', label: 'Product' },
    { key: 'points_required', label: 'Points Required' },
    { 
      key: 'monetary_value', 
      label: 'Value',
      render: (row) => `$${parseFloat(row.monetary_value).toFixed(2)}`
    },
    { key: 'stock_quantity', label: 'Stock' },
    { 
      key: 'cost_status', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.cost_status} />
    },
    { 
      key: 'start_date', 
      label: 'Start Date',
      render: (row) => formatDate(row.start_date)
    }
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => setEditCost(row)}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <>
      <DataTable 
        data={costs}
        columns={columns}
        loading={loading}
        error={error}
        searchKey="cost_name"
        searchPlaceholder="Search by cost name..."
        actions={actions}
      />

      {editCost && (
        <Dialog open={!!editCost} onOpenChange={() => setEditCost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Cost</DialogTitle>
            </DialogHeader>
            <CostForm 
              cost={editCost}
              onSuccess={() => {
                setEditCost(null);
                fetchCosts();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}