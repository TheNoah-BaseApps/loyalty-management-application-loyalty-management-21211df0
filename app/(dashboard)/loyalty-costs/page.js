'use client';

import CostsList from '@/components/loyalty-costs/CostsList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CostForm from '@/components/loyalty-costs/CostForm';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyCostsPage() {
  const [showCostModal, setShowCostModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCostSuccess = () => {
    setShowCostModal(false);
    setRefreshKey(prev => prev + 1);
    toast.success('Redemption option added successfully');
  };

  const handleCostError = (error) => {
    toast.error(error || 'Failed to add redemption option');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Costs Management</h1>
          <p className="text-gray-600">Define redemption options, rewards catalog, and point costs</p>
        </div>
        <Button onClick={() => setShowCostModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Redemption Option
        </Button>
      </div>

      <CostsList key={refreshKey} />

      <Dialog open={showCostModal} onOpenChange={setShowCostModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Redemption Option</DialogTitle>
          </DialogHeader>
          <CostForm onSuccess={handleCostSuccess} onError={handleCostError} />
        </DialogContent>
      </Dialog>
    </div>
  );
}