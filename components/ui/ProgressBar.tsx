// components/ui/ProgressBar.tsx
'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Client Component - animated progress bar with percentage display
 */
export function ProgressBar({
  current,
  total,
  label,
  animated = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className={`font-medium text-gray-700 ${labelSizeClasses[size]}`}>{label}</span>
          <span className={`font-semibold text-primary-600 ${labelSizeClasses[size]}`}>
            {current} / {total}
          </span>
        </div>
      )}

      {/* Progress bar container */}
      <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size]}`}>
        {/* Progress fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out ${
            animated ? 'animate-pulse-subtle' : ''
          }`}
          style={{
            width: `${percentage}%`,
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Percentage text */}
      <p className="mt-1 text-right text-xs text-gray-600">{Math.round(percentage)}% terminé</p>
    </div>
  );
}
