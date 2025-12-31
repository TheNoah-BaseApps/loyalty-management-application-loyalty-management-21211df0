'use client';

import RedemptionsList from '@/components/redemptions/RedemptionsList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import RedemptionModal from '@/components/redemptions/RedemptionModal';
import { Gift } from 'lucide-react';

export default function RedemptionsPage() {
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRedemptionSuccess = () => {
    setShowRedemptionModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redemptions</h1>
          <p className="text-gray-600">Process and manage point redemptions</p>
        </div>
        <Button onClick={() => setShowRedemptionModal(true)}>
          <Gift className="w-4 h-4 mr-2" />
          Process Redemption
        </Button>
      </div>

      <RedemptionsList key={refreshKey} />

      {showRedemptionModal && (
        <RedemptionModal 
          isOpen={showRedemptionModal}
          onClose={() => setShowRedemptionModal(false)}
          onSuccess={handleRedemptionSuccess}
        />
      )}
    </div>
  );
}