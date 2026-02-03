import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener último mensaje de cada paciente
    const conversations = await prisma.patient.findMany({
      where: {
        messages: {
          some: {},
        },
      },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                type: 'incoming',
                status: 'sent',
              },
            },
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    const formattedConversations = conversations.map((patient) => ({
      patientId: patient.id,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
      },
      lastMessage: patient.messages[0] || null,
      unreadCount: patient._count.messages,
      updatedAt: patient.messages[0]?.sentAt || patient.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Error al obtener conversaciones' },
      { status: 500 }
    );
  }
}
