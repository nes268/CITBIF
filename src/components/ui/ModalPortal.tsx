import { createPortal } from 'react-dom';

export interface ModalPortalProps {
  children: React.ReactNode;
  onBackdropClick?: () => void;
  /** Tailwind classes for the dim layer */
  backdropClassName?: string;
}

/**
 * Mounts modal UI on document.body so the backdrop covers the full viewport.
 * Modals rendered inside dashboard `main` with overflow-auto were clipped to that region.
 */
export function ModalPortal({
  children,
  onBackdropClick,
  backdropClassName = 'bg-black/30',
}: ModalPortalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto" role="presentation">
      <div
        className={`absolute inset-0 z-0 ${backdropClassName}`}
        aria-hidden
        onClick={onBackdropClick}
      />
      <div className="relative z-10 flex min-h-[100dvh] w-full items-center justify-center p-4 py-8 pointer-events-none">
        <div className="pointer-events-auto flex w-full justify-center">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
