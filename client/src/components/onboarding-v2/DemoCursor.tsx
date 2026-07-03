import { useDemo } from '@/contexts/DemoContext';

export default function DemoCursor() {
  const { active, cursorRect } = useDemo();

  if (!active || !cursorRect) return null;

  const padding = 6;
  const style: React.CSSProperties = {
    position: 'fixed',
    left: cursorRect.left - padding,
    top: cursorRect.top - padding,
    width: cursorRect.width + padding * 2,
    height: cursorRect.height + padding * 2,
    pointerEvents: 'none',
    zIndex: 9998,
    borderRadius: 12,
    border: '2px solid #00bb77',
    boxShadow: '0 0 0 4px rgba(0, 187, 119, 0.25), 0 0 24px rgba(0, 187, 119, 0.35)',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return <div style={style} data-testid="demo-cursor-highlight" />;
}
