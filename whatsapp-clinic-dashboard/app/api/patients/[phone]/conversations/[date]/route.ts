import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// GET /api/patients/:phone/conversations/:date - Detalle de conversación de un día específico
export async function GET(
  request: NextRequest,
  { params }: { params: { phone: string; date: string } }
) {
  try {
    // Verificar autenticación
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { phone, date } = params;

    // Validar formato de fecha
    let targetDate: Date;
    try {
      targetDate = parseISO(date);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Buscar paciente
    const patient = await prisma.patient.findUnique({
      where: { phone },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Obtener mensajes del día
    const messages = await prisma.message.findMany({
      where: {
        patientId: patient.id,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: { sentAt: 'asc' },
    });

    // Obtener citas del día (para contexto)
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calcular estadísticas
    const stats = {
      totalMessages: messages.length,
      incomingMessages: messages.filter(m => m.type === 'incoming').length,
      outgoingMessages: messages.filter(m => m.type === 'outgoing').length,
      hasAppointment: appointments.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        date: {
          raw: date,
          formatted: format(targetDate, 'dd/MM/yyyy'),
          dayOfWeek: format(targetDate, 'EEEE', { locale: es }),
        },
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
        messages: messages.map(m => ({
          id: m.id,
          type: m.type,
          content: m.content,
          status: m.status,
          sentAt: m.sentAt,
          mediaUrl: m.mediaUrl,
          whatsappMessageId: m.whatsappMessageId,
        })),
        appointments: appointments.map(a => ({
          id: a.id,
          date: a.date,
          reason: a.reason,
          status: a.status,
          notes: a.notes,
        })),
        stats,
      },
    });
  } catch (error) {
    console.error('Get conversation detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener detalle de conversación' },
      { status: 500 }
    );
  }
}
