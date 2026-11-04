import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

const BADGE_VARIANTS = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
} as const;

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  readonly children: ReactNode;
  readonly variant?: keyof typeof BADGE_VARIANTS;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const BUTTON_VARIANTS = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 disabled:bg-blue-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-slate-500 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-500',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900 disabled:bg-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
} as const;

const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
} as const;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: keyof typeof BUTTON_VARIANTS;
  readonly size?: keyof typeof BUTTON_SIZES;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  hint,
  disabled,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly formatValue?: (value: number) => string;
  readonly hint?: string;
  readonly disabled?: boolean;
}) {
  return (
    <label className={cn('block', disabled && 'opacity-60')}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="font-mono text-xs font-semibold text-slate-500">
          {formatValue ? formatValue(value) : value}
        </span>
      </span>
      <input
        type="range"
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 disabled:cursor-not-allowed"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      />
      {hint ? <span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'blue',
}: {
  readonly label: string;
  readonly value: string;
  readonly helper?: string;
  readonly icon?: ReactNode;
  readonly tone?: 'blue' | 'green' | 'amber' | 'violet' | 'slate';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  } as const;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </div>
        {icon ? (
          <div className={cn('rounded-xl p-2', tones[tone])} aria-hidden="true">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-slate-400">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Formula({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-serif text-[15px] leading-7 text-slate-800',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InfoNote({
  children,
  tone = 'blue',
}: {
  readonly children: ReactNode;
  readonly tone?: 'blue' | 'amber' | 'green';
}) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  } as const;
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm leading-6', tones[tone])}>
      {children}
    </div>
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        className,
      )}
      {...props}
    />
  );
}
