import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, format, parseISO } from 'date-fns';

// GET /api/patients/:phone/conversations - Resúmenes de conversaciones por fecha
export async function GET(
  request: NextRequest,
  { params }: { params: { phone: string } }
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

    const { phone } = params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

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

    // Si se especifica una fecha, retornar conversación de ese día
    if (dateParam) {
      const targetDate = parseISO(dateParam);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);

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

      return NextResponse.json({
        success: true,
        data: {
          date: dateParam,
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
          })),
          messageCount: messages.length,
        },
      });
    }

    // Sin fecha específica - retornar resumen por fechas
    // Obtener todas las fechas con mensajes
    const messages = await prisma.message.findMany({
      where: { patientId: patient.id },
      orderBy: { sentAt: 'desc' },
      select: {
        id: true,
        content: true,
        type: true,
        sentAt: true,
        status: true,
      },
    });

    // Agrupar por fecha
    const conversationsByDate = new Map();
    
    messages.forEach(message => {
      const dateKey = format(message.sentAt, 'yyyy-MM-dd');
      
      if (!conversationsByDate.has(dateKey)) {
        conversationsByDate.set(dateKey, {
          date: dateKey,
          formattedDate: format(message.sentAt, 'dd/MM/yyyy'),
          messageCount: 0,
          lastMessage: null,
          firstMessage: null,
        });
      }

      const conversation = conversationsByDate.get(dateKey);
      conversation.messageCount++;
      
      if (!conversation.lastMessage) {
        conversation.lastMessage = {
          content: message.content,
          type: message.type,
          sentAt: message.sentAt,
        };
      }
      
      // El último mensaje en el array es el más antiguo porque ordenamos desc
      conversation.firstMessage = {
        content: message.content,
        type: message.type,
        sentAt: message.sentAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
        conversations: Array.from(conversationsByDate.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        totalMessages: messages.length,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener conversaciones' },
      { status: 500 }
    );
  }
}
