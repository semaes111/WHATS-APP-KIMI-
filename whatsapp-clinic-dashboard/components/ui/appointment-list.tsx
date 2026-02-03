'use client';

import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import { Clock, User, FileText } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'unconfirmed';
  notes?: string;
  phone?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  className?: string;
  emptyMessage?: string;
}

const statusMap: Record<string, 'confirmed' | 'cancelled' | 'unconfirmed'> = {
  confirmed: 'confirmed',
  cancelada: 'cancelled',
  cancelled: 'cancelled',
  unconfirmed: 'unconfirmed',
  'sin confirmar': 'unconfirmed',
};

export function AppointmentList({
  appointments,
  className,
  emptyMessage = 'No hay citas programadas',
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-gray-900 truncate">
                {appointment.patientName}
              </h4>
              <StatusBadge status={statusMap[appointment.status] || 'unconfirmed'} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {appointment.time}
              </span>
              {appointment.phone && (
                <span className="text-xs">{appointment.phone}</span>
              )}
            </div>
            {appointment.notes && (
              <div className="flex items-start gap-1 mt-2 text-sm text-gray-600">
                <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{appointment.notes}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
