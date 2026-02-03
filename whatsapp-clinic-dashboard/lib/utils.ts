import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind CSS de manera condicional
 * Utiliza clsx para condicionales y tailwind-merge para evitar conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha a string legible
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric',
  };

  if (format === 'time' || format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('es-ES', options);
}

/**
 * Formatea un número de teléfono para mostrar
 */
export function formatPhoneNumber(phone: string): string {
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato para números de España
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Formato internacional
  if (cleaned.length > 9) {
    const countryCode = cleaned.slice(0, cleaned.length - 9);
    const number = cleaned.slice(-9);
    return `+${countryCode} ${number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}`;
  }
  
  return cleaned;
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Genera un color basado en un string (para avatares)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#2563EB', // primary-600
    '#1D4ED8', // primary-700
    '#22C55E', // success
    '#F59E0B', // warning
    '#EF4444', // destructive
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
