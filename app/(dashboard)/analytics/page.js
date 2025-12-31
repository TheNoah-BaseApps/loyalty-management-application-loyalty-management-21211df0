'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CostAnalytics from '@/components/analytics/CostAnalytics';
import EngagementMetrics from '@/components/analytics/EngagementMetrics';
import RedemptionPatterns from '@/components/analytics/RedemptionPatterns';

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Analyze program costs, engagement, and redemption patterns</p>
      </div>

      <Tabs defaultValue="costs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="costs">Program Costs & ROI</TabsTrigger>
          <TabsTrigger value="engagement">Member Engagement</TabsTrigger>
          <TabsTrigger value="redemptions">Redemption Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="costs">
          <CostAnalytics />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementMetrics />
        </TabsContent>

        <TabsContent value="redemptions">
          <RedemptionPatterns />
        </TabsContent>
      </Tabs>
    </div>
  );
}