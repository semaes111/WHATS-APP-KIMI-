'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';

interface CalendarProps {
  availableDates?: string[]; // Format: YYYY-MM-DD
  className?: string;
  onDateSelect?: (date: Date) => void;
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function Calendar({ availableDates = [], className, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const hasReport = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availableDates.includes(dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const days: JSX.Element[] = [];

  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    days.push(
      <div
        key={`prev-${i}`}
        className="h-10 w-10 flex items-center justify-center text-gray-300 text-sm"
      >
        {daysInPrevMonth - i}
      </div>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayHasReport = hasReport(day);
    const dayIsToday = isToday(day);
    const dayIsSelected = isSelected(day);

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={cn(
          'h-10 w-10 flex items-center justify-center text-sm rounded-lg transition-all relative',
          dayIsSelected
            ? 'bg-blue-600 text-white'
            : dayIsToday
            ? 'bg-blue-100 text-blue-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-100',
          dayHasReport && !dayIsSelected && 'font-semibold'
        )}
      >
        {day}
        {dayHasReport && (
          <div className={cn(
            'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
            dayIsSelected ? 'bg-white' : 'bg-green-500'
          )} />
        )}
      </button>
    );
  }

  // Next month days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 columns = 42
  for (let i = 1; i <= remainingDays; i++) {
    days.push(
      <div
        key={`next-${i}`}
        className="h-10 w-10 flex items-center justify-center text-gray-300 text-sm"
      >
        {i}
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Con informe</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-100" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
