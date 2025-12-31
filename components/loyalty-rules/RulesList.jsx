'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RuleForm from './RuleForm';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export default function RulesList() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editRule, setEditRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loyalty-rules', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch rules');

      const data = await response.json();
      setRules(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this rule?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/loyalty-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete rule');

      toast.success('Rule deactivated successfully');
      fetchRules();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'rule_id', label: 'Rule ID' },
    { key: 'rule_name', label: 'Name' },
    { 
      key: 'rule_type', 
      label: 'Type',
      render: (row) => <span className="capitalize">{row.rule_type}</span>
    },
    { key: 'point_value', label: 'Point Value' },
    { key: 'applicable_tiers', label: 'Applicable Tiers' },
    { 
      key: 'is_active', 
      label: 'Status',
      render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
    },
    { 
      key: 'start_date', 
      label: 'Start Date',
      render: (row) => formatDate(row.start_date)
    }
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => setEditRule(row)}>
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
        data={rules}
        columns={columns}
        loading={loading}
        error={error}
        searchKey="rule_name"
        searchPlaceholder="Search by rule name..."
        actions={actions}
      />

      {editRule && (
        <Dialog open={!!editRule} onOpenChange={() => setEditRule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Rule</DialogTitle>
            </DialogHeader>
            <RuleForm 
              rule={editRule}
              onSuccess={() => {
                setEditRule(null);
                fetchRules();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}