import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Schema para consulta de chat
const chatSchema = z.object({
  question: z.string().min(1, 'Pregunta requerida'),
  contextType: z.enum(['patient', 'report', 'dashboard', 'general']).optional(),
  contextId: z.string().optional(),
});

// POST /api/chat - Consultar al asistente IA
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validar datos
    const result = chatSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { question, contextType, contextId } = result.data;

    // Simular delay de procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generar respuesta basada en el contexto
    const answer = await generateAIResponse(question, contextType, contextId);

    // Guardar en historial
    const chatEntry = await prisma.chatHistory.create({
      data: {
        question,
        answer,
        contextType: contextType || 'general',
        contextId: contextId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: chatEntry.id,
        question,
        answer,
        contextType: contextType || 'general',
        contextId: contextId || null,
        createdAt: chatEntry.createdAt,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar consulta' },
      { status: 500 }
    );
  }
}

// Función para generar respuesta de IA basada en el contexto
async function generateAIResponse(
  question: string,
  contextType?: string,
  contextId?: string
): Promise<string> {
  const lowerQuestion = question.toLowerCase();

  // ============================================
  // Contexto: Paciente
  // ============================================
  if (contextType === 'patient' && contextId) {
    const patient = await prisma.patient.findUnique({
      where: { phone: contextId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            appointments: true,
            messages: true,
          },
        },
      },
    });

    if (!patient) {
      return 'No encontré información sobre este paciente. ¿Podrías verificar el número de teléfono?';
    }

    // Preguntas sobre citas del paciente
    if (lowerQuestion.includes('cita') || lowerQuestion.includes('próxima') || lowerQuestion.includes('proxima')) {
      const upcomingAppointments = patient.appointments.filter(a => 
        a.status === 'pending' || a.status === 'confirmed'
      );
      
      if (upcomingAppointments.length === 0) {
        return `${patient.name || 'El paciente'} no tiene citas programadas próximamente.`;
      }
      
      const nextAppointment = upcomingAppointments[0];
      return `La próxima cita de ${patient.name || 'el paciente'} es el ${format(nextAppointment.date, 'dd/MM/yyyy')} a las ${format(nextAppointment.date, 'HH:mm')}. Motivo: ${nextAppointment.reason || 'No especificado'}.`;
    }

    // Preguntas sobre historial
    if (lowerQuestion.includes('historial') || lowerQuestion.includes('historia') || lowerQuestion.includes('pasado')) {
      const completedAppointments = patient.appointments.filter(a => a.status === 'completed');
      return `${patient.name || 'El paciente'} ha tenido ${completedAppointments.length} citas completadas. En total tiene ${patient._count.appointments} citas registradas en el sistema.`;
    }

    // Información general del paciente
    if (lowerQuestion.includes('información') || lowerQuestion.includes('info') || lowerQuestion.includes('datos')) {
      return `**Información de ${patient.name || 'Paciente'}:**
- Teléfono: ${patient.phone}
- Email: ${patient.email || 'No registrado'}
- Tipo: ${patient.type || 'Regular'}
- Doctor asignado: ${patient.doctor || 'No asignado'}
- Total citas: ${patient._count.appointments}
- Total mensajes: ${patient._count.messages}
- Registrado: ${format(patient.createdAt, 'dd/MM/yyyy')}`;
    }

    // Respuesta genérica para paciente
    return `Entiendo tu pregunta sobre ${patient.name || 'este paciente'}. ¿Te gustaría saber sobre sus citas, historial médico o información de contacto?`;
  }

  // ============================================
  // Contexto: Informe/Dashboard
  // ============================================
  if (contextType === 'report' || contextType === 'dashboard') {
    // Estadísticas del día
    if (lowerQuestion.includes('cita') || lowerQuestion.includes('hoy')) {
      const today = new Date();
      const { startOfDay, endOfDay } = await import('date-fns');
      
      const appointments = await prisma.appointment.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
        _count: {
          status: true,
        },
      });

      const total = appointments.reduce((sum, a) => sum + a._count.status, 0);
      const confirmed = appointments.find(a => a.status === 'confirmed')?._count.status || 0;
      const pending = appointments.find(a => a.status === 'pending')?._count.status || 0;

      return `Hoy tenemos **${total} citas** programadas: **${confirmed}** confirmadas y **${pending}** pendientes.`;
    }

    // Estadísticas generales
    if (lowerQuestion.includes('paciente') || lowerQuestion.includes('total')) {
      const totalPatients = await prisma.patient.count({ where: { isActive: true } });
      const totalAppointments = await prisma.appointment.count();
      
      return `Actualmente tenemos **${totalPatients} pacientes activos** y **${totalAppointments} citas** registradas en el sistema.`;
    }

    // Mensajes
    if (lowerQuestion.includes('mensaje') || lowerQuestion.includes('whatsapp')) {
      const unreadMessages = await prisma.message.count({
        where: {
          type: 'incoming',
          status: 'sent',
        },
      });

      return `Hay **${unreadMessages} mensajes** de WhatsApp sin leer pendientes de atención.`;
    }

    // Respuesta genérica para dashboard
    return 'Puedo ayudarte con información sobre citas, pacientes, mensajes de WhatsApp o estadísticas del día. ¿Qué te gustaría saber?';
  }

  // ============================================
  // Preguntas generales (sin contexto específico)
  // ============================================
  
  // Ayuda general
  if (lowerQuestion.includes('ayuda') || lowerQuestion.includes('help') || lowerQuestion.includes('qué puedes hacer')) {
    return `**Puedo ayudarte con:**

📅 **Citas:**
- Ver citas de hoy o de un paciente específico
- Estadísticas de confirmaciones y cancelaciones

👥 **Pacientes:**
- Información de contacto
- Historial de citas
- Notas internas

📊 **Dashboard:**
- Estadísticas del día
- KPIs y métricas
- Mensajes pendientes

📝 **Informes:**
- Resumen diario
- Comparativas

¿Sobre qué te gustaría consultar?`;
  }

  // Saludos
  if (lowerQuestion.includes('hola') || lowerQuestion.includes('buenos días') || lowerQuestion.includes('buenas')) {
    const hour = new Date().getHours();
    let greeting = 'Hola';
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';
    
    return `${greeting} 👋 Soy tu asistente virtual para el Dashboard de Clínica. ¿En qué puedo ayudarte hoy?`;
  }

  // Despedidas
  if (lowerQuestion.includes('adiós') || lowerQuestion.includes('hasta luego') || lowerQuestion.includes('gracias')) {
    return '¡De nada! 😊 Estoy aquí si necesitas algo más. ¡Que tengas un excelente día!';
  }

  // Respuesta por defecto
  return `Entiendo tu pregunta. Para darte una mejor respuesta, ¿podrías especificar si te refieres a:

- Un paciente específico (proporciona su teléfono)
- Las estadísticas del dashboard
- Un informe en particular

O simplemente dime "ayuda" para ver todo lo que puedo hacer.`;
}
