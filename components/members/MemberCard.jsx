import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Award, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MemberCard({ member, onClick }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{member.user_name || 'N/A'}</h3>
              <p className="text-sm text-gray-500">{member.member_number}</p>
            </div>
          </div>
          <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
            {member.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Tier:</span>
            <span className="font-medium">{member.current_tier || 'Bronze'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Enrolled:</span>
            <span className="font-medium">{formatDate(member.enrollment_date)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Points</p>
            <p className="text-lg font-bold text-blue-600">{member.total_points || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Available</p>
            <p className="text-lg font-bold text-green-600">{member.available_points || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Lifetime</p>
            <p className="text-lg font-bold text-purple-600">{member.lifetime_points || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}