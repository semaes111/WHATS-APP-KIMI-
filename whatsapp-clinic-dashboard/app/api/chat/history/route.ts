import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chat/history - Obtener historial de preguntas
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const contextType = searchParams.get('contextType') || '';

    const skip = (page - 1) * limit;

    // Construir where clause
    const where: any = {};
    if (contextType) {
      where.contextType = contextType;
    }

    // Obtener historial de chat
    const [history, total] = await Promise.all([
      prisma.chatHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          question: true,
          answer: true,
          contextType: true,
          contextId: true,
          createdAt: true,
        },
      }),
      prisma.chatHistory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        history: history.map(h => ({
          id: h.id,
          question: h.question,
          answer: h.answer,
          contextType: h.contextType,
          contextId: h.contextId,
          createdAt: h.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial de chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/history - Limpiar historial de chat
export async function DELETE(request: NextRequest) {
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
    const olderThan = searchParams.get('olderThan'); // días

    let where: any = {};
    
    if (olderThan) {
      const days = parseInt(olderThan);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      where.createdAt = {
        lt: cutoffDate,
      };
    }

    const deleted = await prisma.chatHistory.deleteMany({ where });

    return NextResponse.json({
      success: true,
      data: {
        message: `Se eliminaron ${deleted.count} registros del historial`,
        deletedCount: deleted.count,
      },
    });
  } catch (error) {
    console.error('Delete chat history error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al limpiar historial de chat' },
      { status: 500 }
    );
  }
}
