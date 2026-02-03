'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { User, Phone, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface PatientCardProps {
  id: string;
  name: string;
  phone: string;
  lastVisit?: string;
  nextAppointment?: string;
  unreadMessages?: number;
  className?: string;
}

export function PatientCard({
  id,
  name,
  phone,
  lastVisit,
  nextAppointment,
  unreadMessages,
  className,
}: PatientCardProps) {
  return (
    <Link href={`/paciente/${phone}`}>
      <Card
        className={cn(
          'hover:shadow-md transition-all cursor-pointer hover:border-blue-300',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
                {unreadMessages && unreadMessages > 0 && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    <MessageSquare className="w-3 h-3" />
                    {unreadMessages}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Phone className="w-3.5 h-3.5" />
                {phone}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {lastVisit && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Última: {lastVisit}
                  </span>
                )}
                {nextAppointment && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Calendar className="w-3 h-3" />
                    Próxima: {nextAppointment}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
