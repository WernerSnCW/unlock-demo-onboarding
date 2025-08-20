interface MiniSparkProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniSpark({ 
  data, 
  width = 60, 
  height = 20, 
  color = 'var(--primary)', 
  className = '' 
}: MiniSparkProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}