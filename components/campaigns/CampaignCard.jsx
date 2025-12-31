import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CampaignCard({ campaign }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
          <Badge variant={campaign.status === 'active' ? 'success' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">Bonus:</span>
          <span className="font-medium">{campaign.bonus_points} points</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">Target:</span>
          <span className="font-medium capitalize">{campaign.target_segment}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">Period:</span>
          <span className="font-medium">
            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{campaign.conditions}</p>
      </CardContent>
    </Card>
  );
}