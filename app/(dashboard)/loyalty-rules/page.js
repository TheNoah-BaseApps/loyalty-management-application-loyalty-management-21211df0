'use client';

import RulesList from '@/components/loyalty-rules/RulesList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RuleForm from '@/components/loyalty-rules/RuleForm';
import { Plus } from 'lucide-react';

export default function LoyaltyRulesPage() {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRuleSuccess = () => {
    setShowRuleModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Rules Management</h1>
          <p className="text-gray-600">Configure earning rules, point accrual conditions, and tier eligibility</p>
        </div>
        <Button onClick={() => setShowRuleModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <RulesList key={refreshKey} />

      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Loyalty Rule</DialogTitle>
          </DialogHeader>
          <RuleForm onSuccess={handleRuleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}