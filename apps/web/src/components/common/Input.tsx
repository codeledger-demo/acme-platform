import type { ChangeEvent } from 'react';

export interface InputProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function Input(props: InputProps): JSX.Element {
  const {
    label,
    name,
    type = 'text',
    value,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    onChange,
  } = props;

  const inputClasses = [
    'mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm',
    'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
    error ? 'border-red-300' : 'border-neutral-300',
    disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white',
  ].join(' ');

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-neutral-400">{helperText}</p>}
    </div>
  );
}
