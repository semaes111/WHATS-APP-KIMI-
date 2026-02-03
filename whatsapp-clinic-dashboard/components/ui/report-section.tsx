'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReportSectionProps {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  variant?: 'urgent' | 'pending' | 'success' | 'cancelled' | 'neutral' | 'warning';
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const variantConfig = {
  urgent: {
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    headerBg: 'bg-red-100',
    textColor: 'text-red-800',
  },
  pending: {
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
    headerBg: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  success: {
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    headerBg: 'bg-green-100',
    textColor: 'text-green-800',
  },
  cancelled: {
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    headerBg: 'bg-red-100',
    textColor: 'text-red-800',
  },
  neutral: {
    borderColor: 'border-gray-200',
    bgColor: 'bg-gray-50',
    headerBg: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  warning: {
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    headerBg: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
};

export function ReportSection({
  title,
  icon,
  count,
  variant = 'neutral',
  children,
  defaultOpen = true,
  className,
}: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = variantConfig[variant];

  return (
    <div className={cn('rounded-lg border overflow-hidden', config.borderColor, className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4 transition-colors hover:opacity-90',
          config.headerBg
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className={config.textColor}>{icon}</span>}
          <h3 className={cn('font-semibold', config.textColor)}>{title}</h3>
          {count !== undefined && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              'bg-white/60',
              config.textColor
            )}>
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className={cn('h-5 w-5', config.textColor)} />
        ) : (
          <ChevronDown className={cn('h-5 w-5', config.textColor)} />
        )}
      </button>
      
      {isOpen && (
        <div className={cn('p-4', config.bgColor)}>
          {children}
        </div>
      )}
    </div>
  );
}
