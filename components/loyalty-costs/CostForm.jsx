'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CostForm({ cost = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cost_name: '',
    product_id: '',
    product_name: '',
    points_required: '',
    points_cost: '',
    monetary_value: '',
    cost_type: 'product',
    validity_period: '',
    start_date: '',
    end_date: '',
    customer_segment: 'all',
    redemption_limit: '',
    cost_status: 'active',
    channel_availability: 'all',
    terms_conditions: '',
    processing_fee: '0',
    stock_quantity: '',
    minimum_balance: '0',
    fulfillment_type: 'instant',
    partner_code: ''
  });

  useEffect(() => {
    if (cost) {
      setFormData({
        cost_name: cost.cost_name || '',
        product_id: cost.product_id || '',
        product_name: cost.product_name || '',
        points_required: cost.points_required || '',
        points_cost: cost.points_cost || '',
        monetary_value: cost.monetary_value || '',
        cost_type: cost.cost_type || 'product',
        validity_period: cost.validity_period || '',
        start_date: cost.start_date || '',
        end_date: cost.end_date || '',
        customer_segment: cost.customer_segment || 'all',
        redemption_limit: cost.redemption_limit || '',
        cost_status: cost.cost_status || 'active',
        channel_availability: cost.channel_availability || 'all',
        terms_conditions: cost.terms_conditions || '',
        processing_fee: cost.processing_fee || '0',
        stock_quantity: cost.stock_quantity || '',
        minimum_balance: cost.minimum_balance || '0',
        fulfillment_type: cost.fulfillment_type || 'instant',
        partner_code: cost.partner_code || ''
      });
    }
  }, [cost]);

  const validateForm = () => {
    if (!formData.cost_name.trim()) {
      toast.error('Cost name is required');
      return false;
    }
    if (!formData.product_id.trim()) {
      toast.error('Product ID is required');
      return false;
    }
    if (!formData.product_name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.points_required || parseFloat(formData.points_required) <= 0) {
      toast.error('Points required must be greater than 0');
      return false;
    }
    if (!formData.monetary_value || parseFloat(formData.monetary_value) <= 0) {
      toast.error('Monetary value must be greater than 0');
      return false;
    }
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      toast.error('Stock quantity must be 0 or greater');
      return false;
    }
    if (!formData.start_date) {
      toast.error('Start date is required');
      return false;
    }
    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('End date cannot be before start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const url = cost ? `/api/loyalty-costs/${cost.id}` : '/api/loyalty-costs';
      const method = cost ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        points_required: parseFloat(formData.points_required),
        monetary_value: parseFloat(formData.monetary_value),
        stock_quantity: parseInt(formData.stock_quantity),
        processing_fee: parseFloat(formData.processing_fee || 0),
        minimum_balance: parseFloat(formData.minimum_balance || 0),
        redemption_limit: formData.redemption_limit ? parseInt(formData.redemption_limit) : null,
        validity_period: formData.validity_period || null,
        end_date: formData.end_date || null,
        partner_code: formData.partner_code || null,
        terms_conditions: formData.terms_conditions || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to ${cost ? 'update' : 'create'} cost`);
      }

      toast.success(`Cost ${cost ? 'updated' : 'created'} successfully`);
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving cost:', err);
      toast.error(err.message || 'An error occurred while saving the cost');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cost Name *</Label>
          <Input
            value={formData.cost_name}
            onChange={(e) => setFormData({ ...formData, cost_name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Product ID *</Label>
          <Input
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Product Name *</Label>
          <Input
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Points Required *</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.points_required}
            onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Monetary Value *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.monetary_value}
            onChange={(e) => setFormData({ ...formData, monetary_value: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Cost Type</Label>
          <Select
            value={formData.cost_type}
            onValueChange={(value) => setFormData({ ...formData, cost_type: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="voucher">Voucher</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Stock Quantity *</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Redemption Limit</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.redemption_limit}
            onChange={(e) => setFormData({ ...formData, redemption_limit: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Customer Segment</Label>
          <Select
            value={formData.customer_segment}
            onValueChange={(value) => setFormData({ ...formData, customer_segment: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.cost_status}
            onValueChange={(value) => setFormData({ ...formData, cost_status: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fulfillment Type</Label>
          <Select
            value={formData.fulfillment_type}
            onValueChange={(value) => setFormData({ ...formData, fulfillment_type: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Partner Code</Label>
          <Input
            value={formData.partner_code}
            onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Terms & Conditions</Label>
        <Textarea
          value={formData.terms_conditions}
          onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : cost ? 'Update Cost' : 'Create Cost'}
        </Button>
      </div>
    </form>
  );
}