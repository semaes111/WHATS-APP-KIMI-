'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { StatusBadge } from '@/components/ui/status-badge';
import { KPICard } from '@/components/ui/kpi-card';
import { 
  FileText, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Fechas con informes disponibles
const availableReportDates = [
  '2024-01-15',
  '2024-01-14',
  '2024-01-13',
  '2024-01-12',
  '2024-01-11',
  '2024-01-10',
  '2024-01-09',
  '2024-01-08',
  '2023-12-28',
  '2023-12-27',
  '2023-12-26',
  '2023-12-25',
  '2023-12-22',
  '2023-12-21',
  '2023-12-20',
];

// Mock data de informes recientes
const recentReports = [
  {
    id: '2024-01-15',
    date: '2024-01-15',
    conversations: 24,
    uniquePatients: 18,
    stats: {
      urgent: 3,
      pending: 5,
      confirmed: 8,
      cancelled: 2,
      unconfirmed: 3,
      noShow: 1,
    },
  },
  {
    id: '2024-01-14',
    date: '2024-01-14',
    conversations: 19,
    uniquePatients: 15,
    stats: {
      urgent: 2,
      pending: 4,
      confirmed: 10,
      cancelled: 1,
      unconfirmed: 2,
      noShow: 0,
    },
  },
  {
    id: '2024-01-13',
    date: '2024-01-13',
    conversations: 22,
    uniquePatients: 17,
    stats: {
      urgent: 1,
      pending: 6,
      confirmed: 9,
      cancelled: 3,
      unconfirmed: 2,
      noShow: 1,
    },
  },
  {
    id: '2024-01-12',
    date: '2024-01-12',
    conversations: 20,
    uniquePatients: 16,
    stats: {
      urgent: 2,
      pending: 3,
      confirmed: 11,
      cancelled: 2,
      unconfirmed: 1,
      noShow: 1,
    },
  },
  {
    id: '2024-01-11',
    date: '2024-01-11',
    conversations: 18,
    uniquePatients: 14,
    stats: {
      urgent: 1,
      pending: 5,
      confirmed: 7,
      cancelled: 2,
      unconfirmed: 2,
      noShow: 1,
    },
  },
];

// Mock data de tendencias semanales
const weeklyTrends = {
  currentWeek: {
    totalConversations: 103,
    totalPatients: 62,
    confirmedAppointments: 45,
    cancelledAppointments: 10,
    averageResponseTime: '2.3h',
  },
  previousWeek: {
    totalConversations: 95,
    totalPatients: 58,
    confirmedAppointments: 40,
    cancelledAppointments: 12,
    averageResponseTime: '2.8h',
  },
};

// Datos para el gráfico semanal
const weeklyData = [
  { day: 'Lun', conversations: 18, confirmed: 7, cancelled: 2 },
  { day: 'Mar', conversations: 22, confirmed: 9, cancelled: 3 },
  { day: 'Mié', conversations: 19, confirmed: 10, cancelled: 1 },
  { day: 'Jue', conversations: 20, confirmed: 11, cancelled: 2 },
  { day: 'Vie', conversations: 24, confirmed: 8, cancelled: 2 },
];

export default function HistoricoPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    if (availableReportDates.includes(dateStr)) {
      router.push(`/informe/${dateStr}`);
    }
  };

  const getTrend = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return {
      value: Math.abs(diff),
      percentage: Math.abs(Number(percentage)),
      isPositive: diff >= 0,
    };
  };

  const conversationTrend = getTrend(
    weeklyTrends.currentWeek.totalConversations,
    weeklyTrends.previousWeek.totalConversations
  );

  const confirmedTrend = getTrend(
    weeklyTrends.currentWeek.confirmedAppointments,
    weeklyTrends.previousWeek.confirmedAppointments
  );

  const cancelledTrend = getTrend(
    weeklyTrends.currentWeek.cancelledAppointments,
    weeklyTrends.previousWeek.cancelledAppointments
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Informes</h1>
          <p className="text-sm text-gray-500">Consulta informes anteriores y tendencias</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Calendario de informes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                availableDates={availableReportDates}
                onDateSelect={handleDateSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Informes recientes */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Informes recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link 
                    key={report.id} 
                    href={`/informe/${report.date}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(report.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {report.conversations} conversaciones
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {report.uniquePatients} pacientes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {report.stats.urgent > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              {report.stats.urgent} urgente
                            </span>
                          )}
                          {report.stats.pending > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              {report.stats.pending} pendiente
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            {report.stats.confirmed} confirmado
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tendencias semanales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Tendencias semanales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* KPIs de tendencia */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-600">Conversaciones</p>
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  conversationTrend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {conversationTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {conversationTrend.percentage}%
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {weeklyTrends.currentWeek.totalConversations}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                vs {weeklyTrends.previousWeek.totalConversations} semana anterior
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-600">Citas confirmadas</p>
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  confirmedTrend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {confirmedTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {confirmedTrend.percentage}%
                </div>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {weeklyTrends.currentWeek.confirmedAppointments}
              </p>
              <p className="text-xs text-green-500 mt-1">
                vs {weeklyTrends.previousWeek.confirmedAppointments} semana anterior
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-red-600">Cancelaciones</p>
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  !cancelledTrend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {!cancelledTrend.isPositive ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {cancelledTrend.percentage}%
                </div>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {weeklyTrends.currentWeek.cancelledAppointments}
              </p>
              <p className="text-xs text-red-500 mt-1">
                vs {weeklyTrends.previousWeek.cancelledAppointments} semana anterior
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-purple-600">Tiempo respuesta</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  17.8%
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {weeklyTrends.currentWeek.averageResponseTime}
              </p>
              <p className="text-xs text-purple-500 mt-1">
                vs {weeklyTrends.previousWeek.averageResponseTime} semana anterior
              </p>
            </div>
          </div>

          {/* Gráfico semanal simple */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Actividad esta semana</h4>
            <div className="grid grid-cols-5 gap-4">
              {weeklyData.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="flex flex-col gap-1 mb-2">
                    <div 
                      className="bg-blue-200 rounded-t-sm mx-auto w-full"
                      style={{ height: `${day.conversations * 4}px` }}
                      title={`${day.conversations} conversaciones`}
                    />
                    <div 
                      className="bg-green-200 mx-auto w-full"
                      style={{ height: `${day.confirmed * 4}px` }}
                      title={`${day.confirmed} confirmadas`}
                    />
                    <div 
                      className="bg-red-200 rounded-b-sm mx-auto w-full"
                      style={{ height: `${day.cancelled * 4}px` }}
                      title={`${day.cancelled} canceladas`}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{day.day}</p>
                  <p className="text-xs text-gray-400">{day.conversations}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span className="text-gray-600">Conversaciones</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded" />
                <span className="text-gray-600">Confirmadas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded" />
                <span className="text-gray-600">Canceladas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas mensuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total informes"
          value={availableReportDates.length}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          variant="default"
        />
        <KPICard
          title="Promedio conversaciones/día"
          value="20.5"
          icon={<MessageCircle className="h-5 w-5 text-green-600" />}
          variant="resolved"
        />
        <KPICard
          title="Tasa de confirmación"
          value="78%"
          icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />}
          variant="default"
        />
      </div>
    </div>
  );
}
