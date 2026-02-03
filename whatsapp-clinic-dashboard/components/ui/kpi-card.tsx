'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  variant?: 'urgent' | 'pending' | 'resolved' | 'no_show' | 'default';
  className?: string;
  onClick?: () => void;
}

const variantConfig = {
  urgent: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconBg: 'bg-red-100',
  },
  pending: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconBg: 'bg-yellow-100',
  },
  resolved: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconBg: 'bg-green-100',
  },
  no_show: {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    iconBg: 'bg-gray-100',
  },
  default: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
};

export function KPICard({
  title,
  value,
  icon,
  variant = 'default',
  className,
  onClick,
}: KPICardProps) {
  const config = variantConfig[variant];

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        config.bgColor,
        config.borderColor,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn('text-2xl font-bold mt-1', config.textColor)}>
              {value}
            </p>
          </div>
          {icon && (
            <div className={cn('p-2.5 rounded-lg', config.iconBg)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
