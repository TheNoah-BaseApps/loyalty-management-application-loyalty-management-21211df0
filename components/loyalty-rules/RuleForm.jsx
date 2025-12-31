'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function RuleForm({ rule = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    product_id: '',
    product_name: '',
    rule_type: 'purchase',
    rule_condition: '',
    point_value: '',
    start_date: '',
    end_date: '',
    applicable_tiers: 'all',
    max_points: '',
    min_transaction: '',
    frequency: 'unlimited',
    is_active: true
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name || '',
        product_id: rule.product_id || '',
        product_name: rule.product_name || '',
        rule_type: rule.rule_type || 'purchase',
        rule_condition: rule.rule_condition || '',
        point_value: rule.point_value || '',
        start_date: rule.start_date || '',
        end_date: rule.end_date || '',
        applicable_tiers: rule.applicable_tiers || 'all',
        max_points: rule.max_points || '',
        min_transaction: rule.min_transaction || '',
        frequency: rule.frequency || 'unlimited',
        is_active: rule.is_active ?? true
      });
    }
  }, [rule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = rule ? `/api/loyalty-rules/${rule.id}` : '/api/loyalty-rules';
      const method = rule ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rule');
      }

      toast.success(`Rule ${rule ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Rule Name *</Label>
          <Input
            value={formData.rule_name}
            onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Product ID</Label>
          <Input
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Rule Type *</Label>
          <Select
            value={formData.rule_type}
            onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="signup">Signup</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Point Value *</Label>
          <Input
            type="number"
            value={formData.point_value}
            onChange={(e) => setFormData({ ...formData, point_value: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Max Points Per Transaction</Label>
          <Input
            type="number"
            value={formData.max_points}
            onChange={(e) => setFormData({ ...formData, max_points: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Minimum Transaction Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.min_transaction}
            onChange={(e) => setFormData({ ...formData, min_transaction: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Applicable Tiers</Label>
          <Select
            value={formData.applicable_tiers}
            onValueChange={(value) => setFormData({ ...formData, applicable_tiers: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unlimited">Unlimited</SelectItem>
              <SelectItem value="once">Once Per Customer</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rule Condition</Label>
        <Textarea
          value={formData.rule_condition}
          onChange={(e) => setFormData({ ...formData, rule_condition: e.target.value })}
          placeholder="e.g., Purchase amount > $50"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}