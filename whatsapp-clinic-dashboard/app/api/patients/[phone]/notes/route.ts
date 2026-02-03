import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para crear nota
const createNoteSchema = z.object({
  content: z.string().min(1, 'Contenido de la nota requerido'),
});

// GET /api/patients/:phone/notes - Obtener notas de un paciente
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

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

    // Obtener notas con paginación
    const [notes, total] = await Promise.all([
      prisma.patientNote.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.patientNote.count({
        where: { patientId: patient.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
        notes: notes.map(n => ({
          id: n.id,
          content: n.content,
          createdBy: n.createdBy,
          createdAt: n.createdAt,
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
    console.error('Get notes error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener notas' },
      { status: 500 }
    );
  }
}

// POST /api/patients/:phone/notes - Añadir nota interna a un paciente
export async function POST(
  request: NextRequest,
  { params }: { params: { phone: string } }
) {
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

    const { phone } = params;
    const body = await request.json();

    // Validar datos
    const result = createNoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { content } = result.data;

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

    // Crear nota
    const note = await prisma.patientNote.create({
      data: {
        patientId: patient.id,
        content,
        createdBy: userEmail || userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: note.id,
        content: note.content,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
        patient: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear nota' },
      { status: 500 }
    );
  }
}
