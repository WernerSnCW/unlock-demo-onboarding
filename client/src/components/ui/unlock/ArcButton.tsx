import React from 'react';

/**
 * ArcButton — the Unlock primary/outline CTA with the signature "arc-hover" ring
 * that sweeps ~270° around the button on hover (the unlock gesture).
 *
 * Ported from packages/ui/components/buttons/ArcButton.jsx to TSX. Follows the
 * codified CTA convention: square corners, UPPERCASE, normal (400) weight.
 */
export interface ArcButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  full?: boolean;
}

export function ArcButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  full = false,
  style = {},
  className,
  ...rest
}: ArcButtonProps) {
  const [hover, setHover] = React.useState(false);

  const base: React.CSSProperties = {
    position: 'relative',
    fontFamily: 'var(--u-font-body)',
    fontSize: '14px',
    textTransform: 'uppercase',
    fontWeight: 'var(--u-weight-button)' as unknown as number,
    letterSpacing: 'var(--u-tracking-button)',
    padding: '13px 26px',
    borderRadius: 'var(--u-radius-cta)',
    cursor: 'pointer',
    transition: 'all .2s var(--u-ease)',
    width: full ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style,
  };

  const variants: Record<'primary' | 'outline', React.CSSProperties> = {
    primary: {
      background: 'var(--u-green)',
      color: 'var(--u-on-green)',
      border: 'none',
      boxShadow: hover ? 'var(--u-shadow-cta)' : 'none',
    },
    outline: {
      background: hover ? 'rgba(255,255,255,0.08)' : 'transparent',
      color: hover ? 'var(--u-text)' : 'var(--u-text-muted)',
      border: `1px solid ${hover ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant] }}
      className={className}
      {...rest}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: '-4px',
          width: 'calc(100% + 8px)',
          height: 'calc(100% + 8px)',
          pointerEvents: 'none',
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--u-green)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={hover ? 71 : 283}
          style={{ transition: 'stroke-dashoffset .5s var(--u-ease)' }}
        />
      </svg>
      {children}
    </button>
  );
}

export default ArcButton;
