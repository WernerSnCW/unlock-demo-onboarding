// Faint light-grid backdrop used across the onboarding surfaces. Render as the
// first child of a `relative overflow-hidden` container, with the real content
// in a sibling marked `relative z-10`.
export default function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 85% at 50% 0%, #000 60%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 100% 85% at 50% 0%, #000 60%, transparent 100%)',
      }}
      aria-hidden
    />
  );
}
