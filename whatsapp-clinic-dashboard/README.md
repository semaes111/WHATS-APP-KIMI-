# WhatsApp Clinic Dashboard

Dashboard web conectado a n8n que genera automáticamente informes diarios del WhatsApp de la consulta, almacena históricos por día y por paciente, y permite interrogar los datos mediante chat con IA.

![Dashboard Preview](https://via.placeholder.com/800x400?text=WhatsApp+Clinic+Dashboard)

## 🎯 Características

- **📊 Dashboard Principal**: KPIs en tiempo real, citas del día, pendientes
- **📋 Informes Diarios**: Generación automática de informes con clasificación por prioridad
- **💬 Chat Interrogador**: Consulta los datos usando lenguaje natural con Claude AI
- **👥 Gestión de Pacientes**: Fichas completas con historial de interacciones
- **📅 Histórico**: Calendario con informes pasados y tendencias
- **🔐 Autenticación Simple**: Código de acceso único con JWT

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO DE DATOS                            │
│                                                              │
│  WhatsApp ←→ Evolution API                                   │
│                    │                                         │
│                    │ webhook (cada mensaje)                   │
│                    ▼                                         │
│               ┌─────────┐                                    │
│               │   n8n    │ ◄── CEREBRO CENTRAL               │
│               └────┬────┘                                    │
│                    │                                         │
│         ┌─────────┼──────────┐                               │
│         ▼         ▼          ▼                               │
│   Claude Haiku  PostgreSQL  Telegram                         │
│   (resúmenes)  (Supabase)  (alertas)                        │
│                    │                                         │
│                    ▼                                         │
│            ┌──────────────┐                                  │
│            │  Dashboard   │ ◄── SOLO LECTURA + CHAT          │
│            │  (Next.js)   │                                  │
│            └──────────────┘                                  │
│                    │                                         │
│                    ▼                                         │
│             Claude Sonnet                                    │
│             (chat interrogador)                              │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación Rápida

### 1. Clonar y Instalar Dependencias

```bash
cd whatsapp-clinic-dashboard
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

Variables requeridas:
- `DATABASE_URL`: URL de PostgreSQL
- `ACCESS_CODE`: Código de acceso para login
- `JWT_SECRET`: Secret para firmar tokens
- `ANTHROPIC_API_KEY`: API key de Claude (para chat)

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Cargar datos de demostración
npx prisma db seed
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
whatsapp-clinic-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/              # Página de login
│   ├── (dashboard)/
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── informe/[fecha]/    # Informe diario
│   │   ├── chat/               # Chat interrogador
│   │   ├── pacientes/          # Listado de pacientes
│   │   ├── paciente/[phone]/   # Ficha de paciente
│   │   └── historico/          # Histórico de informes
│   ├── api/
│   │   ├── auth/               # Autenticación
│   │   ├── dashboard/          # Datos del dashboard
│   │   ├── patients/           # CRUD pacientes
│   │   ├── reports/            # Informes
│   │   └── chat/               # Chat con IA
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Componentes base
│   └── layout/                 # Layout components
├── lib/
│   ├── prisma.ts               # Cliente Prisma
│   ├── auth.ts                 # Utilidades JWT
│   └── utils.ts                # Utilidades
├── prisma/
│   ├── schema.prisma           # Schema de BD
│   └── seed.ts                 # Datos de demo
├── types/
│   └── index.ts                # Tipos TypeScript
└── middleware.ts               # Protección de rutas
```

## 📱 Pantallas

### 1. Dashboard Principal (`/`)
- KPIs: Urgente, Pendiente, Resuelto, No acude
- Citas de mañana con estados
- Confirmados con "OK"
- Cancelados sin próxima cita
- Pendientes de Noelia (priorizados)

### 2. Informe Diario (`/informe/:fecha`)
- Resumen ejecutivo
- Pacientes urgentes (🔴)
- Pendientes (🟡)
- Confirmados (✅)
- Cancelados sin cita
- Tareas pendientes de Noelia

### 3. Chat Interrogador (`/chat`)
- Preguntas en lenguaje natural
- Contexto: Informe, Paciente o General
- Historial de conversaciones
- Respuestas basadas en datos reales

### 4. Ficha de Paciente (`/paciente/:phone`)
- Datos del paciente
- Historial de interacciones
- Conversaciones por fecha
- Notas internas

### 5. Listado de Pacientes (`/pacientes`)
- Búsqueda y filtros
- Estadísticas de cancelaciones
- Próximas citas

### 6. Histórico (`/historico`)
- Calendario con informes
- Tendencias semanales
- Navegación por fechas

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth` | Login con código |
| GET | `/api/auth` | Verificar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |

### Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard?date=` | Datos del dashboard |

### Pacientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/patients` | Listar pacientes |
| GET | `/api/patients/:phone` | Ficha del paciente |
| PUT | `/api/patients/:phone` | Actualizar paciente |
| GET | `/api/patients/:phone/conversations` | Conversaciones |
| POST | `/api/patients/:phone/notes` | Añadir nota |

### Informes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reports` | Listar informes |
| GET | `/api/reports/:date` | Informe específico |
| POST | `/api/reports/generate` | Generar informe |

### Chat
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/chat` | Preguntar a IA |
| GET | `/api/chat/history` | Historial |

## 🗄️ Base de Datos

### Modelos Principales

**Patient**: Pacientes de la clínica
**ConversationSummary**: Resúmenes diarios de conversaciones
**DailyReport**: Informes diarios generados
**ChatHistory**: Historial del chat interrogador
**PatientNote**: Notas internas de pacientes

Ver `prisma/schema.prisma` para el schema completo.

## 🔐 Autenticación

El sistema usa autenticación simple basada en código:

1. Usuario ingresa el código de acceso definido en `ACCESS_CODE`
2. Se genera un JWT con expiración de 24h
3. El token se almacena en cookie httpOnly
4. El middleware protege las rutas del dashboard

## 🤖 Integración con Claude AI

### Chat Interrogador

El chat usa Claude Sonnet para responder preguntas sobre:
- Informes diarios
- Fichas de pacientes
- Estadísticas y tendencias
- Historial de conversaciones

### Contextos Soportados

- **Informe**: Preguntas sobre un día específico
- **Paciente**: Preguntas sobre un paciente específico
- **General**: Preguntas generales sobre los datos

## 🎨 Personalización

### Colores

Los colores se definen en `tailwind.config.js`:

```javascript
colors: {
  medical: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',  // Azul médico principal
    700: '#1d4ed8',
  },
  status: {
    urgent: '#ef4444',    // 🔴 Rojo
    pending: '#f59e0b',   // 🟡 Amarillo
    resolved: '#22c55e',  // 🟢 Verde
    no_show: '#374151',   // ⚫ Gris
  }
}
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Base de datos
npx prisma generate      # Generar cliente
npx prisma migrate dev   # Crear migración
npx prisma db seed       # Cargar datos demo
npx prisma studio        # Explorar BD

# Linting
npm run lint
```

## 🧪 Datos de Demostración

El seed incluye:
- 18 pacientes de ejemplo
- Conversaciones del 3 de febrero 2026
- Informe diario completo
- Notas internas
- Historial de chat

Para cargar:
```bash
npx prisma db seed
```

## 🚀 Despliegue

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables en tu plataforma de despliegue:
- `DATABASE_URL`
- `ACCESS_CODE`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Build

```bash
npm run build
```

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o PR.

## 📞 Soporte

Para soporte o preguntas, contacta al desarrollador.

---

**Desarrollado con ❤️ para el Dr. Sergio y su equipo**