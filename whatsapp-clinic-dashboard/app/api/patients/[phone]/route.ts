import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para actualizar paciente
const updatePatientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  doctor: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/patients/:phone - Obtener ficha completa de un paciente
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

    // Obtener paciente con todas sus relaciones
    const patient = await prisma.patient.findUnique({
      where: { phone },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            appointments: true,
            messages: true,
            notesList: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener últimos mensajes
    const recentMessages = await prisma.message.findMany({
      where: { patientId: patient.id },
      orderBy: { sentAt: 'desc' },
      take: 5,
    });

    // Obtener notas internas
    const notes = await prisma.patientNote.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: patient.id,
        phone: patient.phone,
        name: patient.name,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        notes: patient.notes,
        type: patient.type,
        doctor: patient.doctor,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        stats: {
          totalAppointments: patient._count.appointments,
          totalMessages: patient._count.messages,
          totalNotes: patient._count.notesList,
        },
        recentAppointments: patient.appointments,
        recentMessages: recentMessages.reverse(), // Ordenar de más antiguo a más reciente
        notesList: notes,
      },
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener paciente' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/:phone - Actualizar datos de un paciente
export async function PUT(
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
    const body = await request.json();

    // Validar datos
    const result = updatePatientSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { phone },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    if (result.data.name !== undefined) updateData.name = result.data.name;
    if (result.data.email !== undefined) updateData.email = result.data.email;
    if (result.data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(result.data.dateOfBirth);
    if (result.data.address !== undefined) updateData.address = result.data.address;
    if (result.data.notes !== undefined) updateData.notes = result.data.notes;
    if (result.data.type !== undefined) updateData.type = result.data.type;
    if (result.data.doctor !== undefined) updateData.doctor = result.data.doctor;
    if (result.data.isActive !== undefined) updateData.isActive = result.data.isActive;

    // Actualizar paciente
    const updatedPatient = await prisma.patient.update({
      where: { phone },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar paciente' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/:phone - Eliminar un paciente (soft delete)
export async function DELETE(
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

    // Verificar que el paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { phone },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - marcar como inactivo
    await prisma.patient.update({
      where: { phone },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Paciente eliminado correctamente' },
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar paciente' },
      { status: 500 }
    );
  }
}
