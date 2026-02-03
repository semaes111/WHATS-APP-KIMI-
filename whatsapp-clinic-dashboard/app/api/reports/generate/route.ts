import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO, format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

// POST /api/reports/generate - Forzar generación de informe (simular llamada a n8n)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { date } = body;

    // Usar fecha proporcionada o fecha actual
    const targetDate = date ? parseISO(date) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Simular delay de procesamiento (como si llamara a n8n)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar si ya existe un informe para esta fecha
    const existingReport = await prisma.dailyReport.findUnique({
      where: { date: dayStart },
    });

    // Calcular estadísticas del día
    const appointments = await prisma.appointment.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _count: {
        status: true,
      },
    });

    const totalAppointments = appointments.reduce((sum, a) => sum + a._count.status, 0);
    const confirmedAppointments = appointments.find(a => a.status === 'confirmed')?._count.status || 0;
    const cancelledAppointments = appointments.find(a => a.status === 'cancelled')?._count.status || 0;
    const completedAppointments = appointments.find(a => a.status === 'completed')?._count.status || 0;
    const pendingAppointments = appointments.find(a => a.status === 'pending')?._count.status || 0;
    const noShowAppointments = appointments.find(a => a.status === 'no_show')?._count.status || 0;

    // Citas urgentes
    const urgentCount = await prisma.appointment.count({
      where: {
        status: 'pending',
        date: {
          lte: dayEnd,
        },
      },
    });

    // Nuevos pacientes
    const newPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Mensajes
    const messages = await prisma.message.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _count: {
        type: true,
      },
    });

    const totalMessages = messages.reduce((sum, m) => sum + m._count.type, 0);
    const incomingMessages = messages.find(m => m.type === 'incoming')?._count.type || 0;
    const outgoingMessages = messages.find(m => m.type === 'outgoing')?._count.type || 0;

    // Generar contenido markdown
    const markdownContent = generateReportMarkdown({
      date: targetDate,
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      pendingAppointments,
      noShowAppointments,
      urgentCount,
      newPatients,
      totalMessages,
      incomingMessages,
      outgoingMessages,
    });

    // Crear o actualizar informe
    const report = await prisma.dailyReport.upsert({
      where: { date: dayStart },
      update: {
        content: markdownContent,
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        pendingAppointments,
        noShowAppointments,
        urgentCount,
        newPatients,
        totalMessages,
        incomingMessages,
        outgoingMessages,
        generatedAt: new Date(),
        generatedBy: userEmail || 'manual',
      },
      create: {
        date: dayStart,
        content: markdownContent,
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        pendingAppointments,
        noShowAppointments,
        urgentCount,
        newPatients,
        totalMessages,
        incomingMessages,
        outgoingMessages,
        generatedBy: userEmail || 'manual',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        date: format(targetDate, 'yyyy-MM-dd'),
        formattedDate: format(targetDate, 'dd/MM/yyyy'),
        stats: {
          totalAppointments,
          confirmedAppointments,
          cancelledAppointments,
          completedAppointments,
          pendingAppointments,
          noShowAppointments,
          urgentCount,
          newPatients,
          totalMessages,
          incomingMessages,
          outgoingMessages,
        },
        wasUpdated: !!existingReport,
        generatedAt: report.generatedAt,
        generatedBy: report.generatedBy,
        message: existingReport 
          ? 'Informe actualizado correctamente' 
          : 'Informe generado correctamente',
      },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar informe' },
      { status: 500 }
    );
  }
}

// Función para generar contenido markdown del informe
function generateReportMarkdown(data: {
  date: Date;
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  noShowAppointments: number;
  urgentCount: number;
  newPatients: number;
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
}): string {
  const dateStr = format(data.date, 'dd/MM/yyyy');
  
  return `# Informe Diario - ${dateStr}

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Total Citas** | ${data.totalAppointments} |
| **Confirmadas** | ${data.confirmedAppointments} |
| **Canceladas** | ${data.cancelledAppointments} |
| **Completadas** | ${data.completedAppointments} |
| **Pendientes** | ${data.pendingAppointments} |
| **No Show** | ${data.noShowAppointments} |
| **Urgentes** | ${data.urgentCount} |
| **Nuevos Pacientes** | ${data.newPatients} |

## Comunicaciones WhatsApp

| Tipo | Cantidad |
|------|----------|
| **Mensajes Totales** | ${data.totalMessages} |
| **Recibidos** | ${data.incomingMessages} |
| **Enviados** | ${data.outgoingMessages} |

## Análisis del Día

${data.totalAppointments > 0 
  ? `El día registró **${data.totalAppointments} citas** programadas, de las cuales:
- **${data.confirmedAppointments}** fueron confirmadas (${Math.round((data.confirmedAppointments / data.totalAppointments) * 100)}%)
- **${data.completedAppointments}** fueron completadas (${Math.round((data.completedAppointments / data.totalAppointments) * 100)}%)
- **${data.cancelledAppointments}** fueron canceladas (${Math.round((data.cancelledAppointments / data.totalAppointments) * 100)}%)
- **${data.noShowAppointments}** no se presentaron (${Math.round((data.noShowAppointments / data.totalAppointments) * 100)}%)`
  : 'No se registraron citas para este día.'}

${data.urgentCount > 0 
  ? `\n⚠️ **ATENCIÓN**: Hay **${data.urgentCount} citas urgentes** que requieren seguimiento.` 
  : ''}

${data.newPatients > 0 
  ? `\n👥 **Nuevos Pacientes**: Se registraron **${data.newPatients} nuevos pacientes** en el sistema.` 
  : ''}

## Próximos Pasos Recomendados

${data.pendingAppointments > 0 
  ? `- Contactar a **${data.pendingAppointments} pacientes** con citas pendientes de confirmación\n` 
  : ''}${data.urgentCount > 0 
  ? `- Atender **${data.urgentCount} casos urgentes** pendientes\n` 
  : ''}- Revisar mensajes de WhatsApp pendientes
- Preparar agenda del día siguiente

---
*Informe generado automáticamente el ${format(new Date(), 'dd/MM/yyyy HH:mm')}*
`;
}
