import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos de demostración...')

  // ============================================
  // LIMPIAR DATOS EXISTENTES
  // ============================================
  console.log('🧹 Limpiando datos existentes...')
  await prisma.chatHistory.deleteMany({})
  await prisma.patientNote.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.appointment.deleteMany({})
  await prisma.dailyReport.deleteMany({})
  await prisma.patient.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.clinicSettings.deleteMany({})

  // ============================================
  // 1. CREAR USUARIO ADMIN
  // ============================================
  console.log('👤 Creando usuario admin...')
  await prisma.user.create({
    data: {
      email: 'admin@clinica.com',
      name: 'Administrador',
      password: '$2b$10$YourHashedPasswordHere', // En producción usar bcrypt
      role: 'admin',
      isActive: true,
    },
  })

  // ============================================
  // 2. CREAR CONFIGURACIÓN DE CLÍNICA
  // ============================================
  console.log('🏥 Creando configuración de clínica...')
  await prisma.clinicSettings.create({
    data: {
      clinicName: 'Clínica Dr. Sergio',
      phoneNumber: '+34900123456',
      address: 'Calle Principal 123, Madrid',
      openingHours: {
        monday: { open: '09:00', close: '14:00', afternoon: { open: '16:00', close: '20:00' } },
        tuesday: { open: '09:00', close: '14:00', afternoon: { open: '16:00', close: '20:00' } },
        wednesday: { open: '09:00', close: '14:00', afternoon: { open: '16:00', close: '20:00' } },
        thursday: { open: '09:00', close: '14:00', afternoon: { open: '16:00', close: '20:00' } },
        friday: { open: '09:00', close: '14:00' },
      },
      appointmentDuration: 30,
    },
  })

  // ============================================
  // 3. CREAR PACIENTES (18 pacientes)
  // ============================================
  console.log('👥 Creando 18 pacientes...')
  
  const patientsData = [
    {
      phone: '34667490504',
      name: 'Elena Aguado Gutiérrez',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'Tiene tendencia a cancelar a última hora',
    },
    {
      phone: '34649492628',
      name: 'Rafael Sánchez Sánchez',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34637447135',
      name: 'Maria Francisca Pérez Fernández',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34618906617',
      name: 'Francisco Javier Criado García',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'Prefiere citas por la tarde',
    },
    {
      phone: '34645975355',
      name: 'Carmen Meca Gomez',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34685518181',
      name: 'Mercedes Alcaina Rodríguez',
      type: 'estetica',
      doctor: 'Dra. Violeta',
      notes: 'Paciente de medicina estética',
    },
    {
      phone: '34695264499',
      name: 'Irene Pineda Ortiz',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34643787019',
      name: 'Silvia Valdivia Rosales',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'Tratamiento con Mounjaro',
    },
    {
      phone: '34645906518',
      name: 'Eva Maria Madero Pérez',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'En espera de cita para semana del 16',
    },
    {
      phone: '34676986628',
      name: 'Yolanda Rubi Rubio',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34687823194',
      name: 'Nadina Rodriguez Romero',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34661245686',
      name: 'María José Casas Molina',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'Llega tarde por dejar al niño en el colegio',
    },
    {
      phone: '34665278525',
      name: 'Patricia Barco Luque',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34633859904',
      name: 'Pilar Gomez Gargel',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34650892700',
      name: 'Samuel Bedmar Fernández',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34645745681',
      name: 'Sara Martínez Gómez',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34686490431',
      name: 'Elida Lusffi',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: null,
    },
    {
      phone: '34682555323',
      name: 'Francisco Castro Martín',
      type: 'dieta',
      doctor: 'Dr. Sergio',
      notes: 'Paciente nuevo',
    },
  ]

  const createdPatients: Record<string, any> = {}
  
  for (const patientData of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        phone: patientData.phone,
        name: patientData.name,
        type: patientData.type,
        doctor: patientData.doctor,
        notes: patientData.notes,
        isActive: true,
        dateOfBirth: new Date('1980-01-01'),
      },
    })
    createdPatients[patientData.phone] = patient
    console.log(`  ✓ Paciente creado: ${patient.name}`)
  }

  // ============================================
  // 4. CREAR CITAS (Appointments)
  // ============================================
  console.log('📅 Creando citas...')

  const appointmentsData = [
    // Citas para el 4 de febrero 2026 (mañana del informe)
    { phone: '34661245686', date: '2026-02-04T09:00:00', status: 'confirmed', reason: 'Control mensual', notes: 'Llegará un poco tarde por dejar al niño en el colegio' },
    { phone: '34645745681', date: '2026-02-04T09:00:00', status: 'confirmed', reason: 'Control mensual', notes: '' },
    { phone: '34676986628', date: '2026-02-04T10:00:00', status: 'cancelled', reason: 'Control mensual', notes: 'Canceló: niña enferma' },
    { phone: '34633859904', date: '2026-02-04T10:30:00', status: 'confirmed', reason: 'Control mensual', notes: '' },
    { phone: '34665278525', date: '2026-02-04T11:00:00', status: 'confirmed', reason: 'Control mensual', notes: '' },
    { phone: '34667490504', date: '2026-02-04T11:30:00', status: 'cancelled', reason: 'Control mensual', notes: 'Canceló: imprevisto personal' },
    { phone: '34650892700', date: '2026-02-04T12:00:00', status: 'confirmed', reason: 'Control mensual', notes: '' },
    { phone: '34637447135', date: '2026-02-04T12:30:00', status: 'pending', reason: 'Control mensual', notes: 'Sin confirmar' },
    
    // Cita reagendada de Yolanda
    { phone: '34676986628', date: '2026-02-11T10:00:00', status: 'confirmed', reason: 'Control mensual', notes: 'Reagendada desde el 4 de febrero' },
    
    // Citas futuras
    { phone: '34695264499', date: '2026-02-25T17:00:00', status: 'confirmed', reason: 'Evaluación con Dra. Violeta', notes: '' },
    { phone: '34687823194', date: '2026-02-09T09:00:00', status: 'confirmed', reason: 'Control mensual', notes: 'Semana que viene' },
    
    // Citas pasadas para historial
    { phone: '34667490504', date: '2026-01-13T11:00:00', status: 'completed', reason: 'Control mensual', notes: 'Pérdida de 1.5kg' },
    { phone: '34667490504', date: '2025-12-15T11:00:00', status: 'cancelled', reason: 'Control mensual', notes: 'Canceló sin especificar motivo' },
    { phone: '34667490504', date: '2025-11-20T11:00:00', status: 'completed', reason: 'Control mensual', notes: 'Pérdida de 2kg' },
    { phone: '34667490504', date: '2025-10-15T11:00:00', status: 'completed', reason: 'Primera visita', notes: 'Inicio de tratamiento' },
  ]

  for (const appt of appointmentsData) {
    const patient = createdPatients[appt.phone]
    if (patient) {
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          date: new Date(appt.date),
          status: appt.status,
          reason: appt.reason,
          notes: appt.notes,
          duration: 30,
        },
      })
    }
  }
  console.log(`  ✓ ${appointmentsData.length} citas creadas`)

  // ============================================
  // 5. CREAR MENSAJES (Simulando conversaciones del 3 feb)
  // ============================================
  console.log('💬 Creando mensajes de conversaciones...')

  const messagesData = [
    // Elena Aguado - Cancelación
    { phone: '34667490504', type: 'incoming', content: 'Hola Noelia, confirmo que mañana voy a las 11:30. Gracias', sentAt: '2026-02-03T10:30:00' },
    { phone: '34667490504', type: 'outgoing', content: 'Perfecto Elena, te esperamos mañana a las 11:30. Un saludo!', sentAt: '2026-02-03T10:35:00' },
    { phone: '34667490504', type: 'incoming', content: 'Hola Noelia, me ha surgido un imprevisto. Me puedes dar cita para otro día, por favor?', sentAt: '2026-02-03T14:14:00' },
    
    // Rafael Sánchez - Pide cita urgente
    { phone: '34649492628', type: 'incoming', content: 'Hola, soy Rafael Sánchez. Voy a estar por aquí esta semana y la que viene y quería pedir cita. Es urgente. Gracias', sentAt: '2026-02-03T09:15:00' },
    
    // Maria Francisca - Dudosa asistencia
    { phone: '34637447135', type: 'incoming', content: 'Hola Noelia, te envío esta foto. Le han suspendido las clases a mi peque...', sentAt: '2026-02-03T16:45:00' },
    
    // Francisco Javier - Rechaza cita
    { phone: '34618906617', type: 'outgoing', content: 'Buenos días Fco. Javier, ¿le viene bien mañana 4 de febrero a las 9:00?', sentAt: '2026-02-03T09:00:00' },
    { phone: '34618906617', type: 'incoming', content: 'No, a esa hora no puedo. Ya tiene que ser por la tarde, fecha más cercana desde lunes semana que viene.', sentAt: '2026-02-03T09:30:00' },
    
    // Carmen Meca - Quiere otra semana
    { phone: '34645975355', type: 'outgoing', content: 'Hola Carmen, le ofrezco jueves 5 de febrero a las 18:30 o si prefiere puede esperar a la semana siguiente.', sentAt: '2026-02-03T11:00:00' },
    { phone: '34645975355', type: 'incoming', content: 'Mejor la próxima semana menos el 12', sentAt: '2026-02-03T11:30:00' },
    
    // Mercedes Alcaina - Foto para doctor
    { phone: '34685518181', type: 'incoming', content: 'Hola Noelia, te envío esta foto. Es raro porque nunca me había pasado esto con el tratamiento.', sentAt: '2026-02-03T14:00:00' },
    { phone: '34685518181', type: 'outgoing', content: 'Gracias Mercedes, se la enseñaré al doctor y te digo algo.', sentAt: '2026-02-03T14:30:00' },
    
    // Irene Pineda - Evaluación Violeta
    { phone: '34695264499', type: 'outgoing', content: 'Hola Irene, ¿le interesaría una cita de evaluación con la Dra. Violeta?', sentAt: '2026-02-03T10:00:00' },
    
    // Silvia Valdivia - Mounjaro
    { phone: '34643787019', type: 'incoming', content: 'Hola Noelia, me queda una dosis de Mounjaro. ¿Puedo ir antes a ponérmelo?', sentAt: '2026-02-03T13:00:00' },
    { phone: '34643787019', type: 'outgoing', content: 'Claro Silvia, tráigalo y se lo ponemos. ¿Se lo pongo yo o prefiere que se lo ponga Sergio?', sentAt: '2026-02-03T13:15:00' },
    
    // Eva Maria Madero - En espera
    { phone: '34645906518', type: 'outgoing', content: 'Hola Eva María, todavía no tengo hueco para la semana del 16 pero en cuanto lo tenga le aviso.', sentAt: '2026-02-03T12:00:00' },
    { phone: '34645906518', type: 'incoming', content: 'Estoy pendiente. Gracias!!!', sentAt: '2026-02-03T12:30:00' },
    
    // Yolanda Rubi - Cancela y reagenda
    { phone: '34676986628', type: 'incoming', content: 'Hola Noelia, tengo a la niña mala y no puedo venir mañana. Lo siento mucho.', sentAt: '2026-02-03T15:00:00' },
    { phone: '34676986628', type: 'outgoing', content: 'No te preocupes Yolanda. ¿Te viene bien el miércoles 11 a las 10:00?', sentAt: '2026-02-03T15:30:00' },
    { phone: '34676986628', type: 'incoming', content: 'Sí, perfecto. Gracias!', sentAt: '2026-02-03T15:45:00' },
    
    // Nadina Rodriguez - Confirma cambio
    { phone: '34687823194', type: 'outgoing', content: 'Hola Nadina, si hay hueco la semana que viene a las 9:00, ¿le viene bien?', sentAt: '2026-02-03T11:30:00' },
    { phone: '34687823194', type: 'incoming', content: 'Ok', sentAt: '2026-02-03T12:00:00' },
    
    // María José Casas - Llega tarde
    { phone: '34661245686', type: 'outgoing', content: 'Hola María José, le recuerdo su cita mañana a las 9:00.', sentAt: '2026-02-03T17:00:00' },
    { phone: '34661245686', type: 'incoming', content: 'Sí, llegaré unos minutos tarde porque tengo que dejar al niño en el cole. De acuerdo, gracias', sentAt: '2026-02-03T17:30:00' },
    
    // Patricia Barco - Confirma
    { phone: '34665278525', type: 'outgoing', content: 'Hola Patricia, le recuerdo su cita mañana a las 11:00.', sentAt: '2026-02-03T18:00:00' },
    { phone: '34665278525', type: 'incoming', content: 'Síii perdona. Ok', sentAt: '2026-02-03T18:15:00' },
    
    // Pilar Gomez - Confirma
    { phone: '34633859904', type: 'outgoing', content: 'Hola Pilar, mañana tiene cita a las 10:30.', sentAt: '2026-02-03T16:00:00' },
    { phone: '34633859904', type: 'incoming', content: 'Vale', sentAt: '2026-02-03T16:30:00' },
    
    // Samuel Bedmar - Confirma
    { phone: '34650892700', type: 'outgoing', content: 'Hola Samuel, le recordamos su cita mañana a las 12:00.', sentAt: '2026-02-03T17:00:00' },
    { phone: '34650892700', type: 'incoming', content: 'ok', sentAt: '2026-02-03T17:15:00' },
    
    // Sara Martínez - Confirma
    { phone: '34645745681', type: 'outgoing', content: 'Hola Sara, mañana tiene cita a las 9:00.', sentAt: '2026-02-03T18:00:00' },
    { phone: '34645745681', type: 'incoming', content: 'Si', sentAt: '2026-02-03T18:30:00' },
    
    // Elida Lusffi - Consulta resuelta
    { phone: '34686490431', type: 'incoming', content: 'Hola Noelia, ¿puedo comer arándanos en la dieta?', sentAt: '2026-02-03T10:00:00' },
    { phone: '34686490431', type: 'outgoing', content: 'Hola Elida, sí puedes comer arándanos, son muy saludables. Con moderación.', sentAt: '2026-02-03T10:30:00' },
    { phone: '34686490431', type: 'incoming', content: 'Gracias!', sentAt: '2026-02-03T10:45:00' },
  ]

  for (const msg of messagesData) {
    const patient = createdPatients[msg.phone]
    if (patient) {
      await prisma.message.create({
        data: {
          patientId: patient.id,
          type: msg.type,
          content: msg.content,
          status: 'read',
          sentAt: new Date(msg.sentAt),
        },
      })
    }
  }
  console.log(`  ✓ ${messagesData.length} mensajes creados`)

  // ============================================
  // 6. CREAR NOTAS INTERNAS DE PACIENTES
  // ============================================
  console.log('📝 Creando notas internas...')

  const notesData = [
    { phone: '34667490504', content: 'Tiene tendencia a cancelar a última hora. Segunda cancelación en 2 meses.', createdBy: 'Noelia' },
    { phone: '34667490504', content: 'Paciente con baja fiabilidad (50% asistencia). Considerar lista de espera.', createdBy: 'Dr. Sergio' },
    { phone: '34618906617', content: 'Prefiere citas por la tarde desde el 9 de febrero. Pendiente buscar hueco.', createdBy: 'Noelia' },
    { phone: '34645906518', content: 'Paciente en espera para semana del 16 de febrero por las mañanas.', createdBy: 'Noelia' },
    { phone: '34643787019', content: 'Tratamiento con Mounjaro. Trae su propia medicación.', createdBy: 'Noelia' },
    { phone: '34661245686', content: 'Siempre llega 5-10 minutos tarde por dejar al niño en el colegio.', createdBy: 'Noelia' },
  ]

  for (const note of notesData) {
    const patient = createdPatients[note.phone]
    if (patient) {
      await prisma.patientNote.create({
        data: {
          patientId: patient.id,
          content: note.content,
          createdBy: note.createdBy,
        },
      })
    }
  }
  console.log(`  ✓ ${notesData.length} notas internas creadas`)

  // ============================================
  // 7. CREAR INFORME DIARIO (3 de febrero 2026)
  // ============================================
  console.log('📊 Creando informe diario del 3 de febrero 2026...')

  const reportMd = `# 📋 Informe Diario — 3 de febrero 2026
**Generado:** 18:00 | **Conversaciones:** 18 | **Pacientes:** 18

---

## 📊 RESUMEN EJECUTIVO

• **18 conversaciones activas** durante el día
• **6 citas confirmadas** para mañana 4 de febrero
• **2 cancelaciones** (1 reagendada, 1 pendiente de nueva cita)
• **3 pacientes sin confirmar** cambio de cita
• **8 acciones pendientes** para Noelia
• **1 consulta médica pendiente** (foto para el doctor)

---

## 🔴 URGENTE — Requiere acción inmediata (4)

### 1. Elena Aguado Gutiérrez · 667 490 504
> Tenía cita mañana 4 feb. Confirma por la mañana. A las 14:14 cancela: "me ha surgido un imprevisto. Me puedes dar cita para otro día, por favor?"

🏷️ **Estado:** Cancelada SIN nueva cita  
⚡ **Acción:** Dar nueva cita

---

### 2. Rafael Sánchez Sánchez · 649 492 628
> Escribe pidiendo cita urgente: "voy a estar por aquí esta semana y la que viene". Solo recibió respuesta automática. No se le ha respondido.

🏷️ **Estado:** Sin respuesta  
⚡ **Acción:** Darle cita esta semana

---

### 3. Maria Francisca Pérez Fernández · 637 447 135
> Tiene cita mañana 4 feb. Envía foto + mensaje: "Le han suspendido las clases a mi peque..." No queda claro si viene o no. Sin respuesta.

🏷️ **Estado:** Dudosa asistencia mañana  
⚡ **Acción:** Confirmar si acude mañana

---

### 4. Francisco Javier Criado García · 618 906 617
> Se le ofrece cita mañana 4 feb 9:00. Rechaza: "No, a esa hora no puedo. Ya tiene que ser por la tarde, fecha más cercana desde lunes semana que viene." SIN RESPUESTA de la consulta.

🏷️ **Estado:** Rechazó propuesta, sin nueva oferta  
⚡ **Acción:** Buscar cita por la tarde desde 9 feb

---

## 🟡 PENDIENTE — Seguimiento necesario (5)

### 5. Carmen Meca Gomez · 645 975 355
Se ofrece jueves 5 feb 18:30 o espera. Responde: "Mejor la próxima semana menos el 12".  
Sin respuesta de consulta.  
⚡ Buscar cita tarde semana del 9, no el 12.

---

### 6. Mercedes Alcaina Rodríguez · 685 518 181 (Violeta)
Envía foto con duda sobre tratamiento estético. "Es raro, porque nunca me había pasado". Noelia dice que lo consultará con el doctor.  
⚡ Sergio debe ver la foto y responder.

---

### 7. Irene Pineda Ortiz · 695 264 499
Noelia le pregunta si quiere cita evaluación con Dra. Violeta. Sin respuesta aún.  
⚡ Esperar respuesta.

---

### 8. Silvia Valdivia Rosales · 643 787 019
Pide ir antes a ponerse el Mounjaro que le queda. Noelia le dice que lo traiga. Pendiente: ¿se lo pone Noelia o Sergio?  
⚡ Esperar confirmación de Silvia.

---

### 9. Eva Maria Madero Pérez · 645 906 518
En espera para semana del 16 feb (mañanas). "Estoy pendiente. Gracias!!!"  
⚡ Avisar cuando haya hueco.

---

## ✅ CONFIRMADOS — Dijeron "Ok" / confirmaron (7)

| Paciente | Confirmación |
|----------|-------------|
| **Nadina Rodriguez Romero** | "Ok" a cambio de cita a semana que viene |
| **María José Casas Molina** | Llegará tarde (deja niño en cole) - "De acuerdo, gracias" |
| **Patricia Barco Luque** | "Síii perdona. Ok" |
| **Pilar Gomez Gargel** | "Vale" |
| **Samuel Bedmar Fernández** | "ok" |
| **Sara Martínez Gómez** | "Si" |
| **Elida Lusffi** | Consulta sobre arándanos resuelta - "Gracias" |

---

## ❌ CANCELADOS SIN PRÓXIMA CITA (1)

### Elena Aguado Gutiérrez · 667 490 504
❌ **Motivo:** "Me ha surgido un imprevisto"  
⚠️ **SIN nueva cita** — pendiente reagendar

---

## ⚠️ SIN CONFIRMAR CAMBIO DE CITA (3)

1. **Fco. Javier Criado** — Rechazó 4 feb 9:00 → Quiere tarde desde 9 feb → **SIN RESPUESTA DE CONSULTA**
2. **Carmen Meca** — Rechazó 5 feb → Quiere sem. 9 (no 12) → **SIN RESPUESTA DE CONSULTA**
3. **Silvia Valdivia** — Pide ir antes a ponerse Mounjaro → Pendiente confirmar quién se lo pone

---

## ⚫ NO ACUDEN — Cancelaron cita (2)

### 1. Yolanda Rubi Rubio · 676 986 628
❌ **Motivo:** "Tengo a la niña mala"  
✅ **Reagendada:** Miércoles 11 feb 10:00

### 2. Elena Aguado Gutiérrez · 667 490 504
❌ **Motivo:** "Me ha surgido un imprevisto"  
⚠️ **SIN nueva cita** — pendiente reagendar

---

## 🟢 RESUELTO (1)

### Elida Lusffi · 686 490 431
Consulta sobre productos de dieta (arándanos). Noelia le respondió. "Gracias". Resuelto.

---

## 📌 RESUMEN DE TAREAS PENDIENTES NOELIA

### 🔴 URGENTES (4)
1. Dar cita a **Rafael Sánchez** (urgente, esta semana)
2. Reagendar **Elena Aguado** (canceló mañana)
3. Confirmar si **Maria Francisca** viene mañana
4. Responder a **Fco. Javier** con cita por la tarde

### 🟡 PUEDEN ESPERAR (4)
5. Buscar cita tarde **Carmen Meca** (sem 9, no el 12)
6. Enseñar foto de **Mercedes** a Sergio
7. Esperar respuesta **Irene Pineda** (eval. Violeta)
8. Confirmar con **Silvia**: Mounjaro mañana

---

*Informe generado automáticamente por el sistema de WhatsApp de la clínica.*`

  const stats = {
    total_conversations: 18,
    urgent: 4,
    pending: 5,
    resolved: 1,
    no_show: 2,
    confirmed_ok: 7,
    confirmed_names: ['Nadina Rodriguez', 'María José Casas', 'Patricia Barco', 'Pilar Gomez', 'Samuel Bedmar', 'Sara Martínez', 'Elida Lusffi'],
    cancelled_no_next: 1,
    cancelled_no_next_names: ['Elena Aguado'],
    unconfirmed_changes: 3,
    pending_tasks_noelia: 8,
  }

  const appointments = [
    { time: '09:00', patient_name: 'María José Casas', status: 'confirmed', notes: 'Llega un poco tarde por dejar niño en cole' },
    { time: '09:00', patient_name: 'Sara Martínez', status: 'confirmed', notes: '' },
    { time: '10:00', patient_name: 'Yolanda Rubi', status: 'cancelled', notes: 'Cancelada → Reagendada 11 feb' },
    { time: '10:30', patient_name: 'Pilar Gomez', status: 'confirmed', notes: '' },
    { time: '11:00', patient_name: 'Patricia Barco', status: 'confirmed', notes: '' },
    { time: '11:30', patient_name: 'Elena Aguado', status: 'cancelled', notes: 'Cancelada → Pendiente reagendar' },
    { time: '12:00', patient_name: 'Samuel Bedmar', status: 'confirmed', notes: '' },
    { time: '12:30', patient_name: 'Maria Francisca Pérez', status: 'unconfirmed', notes: 'Sin confirmar' },
  ]

  const pendingTasks = [
    { task: 'Dar cita a Rafael Sánchez (quiere esta semana)', priority: 'high', patient_name: 'Rafael Sánchez' },
    { task: 'Reagendar Elena Aguado (canceló mañana)', priority: 'high', patient_name: 'Elena Aguado' },
    { task: 'Responder a Maria Francisca (¿viene mañana?)', priority: 'high', patient_name: 'Maria Francisca Pérez' },
    { task: 'Buscar cita tarde Fco. Javier (desde 9 feb)', priority: 'high', patient_name: 'Francisco Javier Criado' },
    { task: 'Buscar cita tarde Carmen Meca (sem 9, no el 12)', priority: 'medium', patient_name: 'Carmen Meca' },
    { task: 'Foto Mercedes → enseñar a Sergio', priority: 'medium', patient_name: 'Mercedes Alcaina' },
    { task: 'Esperar respuesta Irene Pineda (eval. Violeta)', priority: 'medium', patient_name: 'Irene Pineda' },
    { task: 'Confirmar Silvia: ¿Noelia o Sergio pone Mounjaro?', priority: 'medium', patient_name: 'Silvia Valdivia' },
  ]

  const cancelledWithoutNext = [
    { patient_name: 'Elena Aguado', reason: 'Me ha surgido un imprevisto', last_message: 'Me puedes dar cita para otro día, por favor?' },
  ]

  const unconfirmedChanges = [
    { patient_name: 'Francisco Javier Criado', proposed: '4 feb 9:00', rejected_reason: 'No puede por la mañana', waiting_for: 'clinic' },
    { patient_name: 'Carmen Meca', proposed: '5 feb 18:30', rejected_reason: 'Quiere semana 9, no el 12', waiting_for: 'clinic' },
    { patient_name: 'Silvia Valdivia', proposed: 'Ir antes a ponerse Mounjaro', rejected_reason: 'Pendiente confirmar quién se lo pone', waiting_for: 'patient' },
  ]

  await prisma.dailyReport.create({
    data: {
      date: new Date('2026-02-03'),
      content: reportMd,
      totalAppointments: 8,
      confirmedAppointments: 6,
      cancelledAppointments: 2,
      completedAppointments: 0,
      pendingAppointments: 1,
      noShowAppointments: 2,
      urgentCount: 4,
      newPatients: 0,
      totalMessages: 42,
      incomingMessages: 24,
      outgoingMessages: 18,
      generatedBy: 'system',
    },
  })
  console.log('  ✓ Informe diario creado')

  // ============================================
  // 8. CREAR HISTORIAL DE CHAT (Preguntas y respuestas)
  // ============================================
  console.log('💬 Creando historial de chat...')

  const chatHistoryData = [
    {
      question: '¿Quién canceló hoy y por qué?',
      answer: 'Cancelaron 2 pacientes hoy:\n\n• **Yolanda Rubi** — su niña está enferma. Ya ha sido reagendada al 11 de febrero a las 10:00.\n\n• **Elena Aguado** — imprevisto personal. Pendiente de nueva cita.',
      contextType: 'report',
      contextId: '2026-02-03',
    },
    {
      question: '¿Cuántas veces ha cancelado Elena en los últimos 3 meses?',
      answer: 'Elena Aguado ha cancelado **2 veces** en los últimos 3 meses:\n\n• **15 de diciembre 2025** — motivo no especificado\n• **3 de febrero 2026** — imprevisto personal\n\n**Tasa de asistencia: 50%** (2 de 4 citas) — ⚠️ Paciente con baja fiabilidad.',
      contextType: 'patient',
      contextId: '34667490504',
    },
    {
      question: '¿Hay pacientes que dijeron "ya te aviso" y no tienen cita puesta?',
      answer: 'Sí, hay **2 pacientes** en situación "ya te aviso":\n\n• **Eva María Madero** — espera cita para la semana del 16 de febrero (mañanas)\n\n• **Francisco Javier Criado** — quiere cita por la tarde desde el 9 de febrero. Lleva desde el 28 de enero sin cita firme.',
      contextType: 'report',
      contextId: '2026-02-03',
    },
    {
      question: '¿Cuántas citas tenemos confirmadas para mañana?',
      answer: 'Tenemos **6 citas confirmadas** para mañana 4 de febrero:\n\n1. **09:00** — María José Casas (llega tarde)\n2. **09:00** — Sara Martínez\n3. **10:30** — Pilar Gomez\n4. **11:00** — Patricia Barco\n5. **12:00** — Samuel Bedmar\n6. **12:30** — Maria Francisca Pérez (sin confirmar)\n\n⚠️ **Nota:** Yolanda Rubi y Elena Aguado cancelaron.',
      contextType: 'report',
      contextId: '2026-02-03',
    },
    {
      question: '¿Qué tareas urgentes tiene Noelia pendientes?',
      answer: 'Noelia tiene **4 tareas urgentes** pendientes:\n\n🔴 **1.** Dar cita a **Rafael Sánchez** (quiere esta semana)\n🔴 **2.** Reagendar **Elena Aguado** (canceló mañana)\n🔴 **3.** Confirmar si **Maria Francisca** viene mañana\n🔴 **4.** Responder a **Fco. Javier** con cita por la tarde (desde 9 feb)',
      contextType: 'report',
      contextId: '2026-02-03',
    },
  ]

  for (const chat of chatHistoryData) {
    await prisma.chatHistory.create({
      data: {
        question: chat.question,
        answer: chat.answer,
        contextType: chat.contextType,
        contextId: chat.contextId,
      },
    })
  }
  console.log(`  ✓ ${chatHistoryData.length} conversaciones de chat creadas`)

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n' + '='.repeat(50))
  console.log('✅ SEED COMPLETADO EXITOSAMENTE')
  console.log('='.repeat(50))
  console.log('📊 Datos creados:')
  console.log(`   • 1 usuario admin`)
  console.log(`   • 1 configuración de clínica`)
  console.log(`   • ${patientsData.length} pacientes`)
  console.log(`   • ${appointmentsData.length} citas`)
  console.log(`   • ${messagesData.length} mensajes`)
  console.log(`   • ${notesData.length} notas internas`)
  console.log(`   • 1 informe diario (3 feb 2026)`)
  console.log(`   • ${chatHistoryData.length} conversaciones de chat`)
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
