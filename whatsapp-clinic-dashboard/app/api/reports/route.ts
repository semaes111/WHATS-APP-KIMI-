import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO, format, subDays } from 'date-fns';

// GET /api/reports - Lista de informes (paginado)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Construir where clause
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startOfDay(parseISO(startDate));
      }
      if (endDate) {
        where.date.lte = endOfDay(parseISO(endDate));
      }
    }

    // Obtener informes
    const [reports, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          date: true,
          totalAppointments: true,
          confirmedAppointments: true,
          cancelledAppointments: true,
          completedAppointments: true,
          pendingAppointments: true,
          noShowAppointments: true,
          urgentCount: true,
          newPatients: true,
          totalMessages: true,
          generatedAt: true,
          generatedBy: true,
        },
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reports.map(r => ({
        id: r.id,
        date: format(r.date, 'yyyy-MM-dd'),
        formattedDate: format(r.date, 'dd/MM/yyyy'),
        stats: {
          totalAppointments: r.totalAppointments,
          confirmedAppointments: r.confirmedAppointments,
          cancelledAppointments: r.cancelledAppointments,
          completedAppointments: r.completedAppointments,
          pendingAppointments: r.pendingAppointments,
          noShowAppointments: r.noShowAppointments,
          urgentCount: r.urgentCount,
          newPatients: r.newPatients,
          totalMessages: r.totalMessages,
        },
        generatedAt: r.generatedAt,
        generatedBy: r.generatedBy,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener informes' },
      { status: 500 }
    );
  }
}
