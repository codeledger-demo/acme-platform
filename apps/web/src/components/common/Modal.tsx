import type { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Modal dialog with overlay, close button, and animated presence.
 */
export function Modal(props: ModalProps): JSX.Element | null {
  const { isOpen, title, children, onClose, size = 'md' } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="presentation"
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full rounded-xl bg-white shadow-xl ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            onClick={onClose}
            aria-label="Close"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
