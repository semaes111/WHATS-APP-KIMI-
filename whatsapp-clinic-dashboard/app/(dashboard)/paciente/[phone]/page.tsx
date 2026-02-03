'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timeline } from '@/components/ui/timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  User, 
  Stethoscope,
  Star,
  MessageSquare,
  Plus,
  Brain,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock data de pacientes
const mockPatients: Record<string, {
  id: string;
  name: string;
  phone: string;
  email: string;
  firstVisit: string;
  type: 'dieta' | 'estetica';
  doctor: string;
  totalAppointments: number;
  cancellations: number;
  lastVisit: string;
  nextAppointment?: string;
  reliability: number;
  notes: string[];
}> = {
  '612345678': {
    id: '1',
    name: 'María García López',
    phone: '612 345 678',
    email: 'maria.garcia@email.com',
    firstVisit: '2022-03-15',
    type: 'dieta',
    doctor: 'Dra. Martínez',
    totalAppointments: 24,
    cancellations: 2,
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-16T10:00:00',
    reliability: 5,
    notes: [
      'Paciente muy comprometida con el tratamiento',
      'Prefiere citas por la mañana',
      'Tiene alergia a ciertos frutos secos',
    ],
  },
  '623456789': {
    id: '2',
    name: 'Juan Martínez Ruiz',
    phone: '623 456 789',
    email: 'juan.martinez@email.com',
    firstVisit: '2023-06-20',
    type: 'estetica',
    doctor: 'Dr. López',
    totalAppointments: 8,
    cancellations: 2,
    lastVisit: '2023-12-15',
    nextAppointment: undefined,
    reliability: 3,
    notes: [
      'Ha cancelado varias veces últimamente',
      'Necesita seguimiento más cercano',
    ],
  },
  '634567890': {
    id: '3',
    name: 'Carmen Sánchez Vega',
    phone: '634 567 890',
    email: 'carmen.sanchez@email.com',
    firstVisit: '2021-09-10',
    type: 'dieta',
    doctor: 'Dra. Martínez',
    totalAppointments: 32,
    cancellations: 1,
    lastVisit: '2024-01-05',
    nextAppointment: '2024-01-16T11:45:00',
    reliability: 5,
    notes: [
      'Paciente de larga trayectoria',
      'Muy satisfecha con los resultados',
    ],
  },
};

// Mock timeline events
const mockTimelineEvents: Record<string, {
  id: string;
  type: 'appointment' | 'confirmed' | 'cancelled' | 'message' | 'call' | 'new_patient';
  date: string;
  title: string;
  description?: string;
}[]> = {
  '612345678': [
    { id: '1', type: 'new_patient', date: '2022-03-15', title: 'Primera visita', description: 'Inicio de tratamiento de dieta' },
    { id: '2', type: 'confirmed', date: '2024-01-10', title: 'Cita confirmada', description: 'Revisión mensual - asistió' },
    { id: '3', type: 'message', date: '2024-01-12', title: 'Mensaje recibido', description: 'Preguntó sobre suplementos' },
    { id: '4', type: 'confirmed', date: '2024-01-15', title: 'Próxima cita confirmada', description: 'Mañana 16/01 a las 10:00' },
  ],
  '623456789': [
    { id: '1', type: 'new_patient', date: '2023-06-20', title: 'Primera visita', description: 'Consulta estética inicial' },
    { id: '2', type: 'cancelled', date: '2023-11-10', title: 'Cita cancelada', description: 'Motivos personales' },
    { id: '3', type: 'cancelled', date: '2023-12-01', title: 'Cita cancelada', description: 'Conflicto de horario' },
    { id: '4', type: 'confirmed', date: '2023-12-15', title: 'Cita completada', description: 'Tratamiento facial' },
    { id: '5', type: 'call', date: '2024-01-14', title: 'Llamada de seguimiento', description: 'Para reprogramar cita' },
  ],
  '634567890': [
    { id: '1', type: 'new_patient', date: '2021-09-10', title: 'Primera visita', description: 'Inicio tratamiento' },
    { id: '2', type: 'confirmed', date: '2023-12-01', title: 'Cita completada', description: 'Revisión trimestral' },
    { id: '3', type: 'confirmed', date: '2024-01-05', title: 'Cita completada', description: 'Control de peso' },
    { id: '4', type: 'confirmed', date: '2024-01-15', title: 'Próxima cita confirmada', description: 'Mañana 16/01 a las 11:45' },
  ],
};

