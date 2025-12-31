'use client';

import TiersList from '@/components/tiers/TiersList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TierForm from '@/components/tiers/TierForm';
import { Award } from 'lucide-react';

export default function TiersPage() {
  const [showTierModal, setShowTierModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTierSuccess = () => {
    setShowTierModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tier Management</h1>
          <p className="text-gray-600">Configure loyalty tiers and benefits</p>
        </div>
        <Button onClick={() => setShowTierModal(true)}>
          <Award className="w-4 h-4 mr-2" />
          Add Tier
        </Button>
      </div>

      <TiersList key={refreshKey} />

      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tier</DialogTitle>
          </DialogHeader>
          <TierForm onSuccess={handleTierSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}