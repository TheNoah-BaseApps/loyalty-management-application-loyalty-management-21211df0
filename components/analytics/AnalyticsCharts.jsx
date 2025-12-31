'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsCharts({ title, data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart visualization for {data?.length || 0} data points
        </div>
      </CardContent>
    </Card>
  );
}