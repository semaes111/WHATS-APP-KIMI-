'use client';

import { cn } from '@/lib/utils';
import { 
  Calendar, 
  CalendarCheck, 
  CalendarX, 
  MessageSquare, 
  Phone,
  UserPlus
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'appointment' | 'confirmed' | 'cancelled' | 'message' | 'call' | 'new_patient';
  date: string;
  title: string;
  description?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventConfig = {
  appointment: {
    icon: Calendar,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  confirmed: {
    icon: CalendarCheck,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  cancelled: {
    icon: CalendarX,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  message: {
    icon: MessageSquare,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  call: {
    icon: Phone,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  new_patient: {
    icon: UserPlus,
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
  },
};

export function Timeline({ events, className }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  config.bgColor
                )}
              >
                <Icon className={cn('h-5 w-5', config.iconColor)} />
              </div>

              {/* Content */}
              <div className={cn(
                'flex-1 p-3 rounded-lg border',
                config.borderColor,
                'bg-white'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay eventos en el historial
        </div>
      )}
    </div>
  );
}
