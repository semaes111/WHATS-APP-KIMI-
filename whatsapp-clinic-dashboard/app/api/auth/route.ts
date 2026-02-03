import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { z } from 'zod';

// Schema para login con código de acceso
const loginSchema = z.object({
  code: z.string().min(1, 'Código de acceso requerido'),
});

// GET /api/auth/verify - Verificar JWT válido
export async function GET(request: NextRequest) {
  try {
    // El middleware ya verifica el token y agrega headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
      },
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar autenticación' },
      { status: 500 }
    );
  }
}

// POST /api/auth/login - Login con código de acceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { code } = result.data;

    // Verificar código contra ACCESS_CODE env
    const accessCode = process.env.ACCESS_CODE;
    
    if (!accessCode) {
      console.error('ACCESS_CODE no configurado en variables de entorno');
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    if (code !== accessCode) {
      return NextResponse.json(
        { success: false, error: 'Código de acceso inválido' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generateToken({
      userId: 'admin-user',
      email: 'admin@clinic.com',
      role: 'admin',
    });

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: 'admin-user',
          email: 'admin@clinic.com',
          name: 'Administrador',
          role: 'admin',
        },
      },
    });

    // Establecer cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
