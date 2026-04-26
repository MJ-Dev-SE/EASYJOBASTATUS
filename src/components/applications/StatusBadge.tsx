import React from 'react';
import { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles = {
    saved: 'bg-slate-100 text-slate-600 border-slate-200',
    applied: 'bg-blue-50 text-blue-600 border-blue-100',
    followed_up: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    interview: 'bg-teal-50 text-teal-600 border-teal-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const labels = {
    saved: 'Saved',
    applied: 'Applied',
    followed_up: 'Followed Up',
    interview: 'Interview',
    rejected: 'Rejected',
    offer: 'Offer',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
};
