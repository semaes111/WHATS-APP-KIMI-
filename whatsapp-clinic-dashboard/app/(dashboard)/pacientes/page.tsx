'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PatientTable } from '@/components/ui/patient-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Search, 
  Users, 
  Filter,
  UserPlus,
  Download
} from 'lucide-react';

// Mock data de pacientes
const mockPatients = [
  {
    id: '1',
    name: 'María García López',
    phone: '612345678',
    type: 'dieta' as const,
    nextAppointment: '2024-01-16T10:00:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-10',
  },
  {
    id: '2',
    name: 'Juan Martínez Ruiz',
    phone: '623456789',
    type: 'estetica' as const,
    nextAppointment: undefined,
    cancellations3m: 2,
    isActive: true,
    lastVisit: '2023-12-15',
  },
  {
    id: '3',
    name: 'Carmen Sánchez Vega',
    phone: '634567890',
    type: 'dieta' as const,
    nextAppointment: '2024-01-16T11:45:00',
    cancellations3m: 1,
    isActive: true,
    lastVisit: '2024-01-05',
  },
  {
    id: '4',
    name: 'Antonio López Pérez',
    phone: '645678901',
    type: 'estetica' as const,
    nextAppointment: '2024-01-17T16:00:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-08',
  },
  {
    id: '5',
    name: 'Laura Fernández Gil',
    phone: '656789012',
    type: 'dieta' as const,
    nextAppointment: '2024-01-17T17:30:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: undefined,
  },
  {
    id: '6',
    name: 'Pedro Rodríguez Sanz',
    phone: '667890123',
    type: 'estetica' as const,
    nextAppointment: '2024-01-18T10:30:00',
    cancellations3m: 1,
    isActive: true,
    lastVisit: '2023-12-20',
  },
  {
    id: '7',
    name: 'Isabel Moreno Díaz',
    phone: '678901234',
    type: 'dieta' as const,
    nextAppointment: '2024-01-19T09:15:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-02',
  },
  {
    id: '8',
    name: 'Roberto Jiménez Luna',
    phone: '689012345',
    type: 'estetica' as const,
    nextAppointment: undefined,
    cancellations3m: 4,
    isActive: true,
    lastVisit: '2023-11-28',
  },
  {
    id: '9',
    name: 'Ana Torres Beltrán',
    phone: '690123456',
    type: 'dieta' as const,
    nextAppointment: '2024-01-18T14:00:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-09',
  },
  {
    id: '10',
    name: 'Miguel Ángel Ruiz',
    phone: '601234567',
    type: 'estetica' as const,
    nextAppointment: '2024-01-19T11:00:00',
    cancellations3m: 1,
    isActive: true,
    lastVisit: '2023-12-22',
  },
  {
    id: '11',
    name: 'Patricia Vega López',
    phone: '612345679',
    type: 'dieta' as const,
    nextAppointment: '2024-01-20T10:00:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-11',
  },
  {
    id: '12',
    name: 'David Sanz Martín',
    phone: '623456780',
    type: 'estetica' as const,
    nextAppointment: undefined,
    cancellations3m: 2,
    isActive: false,
    lastVisit: '2023-10-15',
  },
  {
    id: '13',
    name: 'Sofia Núñez García',
    phone: '634567891',
    type: 'dieta' as const,
    nextAppointment: '2024-01-22T16:30:00',
    cancellations3m: 0,
    isActive: true,
    lastVisit: '2024-01-12',
  },
  {
    id: '14',
    name: 'Carlos Herrera Díaz',
    phone: '645678902',
    type: 'estetica' as const,
    nextAppointment: '2024-01-23T09:00:00',
    cancellations3m: 1,
    isActive: true,
    lastVisit: '2023-12-18',
  },
  {
    id: '15',
    name: 'Elena Castro Ruiz',
    phone: '656789013',
    type: 'dieta' as const,
    nextAppointment: undefined,
    cancellations3m: 3,
    isActive: true,
    lastVisit: '2023-11-30',
  },
];

type FilterType = 'all' | 'dieta' | 'estetica' | 'active' | 'with_appointment';

export default function PacientesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filtrar pacientes
  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      // Filtro de búsqueda
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery);
      
      if (!matchesSearch) return false;

      // Filtro de tipo
      switch (activeFilter) {
        case 'dieta':
          return patient.type === 'dieta';
        case 'estetica':
          return patient.type === 'estetica';
        case 'active':
          return patient.isActive;
        case 'with_appointment':
          return patient.nextAppointment !== undefined;
        default:
          return true;
      }
    });
  }, [searchQuery, activeFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = mockPatients.length;
    const dieta = mockPatients.filter(p => p.type === 'dieta').length;
    const estetica = mockPatients.filter(p => p.type === 'estetica').length;
    const active = mockPatients.filter(p => p.isActive).length;
    const withAppointment = mockPatients.filter(p => p.nextAppointment).length;
    
    return { total, dieta, estetica, active, withAppointment };
  }, []);

  const handleExport = () => {
    alert('Exportando listado de pacientes...');
  };

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: stats.total },
    { value: 'dieta', label: 'Dieta', count: stats.dieta },
    { value: 'estetica', label: 'Estética', count: stats.estetica },
    { value: 'active', label: 'Activos', count: stats.active },
    { value: 'with_appointment', label: 'Con cita', count: stats.withAppointment },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-sm text-gray-500">{filteredPatients.length} de {stats.total} pacientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo paciente</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-xs text-blue-600">Total</p>
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <p className="text-xs text-green-600">Dieta</p>
            <p className="text-2xl font-bold text-green-700">{stats.dieta}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3">
            <p className="text-xs text-purple-600">Estética</p>
            <p className="text-2xl font-bold text-purple-700">{stats.estetica}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <p className="text-xs text-yellow-600">Activos</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-3">
            <p className="text-xs text-teal-600">Con cita</p>
            <p className="text-2xl font-bold text-teal-700">{stats.withAppointment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className={`ml-1.5 text-xs ${
                    activeFilter === filter.value ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            Listado de pacientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PatientTable patients={filteredPatients} />
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-medium">0</span>
          <span>Sin cancelaciones</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 font-medium">1-2</span>
          <span>Cancelaciones leves</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            3+
          </span>
          <span>Alto riesgo de cancelación</span>
        </div>
      </div>
    </div>
  );
}
