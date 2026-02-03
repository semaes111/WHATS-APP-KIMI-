'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  completed?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  className?: string;
  emptyMessage?: string;
  showCheckbox?: boolean;
  onTaskToggle?: (taskId: string) => void;
}

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Alta',
  },
  medium: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Media',
  },
  low: {
    icon: Circle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Baja',
  },
};

export function TaskList({
  tasks,
  className,
  emptyMessage = 'No hay tareas pendientes',
  showCheckbox = false,
  onTaskToggle,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {tasks.map((task) => {
        const config = priorityConfig[task.priority];
        const Icon = config.icon;

        return (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-all',
              config.bgColor,
              config.borderColor,
              task.completed && 'opacity-60'
            )}
          >
            {showCheckbox && (
              <button
                onClick={() => onTaskToggle?.(task.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-medium text-sm',
                    task.completed && 'line-through text-gray-500'
                  )}
                >
                  {task.title}
                </span>
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    config.bgColor,
                    config.color
                  )}
                >
                  {config.label}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
