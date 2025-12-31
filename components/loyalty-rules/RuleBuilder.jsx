import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function RuleBuilder({ rule }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{rule.rule_name}</CardTitle>
          <Badge variant={rule.is_active ? 'success' : 'secondary'}>
            {rule.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Rule Type</p>
            <p className="font-semibold capitalize">{rule.rule_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Point Value</p>
            <p className="font-semibold">{rule.point_value}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Applicable Tiers</p>
            <p className="font-semibold">{rule.applicable_tiers || 'All'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valid Until</p>
            <p className="font-semibold">{formatDate(rule.end_date)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}