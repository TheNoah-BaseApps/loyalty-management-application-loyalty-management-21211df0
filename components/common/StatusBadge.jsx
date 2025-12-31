export default function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
      manager: { label: 'Manager', className: 'bg-blue-100 text-blue-800' },
      analyst: { label: 'Analyst', className: 'bg-green-100 text-green-800' },
      viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
    };

    return configs[status?.toLowerCase()] || { 
      label: status, 
      className: 'bg-gray-100 text-gray-800' 
    };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${config.className}`}>
      {config.label}
    </span>
  );
}