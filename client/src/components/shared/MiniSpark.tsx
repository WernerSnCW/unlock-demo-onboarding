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

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  // Generate path for sparkline
  const pathData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Optional: Add fill area */}
      <path
        d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
        fill={color}
        fillOpacity="0.1"
      />
    </svg>
  );
}