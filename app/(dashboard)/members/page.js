'use client';

import MembersList from '@/components/members/MembersList';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnrollmentForm from '@/components/members/EnrollmentForm';
import { UserPlus } from 'lucide-react';

export default function MembersPage() {
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage loyalty program members</p>
        </div>
        <Button onClick={() => setShowEnrollmentModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Enroll Member
        </Button>
      </div>

      <MembersList key={refreshKey} />

      <Dialog open={showEnrollmentModal} onOpenChange={setShowEnrollmentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enroll New Member</DialogTitle>
          </DialogHeader>
          <EnrollmentForm onSuccess={handleEnrollmentSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}