'use client';

import { cn } from '@/lib/utils';

type StatusType = 'urgent' | 'pending' | 'confirmed' | 'resolved' | 'cancelled' | 'no_show' | 'unconfirmed';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; bgColor: string; textColor: string }> = {
  urgent: {
    label: 'Urgente',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  pending: {
    label: 'Pendiente',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
  confirmed: {
    label: 'Confirmada',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  resolved: {
    label: 'Resuelto',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  cancelled: {
    label: 'Cancelada',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  no_show: {
    label: 'No acude',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
  unconfirmed: {
    label: 'Sin confirmar',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {children || config.label}
    </span>
  );
}
