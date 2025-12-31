'use client';

import CampaignsList from '@/components/campaigns/CampaignsList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { Megaphone } from 'lucide-react';

export default function CampaignsPage() {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCampaignSuccess = () => {
    setShowCampaignModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage loyalty campaigns and promotions</p>
        </div>
        <Button onClick={() => setShowCampaignModal(true)}>
          <Megaphone className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <CampaignsList key={refreshKey} />

      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <CampaignForm onSuccess={handleCampaignSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}