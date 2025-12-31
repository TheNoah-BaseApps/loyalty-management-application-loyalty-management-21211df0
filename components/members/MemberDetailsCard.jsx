import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MemberDetailsCard({ member, onUpdate }) {
  if (!member) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Member Information</CardTitle>
          <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
            {member.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{member.user_name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{member.user_email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Member Number</p>
              <p className="font-medium">{member.member_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Segment</p>
              <p className="font-medium capitalize">{member.segment || 'Standard'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Enrollment Date</p>
              <p className="font-medium">{formatDate(member.enrollment_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Current Tier</p>
              <p className="font-medium capitalize">{member.current_tier || 'Bronze'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}