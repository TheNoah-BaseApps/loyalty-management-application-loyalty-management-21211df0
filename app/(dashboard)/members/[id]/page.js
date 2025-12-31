'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MemberDetailsCard from '@/components/members/MemberDetailsCard';
import PointsBalanceWidget from '@/components/points/PointsBalanceWidget';
import TransactionHistory from '@/components/points/TransactionHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMemberDetails();
  }, [params.id]);

  const fetchMemberDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/members/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch member details');

      const data = await response.json();
      setMember(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Members
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
        <p className="text-gray-600">View and manage member information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <MemberDetailsCard member={member} onUpdate={fetchMemberDetails} />
        </div>
        <div>
          <PointsBalanceWidget member={member} />
        </div>
      </div>

      <TransactionHistory memberId={params.id} />
    </div>
  );
}