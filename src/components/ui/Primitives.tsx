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
        'border border-[#808080] bg-white p-3 text-black font-sans',
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
    <div className={cn('mb-4 pb-2 border-b border-[#808080]', className)}>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          {eyebrow ? (
            <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#0000CC] mb-0.5">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-xl font-bold font-serif text-black leading-tight">{title}</h1>
          {description ? <p className="mt-1 text-xs text-[#555555] font-sans">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2 mt-2 sm:mt-0">{actions}</div> : null}
      </div>
    </div>
  );
}

const BADGE_VARIANTS = {
  neutral: 'border-[#808080] bg-[#EEEEEE] text-black',
  blue: 'border-[#0000CC] bg-[#E5ECF9] text-[#0000CC]',
  green: 'border-[#008000] bg-[#EDFFE1] text-[#006000]',
  amber: 'border-[#D0A600] bg-[#FFFFE0] text-[#745B00]',
  red: 'border-[#BC0000] bg-[#FFF0F0] text-[#BC0000]',
  violet: 'border-[#00008B] bg-[#E0E0FF] text-[#00008B]',
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
        'inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] font-mono select-none',
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
    'bg-[#EFEFEF] text-black border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white hover:bg-[#E5E5E5]',
  secondary:
    'bg-[#EFEFEF] text-black border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white hover:bg-[#E5E5E5]',
  ghost: 'text-[#0000CC] underline hover:text-[#CC0000] bg-transparent border-0',
  dark: 'bg-[#EFEFEF] font-bold text-black border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white hover:bg-[#E5E5E5]',
  danger: 'bg-[#FFF0F0] text-[#BC0000] border-2 border-[#BC0000] hover:bg-[#FFE5E5]',
} as const;

const BUTTON_SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
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
        'inline-flex items-center justify-center gap-1 font-sans cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',
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
    <label className={cn('block font-sans', disabled && 'opacity-60')}>
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-bold text-black">{label}</span>
        <span className="font-mono text-xs text-[#0000CC] font-bold">
          {formatValue ? formatValue(value) : value}
        </span>
      </span>
      <input
        type="range"
        className="mt-1 w-full cursor-pointer accent-[#0000CC]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      />
      {hint ? <span className="mt-0.5 block text-[11px] text-[#555555]">{hint}</span> : null}
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
    blue: 'border-[#0000CC] bg-[#F8F9FA]',
    green: 'border-[#008000] bg-[#F8FFF8]',
    amber: 'border-[#D0A600] bg-[#FFFFF0]',
    violet: 'border-[#00008B] bg-[#F8F8FF]',
    slate: 'border-[#808080] bg-[#FFFFFF]',
  } as const;

  return (
    <div className={cn('border p-3 text-black font-sans', tones[tone])}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#555555]">{label}</p>
          <p className="mt-1 text-xl font-bold font-serif text-black">{value}</p>
          {helper ? <p className="mt-0.5 text-[11px] text-[#666666]">{helper}</p> : null}
        </div>
        {icon ? <div className="text-black text-sm" aria-hidden="true">{icon}</div> : null}
      </div>
    </div>
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
    <div className="flex flex-col items-center justify-center border border-dashed border-[#808080] bg-[#FAFAFA] p-6 text-center font-sans">
      {icon ? <div className="mb-2 text-[#808080]">{icon}</div> : null}
      <h3 className="text-sm font-bold text-black">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-[#555555]">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
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
        'overflow-x-auto border border-[#808080] bg-[#EEEEEE] p-3 font-serif text-sm leading-normal text-black',
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
    blue: 'border-[#7F9DB9] bg-[#E5ECF9] text-[#00006E]',
    amber: 'border-[#D0A600] bg-[#FFFFE0] text-[#4F3D00]',
    green: 'border-[#008000] bg-[#EDFFE1] text-[#002200]',
  } as const;
  return (
    <div className={cn('border p-2.5 text-xs leading-normal font-sans', tones[tone])}>
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
      className={cn('select-retro', className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('input-retro', className)}
      {...props}
    />
  );
}
