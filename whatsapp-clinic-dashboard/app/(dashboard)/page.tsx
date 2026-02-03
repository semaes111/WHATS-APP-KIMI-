'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { AppointmentList } from '@/components/ui/appointment-list';
import { TaskList } from '@/components/ui/task-list';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Search, 
  Settings, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  UserX,
  Calendar,
  MessageSquare,
  FileText,
  ChevronRight,
  Loader2,
  Brain,
  Eye
} from 'lucide-react';
import Link from 'next/link';

// Datos de ejemplo para el dashboard
const mockData = {
  kpis: {
    urgent: 3,
    pending: 8,
    resolved: 15,
    noShow: 2,
  },
  tomorrowAppointments: [
    {
      id: '1',
      patientName: 'María García López',
      time: '09:00',
      status: 'confirmed' as const,
      notes: 'Revisión anual',
      phone: '612 345 678',
    },
    {
      id: '2',
      patientName: 'Juan Martínez Ruiz',
      time: '10:30',
      status: 'unconfirmed' as const,
      notes: 'Dolor de espalda',
      phone: '623 456 789',
    },
    {
      id: '3',
      patientName: 'Carmen Sánchez Vega',
      time: '11:45',
      status: 'cancelled' as const,
      notes: 'Canceló por enfermedad',
      phone: '634 567 890',
    },
    {
      id: '4',
      patientName: 'Antonio López Pérez',
      time: '16:00',
      status: 'confirmed' as const,
      notes: 'Control de medicación',
      phone: '645 678 901',
    },
    {
      id: '5',
      patientName: 'Laura Fernández Gil',
      time: '17:30',
      status: 'unconfirmed' as const,
      notes: 'Primera visita',
      phone: '656 789 012',
    },
  ],
  confirmedWithOk: [
    { id: '1', name: 'María García López', confirmedAt: '10:30' },
    { id: '2', name: 'Antonio López Pérez', confirmedAt: '14:15' },
    { id: '3', name: 'Isabel Moreno Díaz', confirmedAt: '16:45' },
    { id: '4', name: 'Pedro Rodríguez Sanz', confirmedAt: '18:20' },
  ],
  cancelledNoNext: [
    { 
      id: '1', 
      name: 'Carmen Sánchez Vega', 
      reason: 'Ha cogido la gripe, quiere reprogramar cuando se recupere',
      date: '2024-01-15'
    },
    { 
      id: '2', 
      name: 'Roberto Jiménez Luna', 
      reason: 'Conflicto de horario, no sabe cuándo podrá',
      date: '2024-01-15'
    },
  ],
  unconfirmedChanges: [
    {
      id: '1',
      name: 'Juan Martínez Ruiz',
      details: 'Solicitó cambio de martes a jueves, esperando confirmación',
      originalDate: 'Martes 16',
      requestedDate: 'Jueves 18',
    },
    {
      id: '2',
      name: 'Ana Torres Beltrán',
      details: 'Preguntó por horario de tarde, sin respuesta',
      originalDate: 'Miércoles 17',
      requestedDate: 'Pendiente',
    },
  ],
  noeliaTasks: [
    {
      id: '1',
      title: 'Llamar a Juan Martínez para confirmar cambio',
      priority: 'high' as const,
      description: 'Quiere cambiar de martes a jueves',
    },
    {
      id: '2',
      title: 'Reprogramar cita Carmen Sánchez',
      priority: 'high' as const,
      description: 'Canceló por gripe, llamar en una semana',
    },
    {
      id: '3',
      title: 'Enviar recordatorio a Laura Fernández',
      priority: 'medium' as const,
      description: 'Primera visita, sin confirmar',
    },
    {
      id: '4',
      title: 'Solicitar historial Isabel Moreno',
      priority: 'medium' as const,
      description: 'Paciente nueva, pedir documentación',
    },
    {
      id: '5',
      title: 'Confirmar cita Antonio López',
      priority: 'low' as const,
      description: 'Ya confirmó por WhatsApp',
    },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString('es-ES', options));
  }, []);

  const handleInterrogateReport = () => {
    // TODO: Implementar funcionalidad de interrogar informe
    alert('Funcionalidad de interrogar informe - Próximamente');
  };

  const handleViewFullReport = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/informe/${today}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header con fecha y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 capitalize">{currentDate}</p>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Urgente"
          value={mockData.kpis.urgent}
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          variant="urgent"
        />
        <KPICard
          title="Pendiente"
          value={mockData.kpis.pending}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          variant="pending"
        />
        <KPICard
          title="Resuelto"
          value={mockData.kpis.resolved}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          variant="resolved"
        />
        <KPICard
          title="No acude"
          value={mockData.kpis.noShow}
          icon={<UserX className="h-5 w-5 text-gray-600" />}
          variant="no_show"
        />
      </div>

      {/* Citas Mañana */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            CITAS MAÑANA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentList 
            appointments={mockData.tomorrowAppointments}
            emptyMessage="No hay citas programadas para mañana"
          />
        </CardContent>
      </Card>

      {/* Grid de dos columnas para las secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confirmados con OK */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              CONFIRMADOS CON OK
              <span className="ml-auto text-sm font-normal text-gray-500">
                {mockData.confirmedWithOk.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockData.confirmedWithOk.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{patient.name}</span>
                  <span className="text-xs text-gray-500">{patient.confirmedAt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cancelados sin próxima cita */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserX className="h-5 w-5 text-red-600" />
              CANCELADOS SIN PRÓXIMA CITA
              <span className="ml-auto text-sm font-normal text-gray-500">
                {mockData.cancelledNoNext.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.cancelledNoNext.map((patient) => (
                <div 
                  key={patient.id}
                  className="p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{patient.name}</span>
                    <StatusBadge status="cancelled" />
                  </div>
                  <p className="text-sm text-gray-600">{patient.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sin confirmar cambio de cita */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            SIN CONFIRMAR CAMBIO DE CITA
            <span className="ml-auto text-sm font-normal text-gray-500">
              {mockData.unconfirmedChanges.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.unconfirmedChanges.map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-orange-50 rounded-lg border border-orange-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <StatusBadge status="unconfirmed" />
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.details}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Original: <span className="line-through">{item.originalDate}</span></span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-orange-600 font-medium">{item.requestedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pendientes Noelia */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            PENDIENTES NOELIA
            <span className="ml-auto text-sm font-normal text-gray-500">
              {mockData.noeliaTasks.filter(t => t.priority === 'high').length} urgentes
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList 
            tasks={mockData.noeliaTasks}
            emptyMessage="No hay tareas pendientes"
          />
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex gap-3 justify-center z-30">
        <Button 
          variant="outline" 
          className="gap-2 flex-1 max-w-xs"
          onClick={handleInterrogateReport}
        >
          <Brain className="h-4 w-4" />
          Interrogar informe
        </Button>
        <Button 
          className="gap-2 flex-1 max-w-xs bg-blue-600 hover:bg-blue-700"
          onClick={handleViewFullReport}
        >
          <Eye className="h-4 w-4" />
          Ver informe completo
        </Button>
      </div>
    </div>
  );
}
