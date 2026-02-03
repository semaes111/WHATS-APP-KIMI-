import { NextResponse } from 'next/server';

// POST /api/auth/logout - Cerrar sesión y limpiar cookie
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      data: { message: 'Sesión cerrada correctamente' },
    });

    // Eliminar cookie de autenticación
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
