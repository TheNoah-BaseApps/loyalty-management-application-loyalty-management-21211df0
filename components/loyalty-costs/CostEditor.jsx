'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

export default function CostEditor({ cost, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{cost.cost_name}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(cost)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(cost.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Points Required</p>
            <p className="font-semibold">{cost.points_required}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monetary Value</p>
            <p className="font-semibold">${cost.monetary_value}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock Quantity</p>
            <p className="font-semibold">{cost.stock_quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold capitalize">{cost.cost_status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}