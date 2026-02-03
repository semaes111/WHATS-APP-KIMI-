'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Phone, Calendar, AlertCircle } from 'lucide-react';
import { StatusBadge } from './status-badge';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  phone: string;
  type: 'dieta' | 'estetica';
  nextAppointment?: string;
  cancellations3m: number;
  isActive: boolean;
  lastVisit?: string;
}

type SortField = 'name' | 'phone' | 'type' | 'nextAppointment' | 'cancellations3m';
type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: Patient[];
  className?: string;
}

export function PatientTable({ patients, className }: PatientTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'phone':
        comparison = a.phone.localeCompare(b.phone);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'nextAppointment':
        const dateA = a.nextAppointment ? new Date(a.nextAppointment) : new Date(0);
        const dateB = b.nextAppointment ? new Date(b.nextAppointment) : new Date(0);
        comparison = dateA.getTime() - dateB.getTime();
        break;
      case 'cancellations3m':
        comparison = a.cancellations3m - b.cancellations3m;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const SortableHeader = ({ 
    field, 
    children,
    className 
  }: { 
    field: SortField; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      onClick={() => handleSort(field)}
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  );

  const getCancellationIndicator = (count: number) => {
    if (count === 0) return <span className="text-green-600 font-medium">0</span>;
    if (count <= 2) return <span className="text-yellow-600 font-medium">{count}</span>;
    return (
      <span className="text-red-600 font-medium flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {count}
      </span>
    );
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="name" className="rounded-tl-lg">Nombre</SortableHeader>
            <SortableHeader field="phone">Teléfono</SortableHeader>
            <SortableHeader field="type">Tipo</SortableHeader>
            <SortableHeader field="nextAppointment">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Próx. cita
              </div>
            </SortableHeader>
            <SortableHeader field="cancellations3m">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                C
              </div>
            </SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPatients.map((patient) => (
            <tr
              key={patient.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    patient.type === 'dieta' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  )}>
                    {patient.type === 'dieta' ? 'Dieta' : 'Estética'}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <div className="text-sm text-gray-600">
                    {patient.nextAppointment ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        {new Date(patient.nextAppointment).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <div className="text-sm">
                    {getCancellationIndicator(patient.cancellations3m)}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/paciente/${patient.phone}`} className="block">
                  <StatusBadge 
                    status={patient.isActive ? 'confirmed' : 'cancelled'}
                  >
                    {patient.isActive ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedPatients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron pacientes
        </div>
      )}
    </div>
  );
}
