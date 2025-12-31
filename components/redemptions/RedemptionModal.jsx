'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function RedemptionModal({ isOpen, onClose, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    cost_id: '',
    channel: 'online'
  });

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchCosts();
    }
  }, [isOpen]);

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

  const fetchCosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/loyalty-costs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCosts((data.data || []).filter(c => c.cost_status === 'active'));
      }
    } catch (err) {
      console.error('Failed to fetch costs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/redemptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process redemption');
      }

      toast.success('Redemption processed successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Redemption</DialogTitle>
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
                    {member.member_number} - {member.user_name} ({member.available_points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reward</Label>
            <Select
              value={formData.cost_id}
              onValueChange={(value) => setFormData({ ...formData, cost_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reward" />
              </SelectTrigger>
              <SelectContent>
                {costs.map(cost => (
                  <SelectItem key={cost.id} value={cost.id}>
                    {cost.cost_name} - {cost.points_required} pts (${cost.monetary_value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select
              value={formData.channel}
              onValueChange={(value) => setFormData({ ...formData, channel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="store">In-Store</SelectItem>
                <SelectItem value="call_center">Call Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Process Redemption'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}