'use client';

import DashboardWidgets from '@/components/dashboard/DashboardWidgets';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your loyalty program performance</p>
      </div>
      <DashboardWidgets />
    </div>
  );
}