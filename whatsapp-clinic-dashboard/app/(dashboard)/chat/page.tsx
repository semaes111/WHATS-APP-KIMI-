'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ui/chat-message';
import { 
  Send, 
  Brain, 
  FileText, 
  User, 
  MessageCircle,
  X,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Mock data para contextos
const mockContexts = {
  reports: [
    { id: '2024-01-15', label: 'Informe 15 de enero de 2024', type: 'report' },
    { id: '2024-01-14', label: 'Informe 14 de enero de 2024', type: 'report' },
    { id: '2024-01-13', label: 'Informe 13 de enero de 2024', type: 'report' },
  ],
  patients: [
    { id: '612345678', label: 'María García López', type: 'patient' },
    { id: '623456789', label: 'Juan Martínez Ruiz', type: 'patient' },
    { id: '634567890', label: 'Carmen Sánchez Vega', type: 'patient' },
    { id: '645678901', label: 'Antonio López Pérez', type: 'patient' },
  ],
};

// Preguntas sugeridas
const suggestedQuestions = {
  report: [
    '¿Cuántos pacientes urgentes tenemos?',
    'Resume las tareas pendientes de Noelia',
    '¿Qué pacientes cancelaron sin nueva cita?',
    '¿Cuántas citas están confirmadas para mañana?',
    'Muestra los pacientes que no acuden',
  ],
  patient: [
    '¿Cuál es el historial de cancelaciones?',
    '¿Cuándo fue la última visita?',
    'Resume las conversaciones recientes',
    '¿Tiene cita programada?',
    '¿Cuál es su fiabilidad?',
  ],
  general: [
    '¿Cuántos pacientes tenemos en total?',
    '¿Cuál es la tasa de cancelación este mes?',
    'Muestra los pacientes más frecuentes',
    '¿Cuántas citas tenemos programadas esta semana?',
    '¿Quién es el paciente con más cancelaciones?',
  ],
};

// Mock respuestas del asistente
const mockResponses: Record<string, string> = {
  '¿Cuántos pacientes urgentes tenemos?': 'Según el informe, tenemos 3 pacientes que requieren atención urgente:\n\n1. **María García López** - Dolor agudo, necesita cita para hoy\n2. **Juan Martínez Ruiz** - Canceló ayer, necesita reprogramar esta semana\n3. **Carmen Sánchez Vega** - No responde desde hace 3 días, cita mañana',
  'Resume las tareas pendientes de Noelia': 'Noelia tiene 8 tareas pendientes:\n\n🔴 **Urgentes (3):**\n- Llamar a María García - cita urgente hoy 19:00\n- Reprogramar Juan Martínez - jueves o viernes\n- Llamada urgente a Carmen Sánchez - sin respuesta\n\n🟡 **Pendientes (5):**\n- Enviar resultados a Antonio López\n- Información tratamiento a Laura Fernández\n- Confirmar cambio hora Pedro Rodríguez\n- Responder sobre acompañante Isabel Moreno\n- Confirmar método de pago Roberto Jiménez',
  '¿Qué pacientes cancelaron sin nueva cita?': 'Hay 2 pacientes que cancelaron sin programar nueva cita:\n\n1. **Lucía Gómez Pérez** - Imprevisto familiar (dijo "ya te aviso")\n2. **Fernando Díaz Luna** - Se puso enfermo, necesita posponer',
  '¿Cuántas citas están confirmadas para mañana?': 'Tenemos **8 citas confirmadas** para mañana. Todas las pacientes respondieron con "Ok" o mensajes de confirmación.',
  'Muestra los pacientes que no acuden': 'Hay 1 paciente marcado como "no acude":\n\n**Diego Fernández Torres** (623 456 789)\n- No acudió a cita programada\n- No ha respondido mensajes desde el 10 de enero',
  '¿Cuál es el historial de cancelaciones?': 'Según el historial de este paciente:\n\n- **Total citas:** 12\n- **Cancelaciones (3 meses):** 2\n- **Tasa de cancelación:** 16.7%\n\nLas cancelaciones fueron:\n1. Diciembre 2023 - Conflicto de horario\n2. Enero 2024 - Motivos de salud',
  '¿Cuándo fue la última visita?': 'La última visita fue el **10 de enero de 2024**. Fue una revisión de control rutinaria.',
  'Resume las conversaciones recientes': 'Últimas conversaciones:\n\n**15 enero** - Confirmó cita para mañana respondiendo "Ok, perfecto"\n**12 enero** - Preguntó sobre preparación para la visita\n**10 enero** - Asistió a cita programada\n\nTodas las interacciones han sido positivas.',
  '¿Tiene cita programada?': 'Sí, tiene una cita programada para **mañana 16 de enero a las 10:15**. La paciente confirmó asistencia.',
  '¿Cuál es su fiabilidad?': '**Fiabilidad: ⭐⭐⭐⭐☆ (4/5)**\n\n- Citas totales: 12\n- Asistencias: 10\n- Cancelaciones: 2\n- Tasa de asistencia: 83.3%\n\nEs un paciente bastante fiable.',
  '¿Cuántos pacientes tenemos en total?': 'Actualmente tenemos **156 pacientes** registrados en el sistema:\n\n- **Dieta:** 89 pacientes (57%)\n- **Estética:** 67 pacientes (43%)\n- **Activos:** 142 pacientes\n- **Inactivos:** 14 pacientes',
  '¿Cuál es la tasa de cancelación este mes?': '**Tasa de cancelación enero 2024: 12.3%**\n\n- Citas programadas: 89\n- Cancelaciones: 11\n- Confirmadas: 67\n- Pendientes: 11\n\nLa tasa está dentro del rango normal (10-15%).',
  'Muestra los pacientes más frecuentes': 'Top 5 pacientes más frecuentes:\n\n1. **María García López** - 24 visitas\n2. **Carmen Sánchez Vega** - 19 visitas\n3. **Antonio López Pérez** - 17 visitas\n4. **Laura Fernández Gil** - 15 visitas\n5. **Juan Martínez Ruiz** - 14 visitas',
  '¿Cuántas citas tenemos programadas esta semana?': 'Esta semana tenemos **34 citas programadas**:\n\n- **Lunes:** 6 citas\n- **Martes:** 8 citas\n- **Miércoles:** 5 citas\n- **Jueves:** 7 citas\n- **Viernes:** 8 citas\n\nDe estas, 27 están confirmadas y 7 pendientes de confirmación.',
  '¿Quién es el paciente con más cancelaciones?': 'El paciente con más cancelaciones en los últimos 3 meses es:\n\n**Roberto Jiménez Luna** (689 012 345)\n- **Cancelaciones:** 4\n- **Tasa de cancelación:** 44.4%\n- **Última cancelación:** 15 de enero\n\nSe recomienda hacer seguimiento de este paciente.',
};

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportParam = searchParams.get('report');
  const patientParam = searchParams.get('patient');
  
  const [context, setContext] = useState<{ id: string; label: string; type: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Establecer contexto inicial basado en query params
  useEffect(() => {
    if (reportParam) {
      const report = mockContexts.reports.find(r => r.id === reportParam);
      if (report) {
        setContext(report);
        addWelcomeMessage(report);
      }
    } else if (patientParam) {
      const patient = mockContexts.patients.find(p => p.id === patientParam);
      if (patient) {
        setContext(patient);
        addWelcomeMessage(patient);
      }
    } else {
      setContext({ id: 'general', label: 'Consulta general', type: 'general' });
      addWelcomeMessage({ id: 'general', label: 'Consulta general', type: 'general' });
    }
  }, [reportParam, patientParam]);

  // Scroll al final de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addWelcomeMessage = (ctx: { id: string; label: string; type: string }) => {
    const welcomeMessages: Record<string, string> = {
      report: `Hola! Estoy analizando el ${ctx.label}. ¿Qué te gustaría saber?`,
      patient: `Hola! Tengo la información de ${ctx.label}. ¿En qué puedo ayudarte?`,
      general: 'Hola! Soy tu asistente de la clínica. ¿Qué necesitas saber?',
    };

    setMessages([
      {
        id: 'welcome',
        content: welcomeMessages[ctx.type] || welcomeMessages.general,
        type: 'assistant',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simular respuesta del asistente
    setTimeout(() => {
      const response = mockResponses[content] || 
        'Lo siento, no tengo información específica sobre esa consulta. ¿Puedes reformular la pregunta o ser más específico?';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        type: 'assistant',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleContextChange = (newContext: { id: string; label: string; type: string }) => {
    setContext(newContext);
    setShowContextMenu(false);
    addWelcomeMessage(newContext);
    
    // Actualizar URL
    if (newContext.type === 'report') {
      router.push(`/chat?report=${newContext.id}`);
    } else if (newContext.type === 'patient') {
      router.push(`/chat?patient=${newContext.id}`);
    } else {
      router.push('/chat');
    }
  };

  const getSuggestedQuestions = () => {
    if (!context) return suggestedQuestions.general;
    return suggestedQuestions[context.type as keyof typeof suggestedQuestions] || suggestedQuestions.general;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Interrogador</h1>
          <p className="text-sm text-gray-500">Haz preguntas sobre informes y pacientes</p>
        </div>
      </div>

      {/* Context Selector */}
      <div className="mb-4 relative">
        <button
          onClick={() => setShowContextMenu(!showContextMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {context?.type === 'report' && <FileText className="h-4 w-4 text-blue-600" />}
          {context?.type === 'patient' && <User className="h-4 w-4 text-green-600" />}
          {context?.type === 'general' && <MessageCircle className="h-4 w-4 text-gray-600" />}
          <span className="text-sm font-medium text-gray-700">{context?.label || 'Seleccionar contexto'}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {showContextMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowContextMenu(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1">Informes</div>
                {mockContexts.reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleContextChange(report)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    {report.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 p-2">
                <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1">Pacientes</div>
                {mockContexts.patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleContextChange(patient)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <User className="h-4 w-4 text-green-600" />
                    {patient.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => handleContextChange({ id: 'general', label: 'Consulta general', type: 'general' })}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <MessageCircle className="h-4 w-4 text-gray-600" />
                  Consulta general
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                type={message.type}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
