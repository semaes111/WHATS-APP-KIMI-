'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportSection } from '@/components/ui/report-section';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Brain, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  UserX,
  FileText,
  Phone,
  Calendar,
  Users,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock data para el informe diario
const mockReportData = {
  '2024-01-15': {
    generatedAt: '18:30',
    totalConversations: 24,
    uniquePatients: 18,
    summary: {
      urgent: 3,
      pending: 5,
      confirmed: 8,
      cancelledNoNext: 2,
      unconfirmedChanges: 3,
      noShow: 1,
    },
    urgent: [
      {
        id: '1',
        name: 'María García López',
        phone: '612 345 678',
        summary: 'Paciente con dolor agudo, solicita cita urgente para hoy',
        action: 'Llamar para confirmar disponibilidad a las 19:00',
      },
      {
        id: '2',
        name: 'Juan Martínez Ruiz',
        phone: '623 456 789',
        summary: 'Canceló cita de ayer, necesita reprogramar para esta semana',
        action: 'Ofrecer horarios de mañana jueves o viernes',
      },
      {
        id: '3',
        name: 'Carmen Sánchez Vega',
        phone: '634 567 890',
        summary: 'No responde mensajes desde hace 3 días, cita pendiente mañana',
        action: 'Intentar llamada telefónica urgente',
      },
    ],
    pending: [
      {
        id: '1',
        name: 'Antonio López Pérez',
        phone: '645 678 901',
        summary: 'Preguntó por resultados de análisis, pendiente de respuesta',
      },
      {
        id: '2',
        name: 'Laura Fernández Gil',
        phone: '656 789 012',
        summary: 'Solicitó información sobre tratamiento nuevo',
      },
      {
        id: '3',
        name: 'Pedro Rodríguez Sanz',
        phone: '667 890 123',
        summary: 'Quiere cambiar hora de cita del viernes',
      },
      {
        id: '4',
        name: 'Isabel Moreno Díaz',
        phone: '678 901 234',
        summary: 'Preguntó si puede traer acompañante',
      },
      {
        id: '5',
        name: 'Roberto Jiménez Luna',
        phone: '689 012 345',
        summary: 'Consulta sobre método de pago',
      },
    ],
    confirmed: [
      { id: '1', name: 'Ana Torres Beltrán', phone: '690 123 456', confirmedAt: '10:15', response: 'Ok, perfecto' },
      { id: '2', name: 'Miguel Ángel Ruiz', phone: '601 234 567', confirmedAt: '11:30', response: 'Vale, gracias' },
      { id: '3', name: 'Patricia Vega López', phone: '612 345 678', confirmedAt: '14:20', response: 'Ok 👍' },
      { id: '4', name: 'David Sanz Martín', phone: '623 456 789', confirmedAt: '16:45', response: 'Perfecto, allí estaré' },
      { id: '5', name: 'Sofia Núñez García', phone: '634 567 890', confirmedAt: '17:10', response: 'Ok' },
      { id: '6', name: 'Carlos Herrera Díaz', phone: '645 678 901', confirmedAt: '17:45', response: 'Gracias, confirmado' },
      { id: '7', name: 'Elena Castro Ruiz', phone: '656 789 012', confirmedAt: '18:00', response: 'Ok perfecto' },
      { id: '8', name: 'Javier Moreno Sanz', phone: '667 890 123', confirmedAt: '18:20', response: '👍' },
    ],
    cancelledNoNext: [
      {
        id: '1',
        name: 'Lucía Gómez Pérez',
        phone: '678 901 234',
        reason: 'Ha surgido un imprevisto familiar',
        willCallBack: true,
      },
      {
        id: '2',
        name: 'Fernando Díaz Luna',
        phone: '689 012 345',
        reason: 'Se ha puesto enfermo, necesita posponer',
        willCallBack: false,
      },
    ],
    unconfirmedChanges: [
      {
        id: '1',
        name: 'Raquel Martín Vega',
        phone: '690 123 456',
        details: 'Solicitó cambio de miércoles a jueves, esperando confirmación de hora',
        originalDate: 'Miércoles 17, 10:00',
        requestedDate: 'Jueves 18, por confirmar hora',
      },
      {
        id: '2',
        name: 'Alberto López Ruiz',
        phone: '601 234 567',
        details: 'Preguntó por disponibilidad de tarde, sin respuesta aún',
        originalDate: 'Viernes 19, 09:00',
        requestedDate: 'Pendiente',
      },
      {
        id: '3',
        name: 'Cristina Sánchez Gil',
        phone: '612 345 678',
        details: 'Quiere cambiar a la misma hora pero la semana que viene',
        originalDate: 'Martes 16, 16:30',
        requestedDate: 'Martes 23, 16:30',
      },
    ],
    noShow: [
      {
        id: '1',
        name: 'Diego Fernández Torres',
        phone: '623 456 789',
        reason: 'No acudió a cita programada, no ha respondido mensajes',
        lastContact: '2024-01-10',
      },
    ],
    noeliaTasks: [
      { id: '1', task: 'Llamar a María García - cita urgente hoy 19:00', priority: 'urgent' as const },
      { id: '2', task: 'Reprogramar Juan Martínez - jueves o viernes', priority: 'urgent' as const },
      { id: '3', task: 'Llamada urgente a Carmen Sánchez - sin respuesta', priority: 'urgent' as const },
      { id: '4', task: 'Enviar resultados a Antonio López', priority: 'pending' as const },
      { id: '5', task: 'Información tratamiento a Laura Fernández', priority: 'pending' as const },
      { id: '6', task: 'Confirmar cambio hora Pedro Rodríguez', priority: 'pending' as const },
      { id: '7', task: 'Responder sobre acompañante Isabel Moreno', priority: 'pending' as const },
      { id: '8', task: 'Confirmar método de pago Roberto Jiménez', priority: 'pending' as const },
    ],
  },
};

