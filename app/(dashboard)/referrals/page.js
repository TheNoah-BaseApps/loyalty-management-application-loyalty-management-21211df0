'use client';

import ReferralsList from '@/components/referrals/ReferralsList';
import ReferralTracker from '@/components/referrals/ReferralTracker';

export default function ReferralsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-600">Track and manage member referrals</p>
      </div>

      <div className="mb-6">
        <ReferralTracker />
      </div>

      <ReferralsList />
    </div>
  );
}