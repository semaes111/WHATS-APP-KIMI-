import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

// GET /api/dashboard - Obtener datos del dashboard
// GET /api/dashboard?date=YYYY-MM-DD - Obtener datos de fecha específica
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Usar fecha proporcionada o fecha actual
    const targetDate = dateParam ? parseISO(dateParam) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);
    
    // Calcular mañana para citas de mañana
    const tomorrowStart = startOfDay(addDays(targetDate, 1));
    const tomorrowEnd = endOfDay(addDays(targetDate, 1));

    // ============================================
    // KPIs - Contadores por estado
    // ============================================
    
    // Citas urgentes (pendientes de hoy o anteriores)
    const urgentAppointments = await prisma.appointment.count({
      where: {
        status: 'pending',
        date: {
          lte: dayEnd,
        },
      },
    });

    // Citas pendientes totales
    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: 'pending',
        date: {
          gte: dayStart,
        },
      },
    });

    // Citas confirmadas del día
    const confirmedAppointments = await prisma.appointment.count({
      where: {
        status: 'confirmed',
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Citas canceladas del día
    const cancelledAppointments = await prisma.appointment.count({
      where: {
        status: 'cancelled',
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Citas completadas del día
    const completedAppointments = await prisma.appointment.count({
      where: {
        status: 'completed',
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // No-show (no se presentaron) del día
    const noShowAppointments = await prisma.appointment.count({
      where: {
        status: 'no_show',
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // ============================================
    // Citas de mañana
    // ============================================
    const tomorrowAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // ============================================
    // Confirmados, Cancelados, Pendientes Noelia
    // ============================================
    
    // Confirmados totales
    const totalConfirmed = await prisma.appointment.count({
      where: {
        status: 'confirmed',
      },
    });

    // Cancelados totales
    const totalCancelled = await prisma.appointment.count({
      where: {
        status: 'cancelled',
      },
    });

    // Pendientes "Noelia" (pendientes que necesitan atención)
    // Estos son citas pendientes sin confirmar para los próximos días
    const noeliaPending = await prisma.appointment.findMany({
      where: {
        status: 'pending',
        date: {
          gte: dayStart,
          lte: endOfDay(addDays(targetDate, 7)), // Próximos 7 días
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 20,
    });

    // ============================================
    // Estadísticas adicionales
    // ============================================
    
    // Total de pacientes activos
    const totalPatients = await prisma.patient.count({
      where: {
        isActive: true,
      },
    });

    // Nuevos pacientes del día
    const newPatientsToday = await prisma.patient.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Mensajes sin leer (incoming con status sent)
    const unreadMessages = await prisma.message.count({
      where: {
        type: 'incoming',
        status: 'sent',
      },
    });

    // Mensajes del día
    const todayMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // ============================================
    // Citas del día actual (detalle)
    // ============================================
    const todayAppointmentsDetail = await prisma.appointment.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        date: format(targetDate, 'yyyy-MM-dd'),
        kpis: {
          urgent: urgentAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          cancelled: cancelledAppointments,
          completed: completedAppointments,
          noShow: noShowAppointments,
        },
        stats: {
          totalPatients,
          newPatientsToday,
          unreadMessages,
          todayMessages,
          totalConfirmed,
          totalCancelled,
        },
        todayAppointments: todayAppointmentsDetail,
        tomorrowAppointments: tomorrowAppointments.map(a => ({
          id: a.id,
          time: format(a.date, 'HH:mm'),
          patientName: a.patient?.name || 'Sin nombre',
          patientPhone: a.patient?.phone,
          reason: a.reason,
          status: a.status,
        })),
        noeliaPending: noeliaPending.map(a => ({
          id: a.id,
          date: format(a.date, 'dd/MM/yyyy HH:mm'),
          patientName: a.patient?.name || 'Sin nombre',
          patientPhone: a.patient?.phone,
          reason: a.reason,
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
}
