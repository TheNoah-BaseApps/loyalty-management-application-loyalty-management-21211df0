import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const roles = [
  { value: 'admin', label: 'Admin - Full Access' },
  { value: 'manager', label: 'Manager - Create/Edit Rules & Costs' },
  { value: 'analyst', label: 'Analyst - Read-Only Analytics' },
  { value: 'viewer', label: 'Viewer - Read-Only' },
];

export default function RoleSelector({ value, onChange, label = 'Role', required = false }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}