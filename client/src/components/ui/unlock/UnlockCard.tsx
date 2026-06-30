import React from 'react';

/**
 * UnlockCard — the base Unlock surface on dark: hairline border, faint fill,
 * small radius. Set `hover` for the feature/tool lift+green-border interaction,
 * or `highlighted` for the green-tinted "most popular" treatment.
 *
 * Ported from packages/ui/components/surfaces/Card.jsx to TSX.
 */
export interface UnlockCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  highlighted?: boolean;
  radius?: 'm' | 'l';
}

export function UnlockCard({
  children,
  hover = false,
  highlighted = false,
  radius = 'm',
  style = {},
  className,
  ...rest
}: UnlockCardProps) {
  const [h, setH] = React.useState(false);
  const radii: Record<'m' | 'l', string> = {
    m: 'var(--u-radius-m)',
    l: 'var(--u-radius-l)',
  };

  const fill = highlighted
    ? 'var(--u-green-fill)'
    : hover && h
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(255,255,255,0.03)';
  const border = highlighted
    ? '1px solid rgba(0,187,119,0.3)'
    : `1px solid ${hover && h ? 'rgba(0,187,119,0.25)' : 'var(--u-border)'}`;

  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      className={className}
      style={{
        padding: '26px',
        borderRadius: radii[radius] || radii.m,
        border,
        background: fill,
        transition: 'background .3s var(--u-ease), border-color .3s var(--u-ease)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default UnlockCard;
