import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

export default function PointsBalanceWidget({ member }) {
  if (!member) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Available Points</p>
          </div>
          <p className="text-3xl font-bold text-blue-600">{member.available_points || 0}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
            <p className="text-lg font-bold text-purple-600">{member.total_points || 0}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Lifetime</p>
            </div>
            <p className="text-lg font-bold text-green-600">{member.lifetime_points || 0}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">Current Tier</p>
          <p className="text-lg font-semibold capitalize">{member.current_tier || 'Bronze'}</p>
        </div>
      </CardContent>
    </Card>
  );
}