interface RoleBadgeProps {
  role: 'investor' | 'lead' | 'company';
  verified?: boolean;
}

export default function RoleBadge({ role, verified }: RoleBadgeProps) {
  const getRoleConfig = () => {
    switch (role) {
      case 'company':
        return {
          label: verified ? 'Company – Verified' : 'Company',
          className: verified 
            ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30' 
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700'
        };
      case 'lead':
        return {
          label: 'Lead Investor',
          className: 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30'
        };
      case 'investor':
        return {
          label: 'Investor',
          className: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
        };
      default:
        return {
          label: 'User',
          className: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      {verified && role === 'company' && (
        <span className="sr-only">Verified company response</span>
      )}
      {config.label}
      {verified && role === 'company' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </span>
  );
}