// Datos por defecto para fechas sin datos específicos
const defaultReportData = mockReportData['2024-01-15'];

export default function InformeDiarioPage() {
  const params = useParams();
  const router = useRouter();
  const fecha = params.fecha as string;
  
  const [reportData, setReportData] = useState(defaultReportData);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Formatear fecha
    const date = new Date(fecha);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setFormattedDate(date.toLocaleDateString('es-ES', options));

    // Cargar datos del informe (usar mock data o default)
    const data = mockReportData[fecha as keyof typeof mockReportData] || defaultReportData;
    setReportData(data);
  }, [fecha]);

  const handleExport = () => {
    alert('Exportando informe...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAskAboutReport = () => {
    router.push(`/chat?report=${fecha}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-gray-500 capitalize">{formattedDate}</p>
            <h1 className="text-2xl font-bold text-gray-900">Informe Diario</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Generado a las:</span>
              <span className="font-medium text-gray-900">{reportData.generatedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Conversaciones:</span>
              <span className="font-medium text-gray-900">{reportData.totalConversations}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Pacientes:</span>
              <span className="font-medium text-gray-900">{reportData.uniquePatients}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <ReportSection 
        title="Resumen Ejecutivo" 
        icon={<FileText className="h-5 w-5" />}
        variant="neutral"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-red-200">
            <p className="text-xs text-gray-500">Urgente</p>
            <p className="text-2xl font-bold text-red-600">{reportData.summary.urgent}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-500">Pendiente</p>
            <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pending}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-xs text-gray-500">Confirmados</p>
            <p className="text-2xl font-bold text-green-600">{reportData.summary.confirmed}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-red-200">
            <p className="text-xs text-gray-500">Cancelados</p>
            <p className="text-2xl font-bold text-red-600">{reportData.summary.cancelledNoNext}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <p className="text-xs text-gray-500">Sin confirmar</p>
            <p className="text-2xl font-bold text-orange-600">{reportData.summary.unconfirmedChanges}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">No acuden</p>
            <p className="text-2xl font-bold text-gray-600">{reportData.summary.noShow}</p>
          </div>
        </div>
      </ReportSection>

      {/* Urgente */}
      <ReportSection 
        title="Urgente - Requieren acción inmediata" 
        icon={<AlertCircle className="h-5 w-5" />}
        count={reportData.urgent.length}
        variant="urgent"
      >
        <div className="space-y-3">
          {reportData.urgent.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </a>
                </div>
                <StatusBadge status="urgent">Urgente</StatusBadge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">Acción: {item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Pendiente */}
      <ReportSection 
        title="Pendiente - Seguimiento necesario" 
        icon={<Clock className="h-5 w-5" />}
        count={reportData.pending.length}
        variant="pending"
      >
        <div className="space-y-3">
          {reportData.pending.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </a>
                </div>
                <StatusBadge status="pending">Pendiente</StatusBadge>
              </div>
              <p className="text-sm text-gray-600">{item.summary}</p>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Confirmados */}
      <ReportSection 
        title="Confirmados - Dijeron Ok o confirmaron cita" 
        icon={<CheckCircle2 className="h-5 w-5" />}
        count={reportData.confirmed.length}
        variant="success"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportData.confirmed.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{item.name}</span>
                <StatusBadge status="confirmed">Confirmado</StatusBadge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {item.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.confirmedAt}
                </span>
              </div>
              <p className="text-sm text-green-600 mt-2">"{item.response}"</p>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Cancelados sin próxima cita */}
      <ReportSection 
        title="Cancelados sin próxima cita" 
        icon={<XCircle className="h-5 w-5" />}
        count={reportData.cancelledNoNext.length}
        variant="cancelled"
      >
        <div className="space-y-3">
          {reportData.cancelledNoNext.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </a>
                </div>
                <StatusBadge status="cancelled">Cancelado</StatusBadge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
              {item.willCallBack && (
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Dijo "ya te aviso"
                </p>
              )}
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Sin confirmar cambio de cita */}
      <ReportSection 
        title="Sin confirmar cambio de cita" 
        icon={<MessageSquare className="h-5 w-5" />}
        count={reportData.unconfirmedChanges.length}
        variant="warning"
      >
        <div className="space-y-3">
          {reportData.unconfirmedChanges.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </a>
                </div>
                <StatusBadge status="unconfirmed">Sin confirmar</StatusBadge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.details}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 line-through">{item.originalDate}</span>
                <span className="text-gray-400">→</span>
                <span className="text-orange-600 font-medium">{item.requestedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* No acuden */}
      <ReportSection 
        title="No acuden" 
        icon={<UserX className="h-5 w-5" />}
        count={reportData.noShow.length}
        variant="neutral"
      >
        <div className="space-y-3">
          {reportData.noShow.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </a>
                </div>
                <StatusBadge status="no_show">No acude</StatusBadge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{item.reason}</p>
              <p className="text-xs text-gray-500">
                Último contacto: {new Date(item.lastContact).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* Tareas pendientes Noelia */}
      <ReportSection 
        title="Tareas pendientes Noelia" 
        icon={<Calendar className="h-5 w-5" />}
        count={reportData.noeliaTasks.length}
        variant="neutral"
      >
        <div className="bg-white rounded-lg border border-gray-200">
          <ol className="divide-y divide-gray-100">
            {reportData.noeliaTasks.map((task, index) => (
              <li key={task.id} className="p-3 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </span>
                <span className={cn(
                  'flex-1',
                  task.priority === 'urgent' ? 'text-red-700 font-medium' : 'text-gray-700'
                )}>
                  {task.priority === 'urgent' && '🔴 '}
                  {task.priority === 'pending' && '🟡 '}
                  {task.task}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </ReportSection>

      {/* Botón preguntar sobre informe */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex justify-center z-30">
        <Button 
          onClick={handleAskAboutReport}
          className="gap-2 bg-blue-600 hover:bg-blue-700 max-w-md w-full"
        >
          <Brain className="h-4 w-4" />
          Preguntar sobre este informe
        </Button>
      </div>
    </div>
  );
}
