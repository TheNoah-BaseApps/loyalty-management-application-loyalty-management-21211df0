'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function TierForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tier_name: '',
    min_points: '',
    max_points: '',
    benefits: '',
    multiplier: '1.0'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tier');
      }

      toast.success('Tier created successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tier Name *</Label>
        <Input
          value={formData.tier_name}
          onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
          placeholder="e.g., Bronze, Silver, Gold"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min Points *</Label>
          <Input
            type="number"
            value={formData.min_points}
            onChange={(e) => setFormData({ ...formData, min_points: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Max Points *</Label>
          <Input
            type="number"
            value={formData.max_points}
            onChange={(e) => setFormData({ ...formData, max_points: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Multiplier *</Label>
        <Input
          type="number"
          step="0.1"
          value={formData.multiplier}
          onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Benefits</Label>
        <Textarea
          value={formData.benefits}
          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          placeholder="Describe tier benefits and perks"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Tier'}
      </Button>
    </form>
  );
}