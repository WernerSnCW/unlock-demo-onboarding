interface TrustMarkerProps {
  type: 'verified' | 'premium' | 'peer';
  value?: number; // for peer percentage
  className?: string;
}

export default function TrustMarker({ type, value, className = "" }: TrustMarkerProps) {
  if (type === 'verified') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className}`}>
        ✅ Verified
      </span>
    );
  }

  if (type === 'premium') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] ${className}`}>
        🔒 Premium
      </span>
    );
  }

  if (type === 'peer' && value !== undefined) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 ${className}`}>
        📊 Peers: {value}%
      </span>
    );
  }

  return null;
}