// Mock conversations
const mockConversations: Record<string, {
  id: string;
  date: string;
  summary: string;
  messages: { from: 'patient' | 'clinic'; content: string; time: string }[];
}[]> = {
  '612345678': [
    {
      id: '1',
      date: '2024-01-15',
      summary: 'Confirmación de cita para mañana',
      messages: [
        { from: 'clinic', content: 'Hola María, te recordamos tu cita mañana a las 10:00', time: '09:00' },
        { from: 'patient', content: 'Ok, perfecto. Allí estaré', time: '09:15' },
      ],
    },
    {
      id: '2',
      date: '2024-01-12',
      summary: 'Consulta sobre suplementos',
      messages: [
        { from: 'patient', content: 'Hola, ¿puedo tomar el suplemento después de comer?', time: '14:30' },
        { from: 'clinic', content: 'Sí, puedes tomarlo después del almuerzo', time: '15:00' },
        { from: 'patient', content: 'Gracias!', time: '15:05' },
      ],
    },
  ],
  '623456789': [
    {
      id: '1',
      date: '2024-01-14',
      summary: 'Llamada para reprogramar',
      messages: [
        { from: 'clinic', content: 'Hola Juan, queremos confirmar tu próxima cita', time: '10:00' },
        { from: 'patient', content: 'Necesito cambiarla, ¿tienen hueco el jueves?', time: '10:30' },
        { from: 'clinic', content: 'Sí, tenemos a las 16:00. ¿Te va bien?', time: '11:00' },
        { from: 'patient', content: 'Perfecto, gracias', time: '11:15' },
      ],
    },
  ],
  '634567890': [
    {
      id: '1',
      date: '2024-01-15',
      summary: 'Confirmación de cita',
      messages: [
        { from: 'clinic', content: 'Hola Carmen, recordatorio cita mañana 11:45', time: '18:00' },
        { from: 'patient', content: 'Vale, gracias', time: '18:30' },
      ],
    },
  ],
};

// Default patient para teléfonos no encontrados
const defaultPatient = {
  id: '0',
  name: 'Paciente Desconocido',
  phone: '000 000 000',
  email: '-',
  firstVisit: '-',
  type: 'dieta' as const,
  doctor: '-',
  totalAppointments: 0,
  cancellations: 0,
  lastVisit: '-',
  reliability: 0,
  notes: [],
};

export default function PacientePage() {
  const params = useParams();
  const router = useRouter();
  const phone = params.phone as string;
  
  const [patient, setPatient] = useState(defaultPatient);
  const [expandedConversations, setExpandedConversations] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const patientData = mockPatients[phone] || { ...defaultPatient, phone };
    setPatient(patientData);
    setNotes(patientData.notes);
  }, [phone]);

  const toggleConversation = (id: string) => {
    setExpandedConversations(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (index: number) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAskAboutPatient = () => {
    router.push(`/chat?patient=${phone}`);
  };

  const getReliabilityStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const timelineEvents = mockTimelineEvents[phone] || [];
  const conversations = mockConversations[phone] || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/pacientes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="h-3 w-3" />
              <a href={`tel:${patient.phone}`} className="hover:text-blue-600 hover:underline">
                {patient.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button 
            onClick={handleAskAboutPatient}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Brain className="h-4 w-4" />
            Preguntar sobre este paciente
          </Button>
        </div>
      </div>

      {/* Datos del paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Datos del paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Teléfono</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-400" />
                {patient.phone}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <p className="font-medium text-gray-900">{patient.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Primera visita</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(patient.firstVisit).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Tipo</p>
              <p className="font-medium">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  patient.type === 'dieta' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                )}>
                  {patient.type === 'dieta' ? 'Dieta' : 'Estética'}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Doctor</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Stethoscope className="h-4 w-4 text-gray-400" />
                {patient.doctor}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Citas totales</p>
              <p className="font-medium text-gray-900">{patient.totalAppointments}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Cancelaciones</p>
              <p className={cn(
                'font-medium',
                patient.cancellations === 0 ? 'text-green-600' :
                patient.cancellations <= 2 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {patient.cancellations}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Última cita</p>
              <p className="font-medium text-gray-900">
                {new Date(patient.lastVisit).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Próxima cita</p>
              <p className="font-medium">
                {patient.nextAppointment ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(patient.nextAppointment).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ) : (
                  <span className="text-gray-400">Sin cita programada</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase">Fiabilidad</p>
              <div className="flex items-center gap-2">
                {getReliabilityStars(patient.reliability)}
                <span className="text-sm text-gray-500">({patient.reliability}/5)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de interacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Historial de interacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline events={timelineEvents} />
        </CardContent>
      </Card>

      {/* Conversaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Conversaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleConversation(conversation.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(conversation.date).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-sm text-gray-600">{conversation.summary}</span>
                  </div>
                  {expandedConversations.includes(conversation.id) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {expandedConversations.includes(conversation.id) && (
                  <div className="p-3 space-y-2">
                    {conversation.messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex gap-2',
                          message.from === 'patient' ? 'flex-row' : 'flex-row-reverse'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                            message.from === 'patient'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          )}
                        >
                          <p>{message.content}</p>
                          <p className={cn(
                            'text-xs mt-1',
                            message.from === 'patient' ? 'text-gray-500' : 'text-blue-200'
                          )}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {conversations.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              No hay conversaciones registradas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notas internas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Notas internas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div 
                key={index} 
                className="flex items-start justify-between gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <p className="text-sm text-gray-700">{note}</p>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Añadir nueva nota..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button onClick={handleAddNote} className="gap-2">
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
