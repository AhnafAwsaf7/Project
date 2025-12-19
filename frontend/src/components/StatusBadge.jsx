const StatusBadge = ({ status, children, className = '' }) => {
  const statusConfig = {
    verified: {
      classes: 'bg-green-100 text-green-800',
      defaultText: 'Verified',
    },
    active: {
      classes: 'bg-green-100 text-green-800',
      defaultText: 'Active',
    },
    funded: {
      classes: 'bg-green-100 text-green-800',
      defaultText: 'Funded',
    },
    pending: {
      classes: 'bg-yellow-100 text-yellow-800',
      defaultText: 'Pending',
    },
    reviewing: {
      classes: 'bg-yellow-100 text-yellow-800',
      defaultText: 'Reviewing',
    },
    rejected: {
      classes: 'bg-red-100 text-red-800',
      defaultText: 'Rejected',
    },
    unverified: {
      classes: 'bg-red-100 text-red-800',
      defaultText: 'Unverified',
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const displayText = children || config.defaultText;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;

