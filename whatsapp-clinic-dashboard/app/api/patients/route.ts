import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para crear paciente
const createPatientSchema = z.object({
  phone: z.string().min(1, 'Teléfono requerido'),
  name: z.string().optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  doctor: z.string().optional(),
});

// GET /api/patients - Listar pacientes con búsqueda, filtros y paginación
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
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const doctor = searchParams.get('doctor') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Construir where clause
    const where: any = {};

    // Búsqueda por nombre o teléfono
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // Filtro por tipo
    if (type) {
      where.type = type;
    }

    // Filtro por doctor
    if (doctor) {
      where.doctor = doctor;
    }

    // Filtro por estado activo
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Obtener pacientes con conteos
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              appointments: true,
              messages: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: patients.map(p => ({
        id: p.id,
        phone: p.phone,
        name: p.name,
        email: p.email,
        type: p.type,
        doctor: p.doctor,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        appointmentsCount: p._count.appointments,
        messagesCount: p._count.messages,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener pacientes' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Crear paciente
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar datos
    const result = createPatientSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verificar si el paciente ya existe
    const existingPatient = await prisma.patient.findUnique({
      where: { phone: data.phone },
    });

    if (existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un paciente con este teléfono' },
        { status: 409 }
      );
    }

    // Crear paciente
    const patient = await prisma.patient.create({
      data: {
        phone: data.phone,
        name: data.name || null,
        email: data.email || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        notes: data.notes || null,
        type: data.type || 'regular',
        doctor: data.doctor || null,
      },
    });

    return NextResponse.json(
      { success: true, data: patient },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear paciente' },
      { status: 500 }
    );
  }
}
