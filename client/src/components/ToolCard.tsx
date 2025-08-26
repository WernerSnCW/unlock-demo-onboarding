interface ToolCardProps {
  icon: string;
  iconColor?: string;
  title: string;
  description: string;
  actionText: string;
  isLocked?: boolean;
  isPremium?: boolean;
  onClick: () => void;
}

export default function ToolCard({ 
  icon, 
  iconColor = "text-[#5193B3]", 
  title, 
  description, 
  actionText, 
  isLocked = false, 
  isPremium = false,
  onClick 
}: ToolCardProps) {
  const getCardTheme = () => {
    if (isPremium && !isLocked) {
      return {
        background: 'bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--secondary)]/5',
        border: 'border-[var(--primary)]/30',
        hoverBorder: 'hover:border-[var(--primary)]',
        shadow: 'hover:shadow-xl hover:shadow-[var(--primary)]/20'
      };
    }
    
    if (isLocked) {
      return {
        background: 'bg-gradient-to-br from-[var(--muted)] to-[var(--muted)]/50',
        border: 'border-[var(--border)]',
        hoverBorder: '',
        shadow: ''
      };
    }
    
    return {
      background: 'bg-gradient-to-br from-[var(--card)] via-[var(--primary)]/5 to-[var(--secondary)]/5',
      border: 'border-[var(--border)]',
      hoverBorder: 'hover:border-[var(--primary)]/60',
      shadow: 'hover:shadow-lg hover:shadow-[var(--primary)]/10'
    };
  };

  const theme = getCardTheme();

  return (
    <div className={`
      ${theme.background} rounded-[var(--radius-lg)] border ${theme.border} 
      p-6 transition-all duration-300 relative group
      ${!isLocked ? `${theme.hoverBorder} ${theme.shadow} hover:-translate-y-1` : 'opacity-75'}
    `}>
      
      {/* Premium Badge for Premium Tools or Locked Tools */}
      {(isPremium || isLocked) && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-block bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-[var(--accent-foreground)] px-3 py-1 rounded-full text-xs font-bold" style={{ boxShadow: 'var(--shadow-md)' }}>
            <i className="fas fa-crown mr-1" aria-hidden="true"></i>
            PRO
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-full">
        
        {/* Icon with Brand Colors */}
        <div className="mb-4">
          <div className={`
            w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center relative overflow-hidden
            ${(isPremium || isLocked)
              ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]' 
              : 'bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/20'
            }
          `} style={(isPremium || isLocked) ? { boxShadow: 'var(--shadow-md)' } : {}}>
            <i className={`
              ${icon} text-2xl transition-transform duration-200 group-hover:scale-110
              ${(isPremium || isLocked)
                ? 'text-white' 
                : iconColor || 'text-[var(--primary)]'
              }
            `} aria-hidden="true"></i>
            
            {/* Subtle shine effect for premium/locked */}
            {(isPremium || isLocked) && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </div>
        </div>

        {/* Title with Brand Colors */}
        <h3 className={`
          text-lg font-semibold mb-2 transition-colors duration-200
          ${(isPremium || isLocked)
            ? 'text-[var(--primary)]' 
            : 'text-[var(--card-foreground)] group-hover:text-[var(--primary)]'
          }
        `}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--muted-foreground)] mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        {/* Enhanced Action Button */}
        <button
          onClick={onClick}
          disabled={isLocked}
          className={`
            w-full py-3 px-4 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${isLocked 
              ? 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed' 
              : (isPremium || isLocked)
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 text-[var(--primary-foreground)] transform hover:-translate-y-0.5'
                : 'bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] transform hover:-translate-y-0.5'
            }
          `} style={!isLocked ? { boxShadow: 'var(--shadow-md)' } : {}}
        >
          {isLocked ? (
            <>
              <i className="fas fa-lock text-sm" aria-hidden="true"></i>
              Preview Only
            </>
          ) : (
            <>
              <span>{actionText}</span>
              <i className="fas fa-arrow-right text-xs opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" aria-hidden="true"></i>
            </>
          )}
        </button>

      </div>
    </div>
  );
}